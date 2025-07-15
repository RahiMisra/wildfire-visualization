import os
import pandas as pd
import cudf
import cupy as cp
import joblib
from cuml.svm import SVC as cuSVM
from cuml.naive_bayes import GaussianNB as cuGNB
import numpy as np
from torch.utils.data import Dataset, DataLoader
import faiss  # Don't forget to import FAISS

# === Constants ===
YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
DATA_PATH = "/home/geo-info/Data"
CHUNK_SIZE = 200_000  # Tune this depending on your RAM/GPU memory


# === Custom Dataset ===
class FireDataset(Dataset):
    def __init__(self, X, y):
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


# === Load CSVs in chunks, convert to cudf, and concatenate ===
def load_data(csv_files):
    cudf_dfs = []
    for file in csv_files:
        print(f"Loading file in chunks: {file}")
        for chunk in pd.read_csv(file, chunksize=CHUNK_SIZE):
            # Drop NaNs early to reduce memory usage
            chunk = chunk.dropna()

            if 'Date' in chunk.columns:
                chunk['Date'] = pd.to_datetime(chunk['Date'])
                chunk['Date'] = (chunk['Date'].astype(np.int64) // 10**9)

            cudf_chunk = cudf.DataFrame.from_pandas(chunk)
            cudf_dfs.append(cudf_chunk)

    combined_df = cudf.concat(cudf_dfs, ignore_index=True)
    return combined_df


# === Training ===
def train_models(X, y, batch_size=1024, num_workers=4):
    svm_model = cuSVM(kernel='linear', probability=True, C=1.0)
    gnb_model = cuGNB()

    dataset = FireDataset(X.to_numpy(), y.to_numpy())
    data_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)

    print("Fitting models...")
    for batch_X, batch_y in data_loader:
        batch_X_cu = cp.asarray(batch_X.astype('float32'))
        batch_y_cu = cp.asarray(batch_y.astype('int32'))

        print("Fitting SVM")
        svm_model.fit(batch_X_cu, batch_y_cu)

        print("Fitting GNB")
        gnb_model.fit(batch_X_cu, batch_y_cu)

    print("Fitting KNN with FAISS")
    X_np = X.to_numpy().astype('float32')
    index = faiss.IndexFlatL2(X_np.shape[1])
    index.add(X_np)

    return svm_model, gnb_model, index


# === Saving ===
def save_models(svm_model, gnb_model, knn_index, prefix):
    joblib.dump(svm_model, f'{prefix}_svm_model.joblib')
    joblib.dump(gnb_model, f'{prefix}_gnb_model.joblib')
    faiss.write_index(knn_index, f'{prefix}_knn_index.index')
    print(f"Models saved with prefix '{prefix}'.")


# === Main ===
def main():
    csv_files = [
        os.path.join(DATA_PATH, f"{year}data_Elevation.csv")
        for year in YEARS
    ]
    print("Loading data...")
    data = load_data(csv_files)
    print("Data loaded successfully.")

    X = data.drop(columns=['Fire'])
    y = data['Fire']

    X = X.astype('float32')

    print("Training models...")
    svm_model, gnb_model, knn_index = train_models(X, y)

    save_models(svm_model, gnb_model, knn_index, "cumulative")


if __name__ == "__main__":
    main()
