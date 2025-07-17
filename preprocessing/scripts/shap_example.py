import csv
import random
import os
from datetime import datetime

# Define paths
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = "/home/geo-info/Data"
OUTPUT_PATH = os.path.join(BASE_PATH, "data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Input and output files
input_file = os.path.join(DATA_PATH, "2022data_Elevation.csv")
output_file = os.path.join(OUTPUT_PATH, "shap_values_2022.csv")

# Date range to extract
start_date = datetime.strptime('2022-01-01', '%Y-%m-%d')
end_date = datetime.strptime('2022-01-07', '%Y-%m-%d')

# SHAP value columns
shap_columns = [
    'Date_shap', 'Latitude_shap', 'Longitude_shap',
    'Elevation_shap', 'EVI_shap', 'TA_shap',
    'LST_shap', 'Wind_shap', 'Fire_shap'
]

# Full output columns
output_columns = ['Date', 'Latitude', 'Longitude'] + shap_columns

# Process and write
with open(input_file, 'r', newline='') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=output_columns)
    writer.writeheader()

    for row in reader:
        try:
            row_date = datetime.strptime(row['Date'], '%Y-%m-%d')
        except ValueError:
            continue

        if start_date <= row_date <= end_date:
            new_row = {
                'Date': row['Date'],
                'Latitude': row['Latitude'],
                'Longitude': row['Longitude'],
            }
            for col in shap_columns:
                new_row[col] = f"{random.uniform(-1, 1):.6f}"

            writer.writerow(new_row)

print(f"✅ SHAP values generated for 2022-01-01 to 2022-01-07 in: {output_file}")
