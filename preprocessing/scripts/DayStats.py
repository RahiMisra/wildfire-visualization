import os
import csv
import math
from collections import defaultdict
from tqdm import tqdm
import numpy as np

YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']

FEATURES = ['Latitude', 'Longitude', 'Elevation', 'EVI', 'TA', 'LST', 'Wind', 'Fire']

BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = "/home/geo-info/Data"
OUTPUT_PATH = os.path.join(BASE_PATH, "data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

os.makedirs(OUTPUT_PATH, exist_ok=True)

def compute_summary(date, feature_buffer):
    """Compute summary stats for a single date from buffered values."""
    summary = {'Date': date}
    count = len(next(iter(feature_buffer.values()), []))
    summary['count'] = count

    for feature in FEATURES:
        values = feature_buffer.get(feature, [])
        if not values:
            summary.update({
                f'{feature}_min': 'nan',
                f'{feature}_q1': 'nan',
                f'{feature}_median': 'nan',
                f'{feature}_q3': 'nan',
                f'{feature}_max': 'nan',
                f'{feature}_mean': 'nan',
                f'{feature}_std': 'nan',
            })
            continue

        values = np.array(values)
        summary.update({
            f'{feature}_min': np.min(values),
            f'{feature}_q1': np.percentile(values, 25),
            f'{feature}_median': np.median(values),
            f'{feature}_q3': np.percentile(values, 75),
            f'{feature}_max': np.max(values),
            f'{feature}_mean': np.mean(values),
            f'{feature}_std': np.std(values),
        })
    return summary

for year in YEARS:
    input_file = os.path.join(DATA_PATH, f"{year}data_Elevation.csv")
    output_file = os.path.join(OUTPUT_PATH, f"{year}_daily_summary.csv")

    print(f"Processing {input_file}")

    with open(input_file, 'r') as f_in, open(output_file, 'w', newline='') as f_out:
        reader = csv.DictReader(f_in)
        fieldnames = ['Date', 'count'] + [
            f"{feature}_{stat}" for feature in FEATURES for stat in ['min', 'q1', 'median', 'q3', 'max', 'mean', 'std']
        ]
        writer = csv.DictWriter(f_out, fieldnames=fieldnames)
        writer.writeheader()

        current_date = None
        feature_buffer = defaultdict(list)

        for row in tqdm(reader, desc=f"Year {year}"):
            date = row['Date']

            if current_date and date != current_date:
                summary = compute_summary(current_date, feature_buffer)
                writer.writerow(summary)
                feature_buffer = defaultdict(list)
            current_date = date

            for feature in FEATURES:
                try:
                    value = float(row[feature])
                    if not math.isnan(value):
                        feature_buffer[feature].append(value)
                except:
                    continue

        # Final date at end of file
        if current_date and feature_buffer:
            summary = compute_summary(current_date, feature_buffer)
            writer.writerow(summary)

    print(f"Saved summary for {year} to {output_file}")
