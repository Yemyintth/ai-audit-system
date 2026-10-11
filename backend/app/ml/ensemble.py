import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

class EnsembleDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        self.iso = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.svm = OneClassSVM(kernel='rbf', nu=0.05, gamma='scale')

    def fit(self, X):
        Xs = self.scaler.fit_transform(X)
        self.iso.fit(Xs)
        self.svm.fit(Xs)
        return self

    def score(self, X):
        Xs = self.scaler.transform(X)
        iso_s = -self.iso.score_samples(Xs)
        svm_s = -self.svm.score_samples(Xs)
        iso_n = (iso_s - iso_s.min()) / (iso_s.max() - iso_s.min() + 1e-9)
        svm_n = (svm_s - svm_s.min()) / (svm_s.max() - svm_s.min() + 1e-9)
        return 0.5 * iso_n + 0.5 * svm_n

    def predict(self, X, threshold=0.7):
        return self.score(X) > threshold