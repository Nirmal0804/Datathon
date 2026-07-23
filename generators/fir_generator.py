import os
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DISTRICTS_FILE = os.path.join(BASE_DIR, "reference", "districts.csv")
STATIONS_FILE = os.path.join(BASE_DIR, "reference", "stations.csv")
PEOPLE_FILE = os.path.join(BASE_DIR, "reference", "people.csv")

OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "firs.csv")

TOTAL_FIRS = 5000

# Bharatiya Nyaya Sanhita (BNS) & Special Laws Mapping
CRIME_CATALOG = {
    "Theft": {"subheads": ["House Theft", "Snatching", "Pocket Pick"], "sections": ["BNS 303(2)"]},
    "Vehicle Theft": {"subheads": ["Two-Wheeler Theft", "Car Theft"], "sections": ["BNS 303(2)"]},
    "Burglary": {"subheads": ["Day Burglary", "Night House Breaking"], "sections": ["BNS 331(3)", "BNS 331(4)"]},
    "Robbery": {"subheads": ["Highway Robbery", "Chain Snatching with Force"], "sections": ["BNS 309(4)"]},
    "Dacoity": {"subheads": ["Armed Dacoity", "Bank Dacoity"], "sections": ["BNS 310(2)"]},
    "Murder": {"subheads": ["Personal Enmity", "Gang Conflict", "Dowry Homicide"], "sections": ["BNS 103(1)"]},
    "Assault": {"subheads": ["Grievous Hurt", "Simple Assault", "Public Affray"], "sections": ["BNS 115(2)", "BNS 117(2)"]},
    "Cyber Crime": {"subheads": ["Financial Fraud", "Phishing", "Identity Theft"], "sections": ["IT Act 66D", "BNS 318(4)"]},
    "Fraud": {"subheads": ["Cheating", "Corporate Fraud", "Land Scam"], "sections": ["BNS 318(4)"]},
    "POCSO": {"subheads": ["Sexual Assault on Minor", "Harassment"], "sections": ["POCSO Act Sec 4", "BNS 64"]},
    "NDPS": {"subheads": ["Drug Trafficking", "Possession of Narcotics"], "sections": ["NDPS Act Sec 20(b)"]}
}

CRIME_TYPES = list(CRIME_CATALOG.keys())

OFFICERS = [
    "PI Ramesh Gowda", "SI Ravi Kumar", "PI Lakshmi Devi", "PI Naveen Patil",
    "SI Mahesh Bhat", "SI Divya Hegde", "PI Harish Naik", "SI Ganesh Rao",
    "PI Suresh Kulkarni", "SI Prakash Sharma", "PI Chetan Kumar"
]

STATUS_WEIGHTS = {
    "Under Investigation": 0.35,
    "Chargesheeted": 0.50,
    "Untraced": 0.10,
    "Closed": 0.05
}

# District-specific crime distribution weights
def get_district_crime_weights(district_name):
    weights = {c: 1.0 for c in CRIME_TYPES}
    if district_name == "Bengaluru Urban":
        weights["Cyber Crime"] = 4.5
        weights["Fraud"] = 3.5
        weights["Vehicle Theft"] = 3.0
    elif district_name == "Mysuru":
        weights["Theft"] = 3.5
        weights["Burglary"] = 2.5
    elif district_name == "Dakshina Kannada":
        weights["Cyber Crime"] = 3.0
        weights["Fraud"] = 3.0
        weights["NDPS"] = 2.0
    elif district_name == "Belagavi":
        weights["Burglary"] = 3.0
        weights["Theft"] = 2.5
        weights["Dacoity"] = 1.5
    elif district_name in ["Kalaburagi", "Ballari", "Bidar"]:
        weights["Assault"] = 3.5
        weights["Murder"] = 2.0
        weights["Dacoity"] = 2.0
    
    total = sum(weights.values())
    return [weights[c] / total for c in CRIME_TYPES]

# Monthly crime seasonality weights (Peak in festival months Oct-Nov, May)
MONTH_WEIGHTS = {
    1: 0.7, 2: 0.75, 3: 0.85, 4: 0.95, 5: 1.2,
    6: 0.9, 7: 0.85, 8: 0.90, 9: 1.0, 10: 1.35, 11: 1.45, 12: 1.1
}

def generate_random_timestamp():
    start_date = datetime(2025, 1, 1)
    months = list(MONTH_WEIGHTS.keys())
    probs = np.array(list(MONTH_WEIGHTS.values()))
    probs = probs / probs.sum()
    chosen_month = np.random.choice(months, p=probs)
    
    max_days = 28 if chosen_month == 2 else (30 if chosen_month in [4, 6, 9, 11] else 31)
    chosen_day = random.randint(1, max_days)
    
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    
    incident_dt = datetime(2025, chosen_month, chosen_day, hour, minute)
    
    # FIR filing delay: 0 to 5 days
    delay_days = random.choices([0, 1, 2, 3, 4, 5], weights=[0.5, 0.25, 0.12, 0.08, 0.03, 0.02])[0]
    delay_hours = random.randint(1, 12)
    fir_dt = incident_dt + timedelta(days=delay_days, hours=delay_hours)
    
    return incident_dt, fir_dt

def generate_firs():
    if not os.path.exists(PEOPLE_FILE) or not os.path.exists(STATIONS_FILE):
        raise FileNotFoundError("Prerequisite reference CSV files missing. Run base generators first.")

    stations_df = pd.read_csv(STATIONS_FILE)
    people_df = pd.read_csv(PEOPLE_FILE)

    person_ids = people_df["Person_ID"].tolist()
    person_gender = dict(zip(people_df["Person_ID"], people_df["Gender"]))

    male_ids = people_df[people_df["Gender"] == "Male"]["Person_ID"].tolist()
    female_ids = people_df[people_df["Gender"] == "Female"]["Person_ID"].tolist()

    # Pre-determine multi-accused slots per FIR (7% multi-accused chance)
    fir_slot_counts = [2 if random.random() < 0.07 else 1 for _ in range(TOTAL_FIRS)]
    total_slots_needed = sum(fir_slot_counts)

    # Calculate exact accused pool sizes to empirically yield 90% single, 8% repeat, 2% habitual
    N_acc = int(total_slots_needed / 1.188)
    n_single = int(round(N_acc * 0.90))
    n_repeat = int(round(N_acc * 0.08))
    n_habitual = N_acc - n_single - n_repeat

    # Sample unique accused: 85% Male, 15% Female
    n_male = int(round(N_acc * 0.85))
    n_female = N_acc - n_male

    accused_people = random.sample(male_ids, n_male) + random.sample(female_ids, n_female)
    random.shuffle(accused_people)

    single_people = accused_people[:n_single]
    repeat_people = accused_people[n_single:n_single + n_repeat]
    habitual_people = accused_people[n_single + n_repeat:]

    accused_tokens = []
    for p in single_people:
        accused_tokens.append(p)

    for p in repeat_people:
        cnt = random.choice([2, 2, 3])
        accused_tokens.extend([p] * cnt)

    for p in habitual_people:
        cnt = random.choice([4, 4, 5, 6])
        accused_tokens.extend([p] * cnt)

    # Match token count to total_slots_needed exactly
    if len(accused_tokens) < total_slots_needed:
        extra_needed = total_slots_needed - len(accused_tokens)
        remaining_people = list(set(person_ids) - set(accused_people))
        extra_m = int(round(extra_needed * 0.85))
        extra_f = extra_needed - extra_m
        m_rem = [p for p in remaining_people if person_gender[p] == "Male"]
        f_rem = [p for p in remaining_people if person_gender[p] == "Female"]
        accused_tokens.extend(random.sample(m_rem, extra_m) + random.sample(f_rem, extra_f))
    elif len(accused_tokens) > total_slots_needed:
        accused_tokens = accused_tokens[:total_slots_needed]

    random.shuffle(accused_tokens)

    token_idx = 0
    records = []

    for i in range(1, TOTAL_FIRS + 1):
        fir_id = f"FIR2025{i:05d}"
        fir_number = f"FIR/{i:04d}/2025"

        station_row = stations_df.sample(1).iloc[0]
        station_id = station_row["Station_ID"]
        district = station_row["District"]
        station_lat = station_row["Latitude"]
        station_lon = station_row["Longitude"]

        incident_dt, fir_dt = generate_random_timestamp()

        # Crime type selection based on district profile
        crime_probs = get_district_crime_weights(district)

        # Weekend assault boost (Sat, Sun)
        if incident_dt.weekday() in [5, 6]:
            c_type = random.choices(CRIME_TYPES, weights=[p * 1.8 if c == "Assault" else p for c, p in zip(CRIME_TYPES, crime_probs)])[0]
        else:
            c_type = random.choices(CRIME_TYPES, weights=crime_probs)[0]

        catalog_entry = CRIME_CATALOG[c_type]
        crime_subhead = random.choice(catalog_entry["subheads"])
        bns_sections = ", ".join(catalog_entry["sections"])

        # Localized spatial coordinates near police station (~2 km radius)
        lat = round(station_lat + random.uniform(-0.02, 0.02), 6)
        lon = round(station_lon + random.uniform(-0.02, 0.02), 6)

        complainant_id = random.choice(person_ids)
        victim_id = random.choice(person_ids)

        # Assign accused token(s)
        slots = fir_slot_counts[i - 1]
        if slots == 1:
            accused_str = accused_tokens[token_idx]
            token_idx += 1
        else:
            p1 = accused_tokens[token_idx]
            p2 = accused_tokens[token_idx + 1]
            if p1 == p2:
                search = token_idx + 2
                while search < len(accused_tokens) and accused_tokens[search] == p1:
                    search += 1
                if search < len(accused_tokens):
                    accused_tokens[token_idx + 1], accused_tokens[search] = accused_tokens[search], accused_tokens[token_idx + 1]
                    p2 = accused_tokens[token_idx + 1]
            accused_str = f"{p1}, {p2}"
            token_idx += 2

        status = random.choices(
            list(STATUS_WEIGHTS.keys()),
            weights=list(STATUS_WEIGHTS.values())
        )[0]

        io_name = random.choice(OFFICERS)

        records.append({
            "FIR_ID": fir_id,
            "FIR_Number": fir_number,
            "Station_ID": station_id,
            "District": district,
            "Incident_Date": incident_dt.strftime("%Y-%m-%d %H:%M"),
            "FIR_Date": fir_dt.strftime("%Y-%m-%d %H:%M"),
            "Crime_Head": c_type,
            "Crime_Subhead": crime_subhead,
            "BNS_Sections": bns_sections,
            "Latitude": lat,
            "Longitude": lon,
            "Complainant_ID": complainant_id,
            "Victim_ID": victim_id,
            "Accused_ID": accused_str,
            "Investigating_Officer": io_name,
            "Status": status
        })

    df = pd.DataFrame(records)
    df = df.sort_values("FIR_Date").reset_index(drop=True)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} FIR records -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_firs()

