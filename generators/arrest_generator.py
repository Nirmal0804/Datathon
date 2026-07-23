import os
import random
from datetime import datetime, timedelta
import pandas as pd

random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIRS_FILE = os.path.join(BASE_DIR, "reference", "firs.csv")
PEOPLE_FILE = os.path.join(BASE_DIR, "reference", "people.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "arrests.csv")

OFFICERS = [
    "SI Ravi Kumar", "SI Prakash Sharma", "PI Lakshmi Devi", "PI Naveen Patil",
    "PI Mahesh Bhat", "SI Divya Hegde", "PI Harish Naik", "SI Ganesh Rao",
    "PI Ramesh Gowda", "SI Suresh Kulkarni"
]

ARREST_LOCATIONS = [
    "Residence", "Bus Stand", "Railway Station", "Highway Checkpost",
    "Market Area", "Airport", "Hotel", "Lodge", "Farm House",
    "Industrial Area", "Shopping Mall", "Parking Lot", "Border Checkpost"
]

BAIL_STATUS = ["Granted", "Rejected", "Pending"]
CUSTODY = ["Police Custody", "Judicial Custody", "Released on Bail"]

RECOVERY_ITEMS = [
    "Cash", "Gold", "Mobile Phones", "Laptop", "Vehicle",
    "Drugs", "Weapons", "Documents", "None"
]

def generate_arrests():
    if not os.path.exists(FIRS_FILE) or not os.path.exists(PEOPLE_FILE):
        raise FileNotFoundError("Prerequisite CSV files missing. Run fir_generator.py first.")

    firs_df = pd.read_csv(FIRS_FILE)
    people_df = pd.read_csv(PEOPLE_FILE).set_index("Person_ID")

    # Select FIRs eligible for arrest (Status in Chargesheeted or Under Investigation)
    eligible_firs = firs_df[firs_df["Status"].isin(["Chargesheeted", "Under Investigation"])]

    # Generate arrests for ~60% of eligible FIRs (approx 1500-2000 arrests)
    sample_firs = eligible_firs.sample(frac=0.6, random_state=42).reset_index(drop=True)

    records = []
    for idx, fir_row in sample_firs.iterrows():
        arrest_id = f"ARR{idx + 1:05d}"
        fir_id = fir_row["FIR_ID"]
        accused_str = str(fir_row["Accused_ID"])
        primary_accused_id = accused_str.split(",")[0].strip()
        station_id = fir_row["Station_ID"]
        district = fir_row["District"]

        if primary_accused_id not in people_df.index:
            continue

        person_info = people_df.loc[primary_accused_id]


        fir_dt = datetime.strptime(fir_row["FIR_Date"], "%Y-%m-%d %H:%M")
        
        # Arrest occurs 1 to 30 days after FIR registration
        delay_days = random.randint(1, 30)
        delay_hours = random.randint(0, 23)
        arrest_dt = fir_dt + timedelta(days=delay_days, hours=delay_hours)

        recovery_item = random.choice(RECOVERY_ITEMS)
        recovery_val = 0 if recovery_item == "None" else random.randint(2000, 500000)

        records.append({
            "Arrest_ID": arrest_id,
            "FIR_ID": fir_id,
            "Person_ID": primary_accused_id,
            "Accused_Name": person_info["Full_Name"],
            "Gender": person_info["Gender"],
            "Age": person_info["Age"],
            "District": district,
            "Station_ID": station_id,
            "Arrest_Date": arrest_dt.strftime("%Y-%m-%d %H:%M"),
            "Arrest_Location": random.choice(ARREST_LOCATIONS),
            "Arresting_Officer": random.choice(OFFICERS),
            "Custody_Type": random.choice(CUSTODY),
            "Bail_Status": random.choice(BAIL_STATUS),
            "Recovery_Item": recovery_item,
            "Recovery_Value": recovery_val,
            "Medical_Examination": random.choice(["Yes", "No"]),
            "Fingerprint_Taken": random.choice(["Yes", "No"]),
            "DNA_Sample": random.choice(["Yes", "No"]),
            "Photograph_Taken": random.choice(["Yes", "No"])
        })

    df = pd.DataFrame(records)
    # Sort chronologically by Arrest_Date
    df = df.sort_values("Arrest_Date").reset_index(drop=True)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} arrest records -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_arrests()