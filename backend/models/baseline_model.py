from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix

class BaselineClaimDetector:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.model = LogisticRegression()

    def train(self, texts, labels):
        X_train = self.vectorizer.fit_transform(texts)
        self.model.fit(X_train, labels)

    def predict(self, texts):
        X_test = self.vectorizer.transform(texts)
        return self.model.predict(X_test)
    
    def evaluate(self, texts, labels):
        # Get predictions
        predictions = self.predict(texts)

        # Compare with true labels
        precision = precision_score(labels, predictions)
        recall = recall_score(labels, predictions)
        f1 = f1_score(labels, predictions)
        accuracy = accuracy_score(labels, predictions)
        cm = confusion_matrix(labels, predictions)

        # Compute confusion matrix
        print(f"Confusion Matrix: {cm}")

        return {
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "accuracy": accuracy,
            "confusion_matrix": cm
        }
    
if __name__ == "__main__":
    # Example usage
    texts = [
        "This is a claim about something important.",
        "This is just a regular statement.",
        "Another claim that needs verification.",
        "Just some random text without claims."
    ]
    labels = [1, 0, 1, 0]  # 1 for claim, 0 for non-claim

    model = BaselineClaimDetector()
    model.train(texts, labels)

    test_texts = [
        "This statement is definitely a claim.",
        "Nothing special about this text."
    ]
    test_labels = [1, 0]

    results = model.evaluate(test_texts, test_labels)
    print(results)