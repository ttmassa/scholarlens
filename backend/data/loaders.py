import pandas as pd
from sklearn.model_selection import train_test_split

def load_claimbuster_data(file_path: str = 'raw/crowdsourced.csv'):
    # Load the CSV file into a pandas DataFrame
    df = pd.read_csv(file_path)

    # Check if file is valid
    required_columns = ["Sentence_id", "Text", "Speaker", "Speaker_title", "Speaker_party", "File_id", "Length", "Line_number", "Sentiment", "Verdict"]
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")
        
    return df

def split_train_test(df: pd.DataFrame, test_size: float = 0.2, random_seed: int = 42):
    # Split the DataFrame into training and testing sets
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=random_seed)
    return train_df, test_df
