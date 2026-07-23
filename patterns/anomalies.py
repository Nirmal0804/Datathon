import pandas as pd
from datetime import datetime

def audit_procedural_delays(firs_df):
    """
    Audits procedural delay distributions between Incident_Date and FIR_Date.
    """
    if "Incident_Date" not in firs_df.columns or "FIR_Date" not in firs_df.columns:
        raise ValueError("Invalid DataFrame schema for delay audit")

    firs_df["Incident_DT"] = pd.to_datetime(firs_df["Incident_Date"])
    firs_df["FIR_DT"] = pd.to_datetime(firs_df["FIR_Date"])
    
    firs_df["Filing_Delay_Hours"] = (firs_df["FIR_DT"] - firs_df["Incident_DT"]).dt.total_seconds() / 3600.0

    delayed_firs = firs_df[firs_df["Filing_Delay_Hours"] > 72]

    print("=" * 60)
    print("PROCEDURAL DELAY AUDIT REPORT")
    print("=" * 60)
    print(f"Total FIRs Analyzed           : {len(firs_df)}")
    print(f"FIRs Delayed > 72 Hours        : {len(delayed_firs)} ({round(len(delayed_firs)/len(firs_df)*100, 2)}%)")
    print(f"Max Filing Delay (Hours)       : {round(firs_df['Filing_Delay_Hours'].max(), 2)}")
    print(f"Average Filing Delay (Hours)   : {round(firs_df['Filing_Delay_Hours'].mean(), 2)}")
    
    return firs_df[["FIR_ID", "Incident_Date", "FIR_Date", "Filing_Delay_Hours"]]
