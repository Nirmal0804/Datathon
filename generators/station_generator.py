import os
import random
import pandas as pd

random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DISTRICTS_FILE = os.path.join(BASE_DIR, "reference", "districts.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "stations.csv")

TOTAL_STATIONS = 250

STATION_TYPES = [
    "Police Station",
    "Traffic Police Station",
    "Women Police Station",
    "Cyber Crime Police Station",
    "Rural Police Station",
    "Town Police Station"
]

ZONES = ["North", "South", "East", "West", "Central"]

def generate_stations():
    if not os.path.exists(DISTRICTS_FILE):
        raise FileNotFoundError(f"{DISTRICTS_FILE} not found. Run district_generator.py first.")

    districts_df = pd.read_csv(DISTRICTS_FILE)

    records = []
    station_id_counter = 1

    # Distribute 250 stations across 31 districts proportionally by Police_Stations count
    for _, district_row in districts_df.iterrows():
        dist_id = district_row["District_ID"]
        dist_name = district_row["District"]
        center_lat = district_row["Latitude"]
        center_lon = district_row["Longitude"]
        num_stations = int(district_row["Police_Stations"])

        for _ in range(num_stations):
            if station_id_counter > TOTAL_STATIONS:
                break
            zone = random.choice(ZONES)
            station_type = random.choice(STATION_TYPES)
            station_name = f"{dist_name} {zone} {station_type}"

            # Localized spatial offset (~0.01 - 0.2 degrees radius around district centroid)
            lat = round(center_lat + random.uniform(-0.2, 0.2), 6)
            lon = round(center_lon + random.uniform(-0.2, 0.2), 6)

            personnel = random.randint(35, 180)
            vehicles = random.randint(3, 25)

            records.append({
                "Station_ID": f"PS{station_id_counter:04d}",
                "Station_Name": station_name,
                "District_ID": dist_id,
                "District": dist_name,
                "Zone": zone,
                "Station_Type": station_type,
                "Latitude": lat,
                "Longitude": lon,
                "Personnel_Strength": personnel,
                "Patrol_Vehicles": vehicles,
                "Contact_Number": f"080{random.randint(1000000, 9999999)}",
                "Email": f"ps{station_id_counter}@ksp.gov.in"
            })

            station_id_counter += 1

    # Fill remaining to reach exactly TOTAL_STATIONS if needed
    while station_id_counter <= TOTAL_STATIONS:
        district_row = districts_df.sample(1).iloc[0]
        dist_id = district_row["District_ID"]
        dist_name = district_row["District"]
        center_lat = district_row["Latitude"]
        center_lon = district_row["Longitude"]

        zone = random.choice(ZONES)
        station_type = random.choice(STATION_TYPES)
        station_name = f"{dist_name} {zone} {station_type}"

        lat = round(center_lat + random.uniform(-0.2, 0.2), 6)
        lon = round(center_lon + random.uniform(-0.2, 0.2), 6)

        records.append({
            "Station_ID": f"PS{station_id_counter:04d}",
            "Station_Name": station_name,
            "District_ID": dist_id,
            "District": dist_name,
            "Zone": zone,
            "Station_Type": station_type,
            "Latitude": lat,
            "Longitude": lon,
            "Personnel_Strength": random.randint(35, 180),
            "Patrol_Vehicles": random.randint(3, 25),
            "Contact_Number": f"080{random.randint(1000000, 9999999)}",
            "Email": f"ps{station_id_counter}@ksp.gov.in"
        })
        station_id_counter += 1

    df = pd.DataFrame(records)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} police stations -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_stations()