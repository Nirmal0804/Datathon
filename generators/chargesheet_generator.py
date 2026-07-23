import os
import random
from datetime import datetime, timedelta
import pandas as pd

random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIRS_FILE = os.path.join(BASE_DIR, "reference", "firs.csv")
ARRESTS_FILE = os.path.join(BASE_DIR, "reference", "arrests.csv")
PEOPLE_FILE = os.path.join(BASE_DIR, "reference", "people.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "chargesheets.csv")

STATUSES = [
    "Filed",
    "Pending Scrutiny",
    "Accepted",
    "Returned for Correction"
]

def generate_chargesheets():
    if not os.path.exists(FIRS_FILE):
        raise FileNotFoundError("firs.csv missing. Run fir_generator.py first.")

    firs_df = pd.read_csv(FIRS_FILE)
    
    # Load arrests if available to align dates
    arrests_lookup = {}
    if os.path.exists(ARRESTS_FILE):
        arrests_df = pd.read_csv(ARRESTS_FILE)
        for _, arr_row in arrests_df.iterrows():
            arrests_lookup[arr_row["FIR_ID"]] = arr_row["Arrest_Date"]

    # Filter FIRs marked as Chargesheeted
    chargesheet_firs = firs_df[firs_df["Status"] == "Chargesheeted"].reset_index(drop=True)

    records = []
    for idx, fir_row in chargesheet_firs.iterrows():
        cs_id = f"CS2025{idx + 1:05d}"
        fir_id = fir_row["FIR_ID"]
        accused_id = str(fir_row["Accused_ID"]).split(",")[0].strip()
        crime_type = fir_row["Crime_Head"]
        sections = fir_row["BNS_Sections"]
        district = fir_row["District"]
        io_name = fir_row["Investigating_Officer"]


        court_name = f"{district} District & Sessions Court"

        # Baseline date: arrest date if available, else FIR date
        if fir_id in arrests_lookup:
            base_dt = datetime.strptime(arrests_lookup[fir_id], "%Y-%m-%d %H:%M")
        else:
            base_dt = datetime.strptime(fir_row["FIR_Date"], "%Y-%m-%d %H:%M")

        # Chargesheet filed 30 to 90 days after baseline
        cs_dt = base_dt + timedelta(days=random.randint(30, 90))

        records.append({
            "ChargeSheet_ID": cs_id,
            "FIR_ID": fir_id,
            "Accused_ID": accused_id,
            "Crime_Type": crime_type,
            "Sections": sections,
            "Investigating_Officer": io_name,
            "Court": court_name,
            "Witness_Count": random.randint(2, 18),
            "Evidence_Count": random.randint(3, 30),
            "ChargeSheet_Date": cs_dt.strftime("%Y-%m-%d"),
            "Status": random.choice(STATUSES)
        })

    df = pd.DataFrame(records)
    # Sort chronologically by ChargeSheet_Date
    df = df.sort_values("ChargeSheet_Date").reset_index(drop=True)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} chargesheets -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_chargesheets()