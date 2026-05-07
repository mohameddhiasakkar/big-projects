from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.compose import ColumnTransformer

# =========================
# 1. LOAD DATA
# =========================
df = pd.read_csv("contry.csv")
df.columns = df.columns.str.strip()

# =========================
# 2. FEATURES
# =========================
categorical_features = ["country", "major", "language"]
numeric_features = ["moyenne", "tuition_tier"]

# =========================
# 3. PREPROCESSING PIPELINE
# =========================
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", MinMaxScaler(), numeric_features)
    ]
)

X = preprocessor.fit_transform(df)

# =========================
# 4. KNN MODEL
# =========================
K = 20  # bigger pool for better ranking stability
knn_model = NearestNeighbors(n_neighbors=K, metric="euclidean")
knn_model.fit(X)

# =========================
# 5. FASTAPI APP
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 6. REQUEST MODEL
# =========================
class Student(BaseModel):
    country: str
    major: str
    language: str
    moyenne: float
    tuition_tier: int
    k: int = 5

# =========================
# 7. METADATA
# =========================
@app.get("/metadata")
def metadata():
    return {
        "countries": sorted(df["country"].unique().tolist()),
        "majors": sorted(df["major"].unique().tolist()),
        "languages": sorted(df["language"].unique().tolist()),
        "tuition_tiers": sorted(df["tuition_tier"].unique().astype(int).tolist())
    }

# =========================
# 8. RECOMMEND (PURE KNN - CORRECT)
# =========================
@app.post("/recommend")
def recommend(student: Student):

    # 1. Build user vector
    user_df = pd.DataFrame([{
        "country": student.country,
        "major": student.major,
        "language": student.language,
        "moyenne": student.moyenne,
        "tuition_tier": student.tuition_tier
    }])

    user_vector = preprocessor.transform(user_df)

    # 2. KNN search
    distances, indices = knn_model.kneighbors(user_vector, n_neighbors=K)

    # 3. Build results (NO EXTRA SCORING — keep it mathematically correct)
    results = []

    for i, idx in enumerate(indices[0]):
        inst = df.iloc[idx]
        dist = float(distances[0][i])

        results.append({
            "institution": inst["institution_name"],
            "country": inst["country"],
            "major": inst["major"],
            "language": inst["language"],
            "moyenne": float(inst["moyenne"]),
            "tuition_tier": int(inst["tuition_tier"]),
            "distance": dist,
            "similarity": round(1 / (1 + dist), 4)
        })

    # 4. Sort by pure KNN distance (correct ranking)
    results = sorted(results, key=lambda x: x["distance"])

    return {
        "recommendations": results[:student.k]
    }

# =========================
# 9. RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)