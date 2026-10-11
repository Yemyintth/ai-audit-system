import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

class AuditorMLBot:
    def __init__(self):
        self.scaler = StandardScaler()
        self.iso = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.svm = OneClassSVM(kernel='rbf', nu=0.05, gamma='scale')
    def fit(self, df):
        X = df[['amount']].fillna(0)
        Xs = self.scaler.fit_transform(X)
        self.iso.fit(Xs)
        self.svm.fit(Xs)
        return self
    def detect(self, df):
        X = df[['amount']].fillna(0)
        Xs = self.scaler.transform(X)
        df = df.copy()
        df['score'] = self.iso.decision_function(Xs)
        df['suspicious'] = df['score'] < 0
        return df
