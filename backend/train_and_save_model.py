"""
Script to train the model and save it for the Flask API
Run this script to generate diabetes_model.pkl and scaler.pkl
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load data
print("Loading data...")
df = pd.read_csv('diabetes.csv')

# Convert to binary target
df["Diabetes"] = df["Diabetes_012"].apply(lambda x: 1 if x == 2 else 0)
df.drop(columns=["Diabetes_012"], inplace=True)

# Prepare features and target
X = df.drop("Diabetes", axis=1)
y = df["Diabetes"]

# Feature scaling
print("Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Train Random Forest model (using the same parameters as in notebook)
print("Training model...")
model = RandomForestClassifier(
    n_estimators=50,
    max_depth=10,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("\nModel Performance:")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")

# Save model and scaler
print("\nSaving model and scaler...")
joblib.dump(model, 'diabetes_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
print("Model and scaler saved successfully!")

