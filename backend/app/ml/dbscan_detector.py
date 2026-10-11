import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

class DBSCANDetector:
    def __init__(self, eps=0.5, min_samples=5):
        self.eps = eps
        self.min_samples = min_samples
        self.scaler = StandardScaler()
        self.labels_ = None

    def fit_predict(self, X):
        Xs = self.scaler.fit_transform(X)
        model = DBSCAN(eps=self.eps, min_samples=self.min_samples)
        self.labels_ = model.fit_predict(Xs)
        return self.labels_

    def predict(self, X):
        if self.labels_ is None:
            return np.zeros(len(X), dtype=bool)
        return self.labels_[:len(X)] == -1

    def score(self, X):
        if self.labels_ is None:
            return np.zeros(len(X))
        return (self.labels_[:len(X)] == -1).astype(float)