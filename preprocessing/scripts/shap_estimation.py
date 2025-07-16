import os
import csv
from datetime import datetime

# === Configuration ===
YEAR = '2020'
DATE = datetime(int(YEAR), 1, 1)  # Only needed if you want to filter
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = "/home/geo-info/Data"
INPUT_FILE = os.path.join(DATA_PATH, f"{YEAR}data_Elevation.csv")

OUTPUT_PATH = os.path.join(BASE_PATH, "data")
os.makedirs(OUTPUT_PATH, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_PATH, f"shap_values_{YEAR}.csv")

# === SHAP Fields ===
shap_features = ['EVI', 'TA', 'LST', 'Wind', 'Elevation']

# === Processing ===
with open(INPUT_FILE, 'r', newline='') as infile, open(OUTPUT_FILE, 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = ['Date', 'Latitude', 'Longitude'] + \
                 ['Date_shap', 'Latitude_shap', 'Longitude_shap'] + \
                 [f"{feat}_shap" for feat in shap_features]

    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        out_row = {
            'Date': row['Date'],
            'Latitude': row['Latitude'],
            'Longitude': row['Longitude'],
            'Date_shap': 0.0,
            'Latitude_shap': 0.0,
            'Longitude_shap': 0.0,
        }

        for feat in shap_features:
            out_row[f"{feat}_shap"] = 0.0

        writer.writerow(out_row)

print(f"SHAP placeholder CSV written to: {OUTPUT_FILE}")
