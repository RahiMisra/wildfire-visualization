import os
import pandas as pd
import numpy as np

# --- Configuration ---
YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
FEATURES = ['Latitude', 'Longitude', 'Elevation', 'EVI', 'TA', 'LST', 'Wind', 'Fire']

# Paths
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = "/home/geo-info/Data"
OUTPUT_PATH = os.path.join(BASE_PATH, "data")
os.makedirs(OUTPUT_PATH, exist_ok=True)

# Output file
output_file = os.path.join(OUTPUT_PATH, "all_years_summary.csv")

# --- Processing ---
summary_rows = []

for year in YEARS:
    input_file = os.path.join(DATA_PATH, f"{year}data_Elevation.csv")
    print(f"Processing {input_file}...")

    try:
        df = pd.read_csv(input_file, usecols=['Date'] + FEATURES)

        year_summary = {'Year': year}
        year_summary['count'] = len(df)

        for feature in FEATURES:
            values = df[feature].dropna()
            if values.empty:
                stats = {
                    f'{feature}_min': np.nan,
                    f'{feature}_q1': np.nan,
                    f'{feature}_median': np.nan,
                    f'{feature}_q3': np.nan,
                    f'{feature}_max': np.nan,
                    f'{feature}_mean': np.nan,
                    f'{feature}_std': np.nan
                }
            else:
                stats = {
                    f'{feature}_min': values.min(),
                    f'{feature}_q1': values.quantile(0.25),
                    f'{feature}_median': values.median(),
                    f'{feature}_q3': values.quantile(0.75),
                    f'{feature}_max': values.max(),
                    f'{feature}_mean': values.mean(),
                    f'{feature}_std': values.std()
                }
            year_summary.update(stats)

        summary_rows.append(year_summary)

    except Exception as e:
        print(f"Error processing {year}: {e}")

# --- Save ---
summary_df = pd.DataFrame(summary_rows)
summary_df.to_csv(output_file, index=False)
print(f"\nSaved all-year summary to {output_file}")
