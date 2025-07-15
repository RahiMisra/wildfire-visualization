import os
import cuml
import cudf
import cupy as cp
import joblib
import numpy as np
import pandas as pd
# print("cuML version:", cuml.__version__)
# print("cuDF version:", cudf.__version__)

# Load GPU models
svm_clf = joblib.load("svm_model_2013.joblib")
gnb_clf = joblib.load("gnb_model_2013.joblib")

def process_year_file_on_gpu(csv_path, output_csv, chunksize=100_000):
    print(f"Processing {csv_path}...")

    # Write header to output
    with open(output_csv, 'w') as f_out:
        f_out.write("Date,Latitude,Longitude,FirePrediction\n")

    for chunk in pd.read_csv(csv_path, chunksize=chunksize, parse_dates=['Date']):
        chunk = chunk.dropna()
        # Keep original columns for output
        dates = chunk['Date']
        lats = chunk['Latitude']
        longs = chunk['Longitude']

        # Convert 'Date' to UNIX timestamp if it exists
        if 'Date' in chunk.columns:
            chunk['Date'] = pd.to_datetime(chunk['Date'])
            chunk['Date'] = chunk['Date'].astype(np.int64) // 10 ** 9

        # Drop 'Fire' column if it exists
        if 'Fire' in chunk.columns:
            features = chunk.drop(columns=['Fire'])
        else:
            features = chunk

        # Ensure features are float32
        features = features.astype('float32')
        # print("Feature columns and dtypes:")
        # print(features.dtypes)
        # print(features.isnull().sum())
        # print(np.isfinite(features).all())
        # print(type(features))


        # Move to GPU
        features_gpu = cudf.DataFrame.from_pandas(features)
        # print(type(features_gpu))

        # Predict with each model
        svm_pred = svm_clf.predict(features_gpu)
        # gnb_pred_gpu = gnb_clf.predict(features_gpu)

        # Bring back to CPU memory
        # svm_pred = svm_pred_gpu.get()
        # gnb_pred = gnb_pred_gpu.get()

        # Majority voting
        # ensemble_pred = np.array([
        #     np.bincount([s, g]).argmax() for s, g in zip(svm_pred, gnb_pred)
        # ])

        # Write predictions to output
        result_df = pd.DataFrame({
            "Date": dates,
            "Latitude": lats,
            "Longitude": longs,
            "FirePrediction": svm_pred.to_pandas()
        })

        result_df.to_csv(output_csv, mode='a', header=False, index=False)

    print(f"✅ Done: {output_csv}")

if __name__ == "__main__":
    YEARS = ['2020', '2021']
    BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    DATA_PATH = "/home/geo-info/Data"
    OUTPUT_PATH = os.path.join(BASE_PATH, "data")
    os.makedirs(OUTPUT_PATH, exist_ok=True)

    for year in YEARS:
        input_file = os.path.join(DATA_PATH, f"{year}data_Elevation.csv")
        output_file = os.path.join(OUTPUT_PATH, f"predictions_{year}.csv")
        process_year_file_on_gpu(input_file, output_file)
