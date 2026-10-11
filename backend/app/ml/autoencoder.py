import numpy as np

class AutoencoderDetector:
    def __init__(self, input_dim=5, hidden=16):
        self.input_dim = input_dim
        self.hidden = hidden
        self.model = None
        self.threshold = None
        self._mean = None

    def fit(self, X):
        self._mean = X.mean(axis=0)
        errors = np.abs(X - self._mean).sum(axis=1)
        self.threshold = float(np.percentile(errors, 95))
        return self

    def predict(self, X):
        errors = np.abs(X - self._mean).sum(axis=1)
        return errors > self.threshold

    def score(self, X):
        errors = np.abs(X - self._mean).sum(axis=1)
        return errors / (self.threshold + 1e-9)