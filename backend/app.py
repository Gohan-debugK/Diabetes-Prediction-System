from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model and scaler
MODEL_PATH = 'diabetes_model.pkl'
SCALER_PATH = 'scaler.pkl'

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"Model and scaler loaded successfully!")
except FileNotFoundError as e:
    print(f"Error: {e}")
    print("Please run train_and_save_model.py first to generate the model files.")
    model = None
    scaler = None

# Feature order must match the training data
FEATURE_ORDER = [
    'HighBP', 'HighChol', 'CholCheck', 'BMI', 'Smoker', 'Stroke',
    'HeartDiseaseorAttack', 'PhysActivity', 'Fruits', 'Veggies',
    'HvyAlcoholConsump', 'AnyHealthcare', 'NoDocbcCost', 'GenHlth',
    'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 'Education', 'Income'
]

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict diabetes risk based on input features
    """
    if model is None or scaler is None:
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        # Get input data from request
        data = request.get_json()
        
        # Create a dictionary with all features, using defaults for missing ones
        features = {}
        
        # Map input fields to feature names
        features['HighBP'] = float(data.get('highBP', 0))
        features['HighChol'] = float(data.get('highChol', 0))
        features['CholCheck'] = float(data.get('cholCheck', 1))  # Default: checked
        features['BMI'] = float(data.get('bmi', 25.0))
        features['Smoker'] = float(data.get('smoker', 0))
        features['Stroke'] = float(data.get('stroke', 0))
        features['HeartDiseaseorAttack'] = float(data.get('heartDiseaseorAttack', 0))
        features['PhysActivity'] = float(data.get('physActivity', 1))
        features['Fruits'] = float(data.get('fruits', 1))
        features['Veggies'] = float(data.get('veggies', 1))
        features['HvyAlcoholConsump'] = float(data.get('hvyAlcoholConsump', 0))
        features['AnyHealthcare'] = float(data.get('anyHealthcare', 1))
        features['NoDocbcCost'] = float(data.get('noDocbcCost', 0))
        features['GenHlth'] = float(data.get('genHlth', 3))  # Default: Good (3)
        features['MentHlth'] = float(data.get('mentHlth', 0))
        features['PhysHlth'] = float(data.get('physHlth', 0))
        features['DiffWalk'] = float(data.get('diffWalk', 0))
        features['Sex'] = float(data.get('sex', 0))  # 0: Female, 1: Male
        features['Age'] = float(data.get('age', 5))  # Default: middle age
        features['Education'] = float(data.get('education', 3))  # Default: Some college
        features['Income'] = float(data.get('income', 5))  # Default: middle income
        
        # Create DataFrame with features in correct order
        feature_array = np.array([[features[feat] for feat in FEATURE_ORDER]])
        
        # Scale the features
        scaled_features = scaler.transform(feature_array)
        
        # Make prediction
        prediction = model.predict(scaled_features)[0]
        prediction_proba = model.predict_proba(scaled_features)[0]
        
        # Return result
        result = {
            'prediction': int(prediction),
            'probability': {
                'no_diabetes': float(prediction_proba[0]),
                'diabetes': float(prediction_proba[1])
            },
            'message': 'High risk of diabetes' if prediction == 1 else 'Low risk of diabetes'
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'Prediction error: {str(e)}'
        }), 400

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Diabetes Detection API',
        'endpoints': {
            '/api/health': 'GET - Health check',
            '/api/predict': 'POST - Predict diabetes risk'
        }
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')

