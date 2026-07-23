import pandas as pd

def extract_accomplice_network(firs_df, arrests_df=None):
    """
    Extracts criminal relationship graph edges based on shared FIRs or spatial-temporal co-occurrence.
    """
    if "Accused_ID" not in firs_df.columns or "FIR_ID" not in firs_df.columns:
        raise ValueError("Invalid DataFrame schema for network analysis")

    # Group accused by FIR_ID to find co-accused pairs
    grouped = firs_df.groupby("FIR_ID")["Accused_ID"].apply(list).reset_index()
    edges = []

    for _, row in grouped.iterrows():
        accused_list = row["Accused_ID"]
        if len(accused_list) > 1:
            for i in range(len(accused_list)):
                for j in range(i + 1, len(accused_list)):
                    edges.append({
                        "Source": accused_list[i],
                        "Target": accused_list[j],
                        "FIR_ID": row["FIR_ID"]
                    })

    edges_df = pd.DataFrame(edges)
    print("=" * 60)
    print("CRIMINAL NETWORK GRAPH EDGES")
    print("=" * 60)
    print(f"Total Co-Accused Links Extracted: {len(edges_df)}")
    return edges_df
