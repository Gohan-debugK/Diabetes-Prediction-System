import { useState } from "react";
import { HeartPulse, Info, Loader2 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function DiabetesPrediction() {
  const [formData, setFormData] = useState({
    bmi: "",
    age: "",
    highBP: "0",
    highChol: "0",
    smoker: "0",
    physActivity: "1",
    stroke: "0",
    heartDiseaseorAttack: "0",
    sex: "0",
    genHlth: "3",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to get prediction";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          if (response.status === 404) {
            errorMessage = `URL not found. Please check if the backend server is running on ${API_URL}`;
          } else if (response.status === 500) {
            errorMessage = "Server error. Please check the backend logs.";
          } else {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      let errorMessage = err.message;
      
      // Handle network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = `Cannot connect to backend server at ${API_URL}. Please make sure the server is running on port 5001.`;
      }
      
      setError(errorMessage);
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const Tooltip = ({ text }) => (
    <span className="ml-1 text-gray-400" title={text}>
      <Info size={14} />
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <HeartPulse size={34} />
            <div>
              <h1 className="text-2xl font-bold">Diabetes Risk Assessment</h1>
              <p className="text-sm opacity-90">Clinical decision support system</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* BMI */}
          <div>
            <label className="text-sm font-semibold flex items-center">
              Body Mass Index (BMI)
              <Tooltip text="BMI is a measure of body fat based on height and weight" />
            </label>
            <input
              type="number"
              step="0.1"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder="Eg: 24.5"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* Age Group */}
          <div>
            <label className="text-sm font-semibold flex items-center">
              Age Group
              <Tooltip text="Age is encoded into ranges as used in the dataset" />
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            >
              <option value="">Select age range</option>
              <option value="1">18–24</option>
              <option value="2">25–29</option>
              <option value="3">30–34</option>
              <option value="4">35–39</option>
              <option value="5">40–44</option>
              <option value="6">45–49</option>
              <option value="7">50–54</option>
              <option value="8">55–59</option>
              <option value="9">60–64</option>
              <option value="10">65–69</option>
              <option value="11">70–74</option>
              <option value="12">75–79</option>
              <option value="13">80+ years</option>
            </select>
          </div>

          {/* Clinical Factors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold flex items-center">
                High Blood Pressure
                <Tooltip text="Diagnosed hypertension increases diabetes risk" />
              </label>
              <select
                name="highBP"
                value={formData.highBP}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center">
                High Cholesterol
                <Tooltip text="High cholesterol is linked to insulin resistance" />
              </label>
              <select
                name="highChol"
                value={formData.highChol}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold flex items-center">
                Smoking Status
                <Tooltip text="Smoking increases the risk of type 2 diabetes" />
              </label>
              <select
                name="smoker"
                value={formData.smoker}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">Non-smoker</option>
                <option value="1">Smoker</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center">
                Physical Activity
                <Tooltip text="Regular physical activity reduces diabetes risk" />
              </label>
              <select
                name="physActivity"
                value={formData.physActivity}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="1">Physically Active</option>
                <option value="0">Not Active</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center">
                Sex
                <Tooltip text="Biological sex" />
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold flex items-center">
                Stroke
                <Tooltip text="Ever told you had a stroke" />
              </label>
              <select
                name="stroke"
                value={formData.stroke}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold flex items-center">
                Heart Disease
                <Tooltip text="Coronary heart disease or myocardial infarction" />
              </label>
              <select
                name="heartDiseaseorAttack"
                value={formData.heartDiseaseorAttack}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center">
              General Health
              <Tooltip text="Would you say that in general your health is..." />
            </label>
            <select
              name="genHlth"
              value={formData.genHlth}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="1">Excellent</option>
              <option value="2">Very Good</option>
              <option value="3">Good</option>
              <option value="4">Fair</option>
              <option value="5">Poor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              "Assess Diabetes Risk"
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-6">
            <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-center">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="px-6 pb-6">
            <div
              className={`rounded-2xl border p-6 text-center ${
                result.prediction === 1
                  ? "bg-gradient-to-r from-red-100 to-orange-100 border-red-300"
                  : "bg-gradient-to-r from-blue-100 to-green-100 border-green-300"
              }`}
            >
              <h2 className="text-xl font-bold mb-3">
                {result.prediction === 1 ? (
                  <span className="text-red-800">High Risk of Diabetes</span>
                ) : (
                  <span className="text-green-800">Low Risk of Diabetes</span>
                )}
              </h2>
              <p className="text-lg font-semibold mb-4">
                {result.prediction === 1
                  ? "⚠️ You may be at risk. Please consult with a healthcare provider."
                  : "✅ Your risk appears to be low. Continue maintaining a healthy lifestyle."}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
                  <span className="font-semibold text-gray-700">Probability of Diabetes:</span>
                  <span className="font-bold text-red-600">
                    {(result.probability.diabetes * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
                  <span className="font-semibold text-gray-700">Probability of No Diabetes:</span>
                  <span className="font-bold text-green-600">
                    {(result.probability.no_diabetes * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}