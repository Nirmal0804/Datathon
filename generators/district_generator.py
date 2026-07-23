import os
import random
import pandas as pd

random.seed(42)

# Dynamic path resolution to reference directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "districts.csv")

# 31 Karnataka Districts with official Police Ranges and Approximate Centroids (Lat, Lon)
DISTRICTS = [
    ("Bagalkote", "Belagavi Range", 16.1817, 75.6961),
    ("Ballari", "Kalyana Karnataka Range", 15.1394, 76.9214),
    ("Belagavi", "Belagavi Range", 15.8497, 74.4977),
    ("Bengaluru Rural", "Bengaluru Range", 13.2257, 77.5750),
    ("Bengaluru Urban", "Bengaluru City", 12.9716, 77.5946),
    ("Bidar", "Kalyana Karnataka Range", 17.9104, 77.5199),
    ("Chamarajanagar", "Mysuru Range", 11.9261, 76.9437),
    ("Chikkaballapura", "Bengaluru Range", 13.4355, 77.7279),
    ("Chikkamagaluru", "Western Range", 13.3161, 75.7720),
    ("Chitradurga", "Central Range", 14.2251, 76.3980),
    ("Dakshina Kannada", "Mangaluru City", 12.9141, 74.8560),
    ("Davanagere", "Central Range", 14.4644, 75.9218),
    ("Dharwad", "Hubballi-Dharwad City", 15.4589, 75.0078),
    ("Gadag", "Central Range", 15.4319, 75.6355),
    ("Hassan", "Western Range", 13.0072, 76.1017),
    ("Haveri", "Central Range", 14.7954, 75.4022),
    ("Kalaburagi", "Kalyana Karnataka Range", 17.3297, 76.8343),
    ("Kodagu", "Western Range", 12.4244, 75.7382),
    ("Kolar", "Bengaluru Range", 13.1367, 78.1292),
    ("Koppal", "Central Range", 15.3477, 76.1548),
    ("Mandya", "Mysuru Range", 12.5218, 76.8951),
    ("Mysuru", "Mysuru City", 12.2958, 76.6394),
    ("Raichur", "Kalyana Karnataka Range", 16.2076, 77.3463),
    ("Ramanagara", "Bengaluru Range", 12.7150, 77.2814),
    ("Shivamogga", "Western Range", 13.9299, 75.5681),
    ("Tumakuru", "Bengaluru Range", 13.3379, 77.1173),
    ("Udupi", "Western Range", 13.3409, 74.7421),
    ("Uttara Kannada", "Karwar Range", 14.8095, 74.1303),
    ("Vijayapura", "Belagavi Range", 16.8302, 75.7100),
    ("Vijayanagara", "Central Range", 15.2690, 76.3860),
    ("Yadgir", "Kalyana Karnataka Range", 16.7700, 77.1375)
]

def generate_districts():
    records = []
    for idx, (district, police_range, lat, lon) in enumerate(DISTRICTS, start=1):
        population = random.randint(600000, 4500000)
        area = random.randint(2500, 11000)
        density = round(population / area)
        literacy = round(random.uniform(60, 92), 2)
        urban = random.randint(20, 90)
        rural = 100 - urban
        police_stations = random.randint(18, 45)

        records.append({
            "District_ID": idx,
            "District": district,
            "Police_Range": police_range,
            "State": "Karnataka",
            "Population": population,
            "Area_sq_km": area,
            "Population_Density": density,
            "Literacy_Rate": literacy,
            "Urban_Population_%": urban,
            "Rural_Population_%": rural,
            "Police_Stations": police_stations,
            "Latitude": lat,
            "Longitude": lon
        })

    df = pd.DataFrame(records)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} districts -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_districts()