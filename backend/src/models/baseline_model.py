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
        precision = precision_score(labels, predictions, average='weighted', zero_division=0)
        recall = recall_score(labels, predictions, average='weighted', zero_division=0)
        f1 = f1_score(labels, predictions, average='weighted', zero_division=0)
        accuracy = accuracy_score(labels, predictions)
        cm = confusion_matrix(labels, predictions)

        return {
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "accuracy": accuracy,
            "confusion_matrix": cm
        }
    
if __name__ == "__main__":
    # Example usage
    from src.data.loaders import load_claimbuster_data, split_train_test
    import numpy as np
    from sklearn.metrics import classification_report

    # Start by loading data from dataset
    pandas_df = load_claimbuster_data()
    x_train, y_test = split_train_test(pandas_df)

    # Prepare training and testing data
    train_texts = x_train["Text"]
    train_labels = x_train["Verdict"]
    test_texts = y_test["Text"]
    test_labels = y_test["Verdict"]

    # Initialize and train the model
    print("Training model... Can take some time!")
    model = BaselineClaimDetector()
    model.train(train_texts, train_labels)

    # Evaluate the model
    results = model.evaluate(test_texts, test_labels)
    
    # Display overall metrics
    print("=" * 60)
    print("BASELINE MODEL EVALUATION RESULTS")
    print("=" * 60)
    print(f"\nOverall Metrics:")
    print(f"  Accuracy:  {results['accuracy']:.4f} ({results['accuracy']*100:.2f}%)")
    print(f"  Precision: {results['precision']:.4f} ({results['precision']*100:.2f}%)")
    print(f"  Recall:    {results['recall']:.4f} ({results['recall']*100:.2f}%)")
    print(f"  F1-Score:  {results['f1_score']:.4f} ({results['f1_score']*100:.2f}%)")
    
    # Confusion matrix analysis
    cm = results['confusion_matrix']
    print(f"\nConfusion Matrix:")
    print(cm)
    
    # Per-class metrics
    print(f"\nPer-Class Analysis:")
    predictions = model.predict(test_texts)
    
    for class_idx in range(len(np.unique(test_labels))):
        # True positives, false positives, false negatives
        tp = cm[class_idx, class_idx]
        fn = np.sum(cm[class_idx, :]) - tp
        fp = np.sum(cm[:, class_idx]) - tp
        
        class_accuracy = tp / (tp + fn) if (tp + fn) > 0 else 0
        class_precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        class_recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        
        print(f"\n  Class {class_idx}:")
        print(f"    Instances:  {tp + fn}")
        print(f"    Recall:     {class_recall:.4f} ({class_recall*100:.2f}%)")
        print(f"    Precision:  {class_precision:.4f} ({class_precision*100:.2f}%)")
        print(f"    Accuracy:   {class_accuracy:.4f} ({class_accuracy*100:.2f}%)")
    
    # Detailed classification report
    print(f"\nDetailed Classification Report:")
    class_labels = sorted(np.unique(test_labels))
    print(classification_report(test_labels, predictions, labels=class_labels, zero_division=0))
        
    print("\n" + "=" * 60)