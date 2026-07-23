import pandas as pd

def analyze_recidivism(firs_df):
    """
    Analyzes repeat offender frequency across FIR records.
    Calculates distribution of offenses per unique Accused_ID.
    """
    if "Accused_ID" not in firs_df.columns:
        raise ValueError("FIR DataFrame missing Accused_ID column")

    counts = firs_df["Accused_ID"].value_counts()
    single_offenders = (counts == 1).sum()
    repeat_offenders_2_4 = ((counts >= 2) & (counts <= 4)).sum()
    repeat_offenders_5_plus = (counts >= 5).sum()
    total_unique = len(counts)

    stats = {
        "Total_Unique_Accused": total_unique,
        "Single_Offense_Count": single_offenders,
        "Single_Offense_Pct": round(single_offenders / total_unique * 100, 2),
        "Repeat_2_4_Count": repeat_offenders_2_4,
        "Repeat_2_4_Pct": round(repeat_offenders_2_4 / total_unique * 100, 2),
        "Repeat_5_Plus_Count": repeat_offenders_5_plus,
        "Repeat_5_Plus_Pct": round(repeat_offenders_5_plus / total_unique * 100, 2)
    }
    
    print("=" * 60)
    print("RECIDIVISM PATTERN SUMMARY")
    print("=" * 60)
    for k, v in stats.items():
        print(f"  {k}: {v}")
    return stats
