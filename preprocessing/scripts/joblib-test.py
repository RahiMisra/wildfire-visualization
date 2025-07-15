import joblib
import faiss

# Load models
gnb_model = joblib.load("gnb_model_2013.joblib")
svm_model = joblib.load("svm_model_2013.joblib")

# Confirm model types
print("GNB Model Type:", type(gnb_model))
print("SVM Model Type:", type(svm_model))

# Optionally print model attributes
print("GNB Model:", gnb_model)
print("SVM Model:", svm_model)

# Load the index
knn_index = faiss.read_index("knn_index_2013.index")

# Basic info
print("FAISS Index Type:", type(knn_index))
print("Index Dimensions:", knn_index.d)  # feature vector dimension
print("Number of Vectors:", knn_index.ntotal)
