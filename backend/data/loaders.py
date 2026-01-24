import pandas as pd
from sklearn.model_selection import train_test_split

def load_claimbuster_data(file_path: str = 'backend/data/raw/crowdsourced.csv'):
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

def get_data_stats(df: pd.DataFrame):
    """Get statistics about the dataset."""
    
    stats = {}
    
    # Total number of sentences
    stats['total_sentences'] = len(df)
    
    # Number of claims
    stats['num_claims'] = len(df[df["Verdict"] == 1])
    stats['num_non_claims'] = len(df) - stats['num_claims']
    
    # Sentence length statistics
    stats['length_min'] = df["Length"].min()
    stats['length_max'] = df["Length"].max()
    stats['length_mean'] = df["Length"].mean()
    stats['length_median'] = df["Length"].median()
    stats['length_std'] = df["Length"].std()
        
    # Vocabulary size (unique words across all text)
    all_text = ' '.join(df["Text"].dropna().astype(str))
    unique_words = set(all_text.lower().split())
    stats['vocabulary_size'] = len(unique_words)
    
    # Average words per sentence
    df_temp = df.copy()
    df_temp['word_count'] = df_temp["Text"].apply(lambda x: len(str(x).split()) if pd.notna(x) else 0)
    stats['avg_words_per_sentence'] = df_temp['word_count'].mean()
            
    return stats

if __name__ == "__main__":
    df = load_claimbuster_data()
    stats = get_data_stats(df)
    
    # Print statistics
    print("=" * 60)
    print("DATASET STATISTICS")
    print("=" * 60)
    
    print("\n📊 BASIC INFO:")
    print(f"  Total sentences: {stats['total_sentences']:,}")
    
    print("\n⚖️  CLASS DISTRIBUTION:")
    print(f"  Claims: {stats['num_claims']:,} ({stats['num_claims'] / stats['total_sentences'] * 100:.2f}%)")
    print(f"  Non-claims: {stats['num_non_claims']:,} ({stats['num_non_claims'] / stats['total_sentences'] * 100:.2f}%)")
    
    print("\n📏 LENGTH STATISTICS:")
    print(f"  Mean: {stats['length_mean']:.2f}")
    print(f"  Median: {stats['length_median']:.2f}")
    print(f"  Std Dev: {stats['length_std']:.2f}")
    print(f"  Range: {stats['length_min']} - {stats['length_max']}")
    
    print("\n📝 TEXT CHARACTERISTICS:")
    print(f"  Vocabulary size: {stats['vocabulary_size']:,} unique words")
    print(f"  Avg words per sentence: {stats['avg_words_per_sentence']:.2f}")
    
    print("\n" + "=" * 60)