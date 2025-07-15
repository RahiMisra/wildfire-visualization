import os
import joblib
import shap
import numpy as np
import pandas as pd
import cudf
import cupy as cp
import joblib
from datetime import datetime

class CuMLPredictWrapper:
    def __init__(self, model):
        self.model = model

    def predict(self, X):
        # Convert pandas to cuDF
        X_cudf = cudf.DataFrame.from_pandas(pd.DataFrame(X))
        # Run prediction
        preds = self.model.predict(X_cudf)
        # Return as NumPy array
        return cp.asnumpy(preds)

# Load trained SVM model
svm_clf = joblib.load("svm_model_2013.joblib")

# Parameters
YEAR = '2013'
# DATE = '2013-01-01'
DATE = datetime(2013, 1, 1)
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = "/home/geo-info/Data"
OUTPUT_PATH = os.path.join(BASE_PATH, "data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Load prediction results and rename prediction column
print(f"Loading predictions for year {YEAR}")
pred_path = os.path.join(OUTPUT_PATH, f"predictions_{YEAR}.csv")
pred_df = pd.read_csv(pred_path)
pred_df = pred_df.rename(columns={"FirePrediction": "fire_prediction"})
pred_df['Date'] = pd.to_datetime(pred_df['Date'])  # ensure datetime format

# Load original dataset and drop missing values
print(f"Loading dataset for year {YEAR}")
input_file = os.path.join(DATA_PATH, f"{YEAR}data_Elevation.csv")
df = pd.read_csv(input_file, parse_dates=['Date']).dropna()
df['Date'] = pd.to_datetime(df['Date'])  # just to be safe

# Now the merge will work
print(f"merging data for year {YEAR}")
df = df.merge(pred_df, on=['Date', 'Latitude', 'Longitude'], how='inner')

# Filter to only rows with Date = 2013-01-01
df = df[df['Date'] == DATE]

# Optional: check how many rows matched
print(f"✅ Rows with Date = 2013-01-01: {len(df)}")

# After merge, convert to UNIX timestamp if needed
df['Date'] = pd.to_datetime(df['Date'])
df['Date'] = df['Date'].astype(np.int64) // 10 ** 9

# Filter to only rows with positive fire prediction
# df = df[df['fire_prediction'] == 1]
# print(f"Number of positive fire predictions: {len(df)}")

# Drop Fire and fire_prediction columns if present
for col in ['Fire', 'fire_prediction']:
    if col in df.columns:
        df = df.drop(columns=[col])

# Separate metadata and features
# meta_cols = df[['Date', 'Latitude', 'Longitude']].reset_index(drop=True)
features = df.astype('float32')
# features = df.drop(columns=['Date', 'Latitude', 'Longitude']).astype('float32')

# Load background data (mean/median daily summary)
print(f"Loading background data for SHAP values")
# background_path = os.path.join(OUTPUT_PATH, f"{YEAR}_daily_summary.csv")
background_path = os.path.join(OUTPUT_PATH, f"all_years_summary.csv")
background_df = pd.read_csv(background_path)
# background_df = background_df[background_df['Year'] == int(YEAR)]
background_df['Date'] = pd.to_datetime(background_df['Year'].astype(str) + "-01-01")
background_df['Date'] = background_df['Date'].astype(np.int64) // 10 ** 9

# Extract only *_mean columns and strip the _mean suffix
mean_cols = [col for col in background_df.columns if col.endswith('_mean')]
background_features = background_df[mean_cols].copy()
background_features.columns = [col.replace('_mean', '') for col in mean_cols]

# Add Date column to background features
background_features['Date'] = background_df['Date'].values

# Match the columns with the model's expected features
# background_features = background_features[features.columns].sample(n=24, random_state=42).astype('float32')
background_features = background_features[features.columns].astype('float32')
print("Using background features with columns:", background_features.columns.tolist())

# Drop Fire column if it exists
if 'Fire' in background_df.columns:
    background_df = background_df.drop(columns=['Fire'])

# Set up wrapper for CuSVM model
print("Wrapping SVM model for SHAP")
wrapped_model = CuMLPredictWrapper(svm_clf)


# Create SHAP KernelExplainer
print(f"training shap explainer")
# explainer = shap.KernelExplainer(svm_clf.predict, background_features)
explainer = shap.KernelExplainer(wrapped_model.predict, background_features)

# Compute SHAP values
shap_values = explainer.shap_values(features, nsamples=32)
shap_df = pd.DataFrame(shap_values, columns=features.columns)

# Combine metadata and SHAP values
# result_df = pd.concat([meta_cols, shap_df], axis=1)

# Export SHAP values
shap_output_path = os.path.join(OUTPUT_PATH, f"shap_values_{YEAR}.csv")
shap_df.to_csv(shap_output_path, index=False)
print(f"SHAP values saved to {shap_output_path}")
