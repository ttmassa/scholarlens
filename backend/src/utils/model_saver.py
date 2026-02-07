import joblib
import os
import pickle
from datetime import datetime

def save_model(vectorizer, model, metrics: dict, filepath: str, version: float = 1.0):
    # Create dict with all data
    model_data = {
        'vectorizer': vectorizer,
        'model': model,
        'metadata': {
            'version': version,
            'date': datetime.now().isoformat(),
            'accuracy': metrics['accuracy'],
            'f1_score': metrics['f1_score'],
            'precision': metrics['precision'],
            'recall': metrics['recall']
        }
    }

    # Ensure filepath ends with a .joblib file type
    if not filepath.endswith(".joblib"):
        raise ValueError("Filepath must ends with a .joblib file type.")

    # Save model
    joblib.dump(model_data, filepath)

def load_model(filepath: str):
    if not os.path.exists(filepath):
        raise FileNotFoundError("Model file doesn't exist.")
    
    try:
        payload = joblib.load(filepath)
    except (EOFError, pickle.UnpicklingError) as e:
        raise ValueError(f"Invalid/corrupted model file: {e}")

    return payload

if __name__ == "__main__":
    # Ask to save or load a model
    print("Choose between saving or loading a model (s/l): ")
    choice = None
    while (not choice == "s") and (not choice == "l"):
        choice = input()

    if choice == "s":
        # Create and train baseline model
        from src.data.loaders import load_claimbuster_data, split_train_test
        from src.models.baseline_model import BaselineClaimDetector
        
        # Load data from dataset
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

        # Save the model
        filepath = "models/baseline.joblib"
        save_model(model.vectorizer, model.model, results, filepath)

        print(f"Model saved at: {filepath}")
    else:
        # Ask for filepath
        print("Give the model file location: ")
        filepath = input()

        payload = load_model(filepath)
        print(f"Model loaded: {payload["metadata"]}")


