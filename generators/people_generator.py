import os
import random
from datetime import datetime, timedelta
import pandas as pd

random.seed(42)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIONS_FILE = os.path.join(BASE_DIR, "reference", "stations.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "reference")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "people.csv")

TOTAL_PEOPLE = 10000

FIRST_NAMES_MALE = [
    "Rahul", "Arjun", "Rohit", "Kiran", "Manoj", "Akash", "Ramesh", "Vijay",
    "Ajay", "Suraj", "Naveen", "Prakash", "Mahesh", "Suresh", "Harish",
    "Vinay", "Ganesh", "Ravi", "Sanjay", "Lokesh", "Chetan", "Darshan",
    "Pradeep", "Puneeth", "Abhishek", "Basavaraj", "Siddu", "Shivakumar"
]

FIRST_NAMES_FEMALE = [
    "Priya", "Kavya", "Divya", "Anjali", "Sneha", "Pooja", "Lakshmi", "Nisha",
    "Asha", "Megha", "Swathi", "Deepa", "Bhavya", "Shreya", "Keerthi",
    "Nandini", "Sowmya", "Harini", "Preethi", "Radhika", "Anitha", "Roopa",
    "Rekha", "Sangeetha", "Sunitha", "Vidya", "Geetha", "Kusuma"
]

LAST_NAMES = [
    "Kumar", "Gowda", "Reddy", "Naik", "Patil", "Shetty", "Rao", "Sharma",
    "Joshi", "Bhat", "Hegde", "Kulkarni", "Desai", "Singh", "Verma",
    "Poojary", "Pujari", "Kambali", "Hiremath", "Angadi", "Siddiqui"
]

OCCUPATIONS = [
    "Student", "Engineer", "Doctor", "Farmer", "Teacher",
    "Driver", "Business", "Police", "Lawyer", "Electrician",
    "Carpenter", "Software Engineer", "Nurse", "Labour",
    "Sales Executive", "Government Employee",
    "Mechanic", "Shop Owner", "Security Guard", "Unemployed"
]

EDUCATION = [
    "No Formal Education", "Primary", "High School", "PUC",
    "Diploma", "Graduate", "Post Graduate", "PhD"
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"]

def generate_dob():
    start = datetime(1955, 1, 1)
    end = datetime(2007, 12, 31)
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))

def age_from_dob(dob):
    today = datetime.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def aadhaar():
    return "".join(str(random.randint(0, 9)) for _ in range(12))

def phone():
    return "9" + "".join(str(random.randint(0, 9)) for _ in range(9))

def address():
    house = random.randint(1, 450)
    street = random.choice([
        "MG Road", "Temple Road", "Station Road", "Main Road",
        "Market Road", "Nehru Road", "Gandhi Road", "College Road",
        "Lake View", "Railway Colony", "Church Street", "Ring Road"
    ])
    return f"{house}, {street}"

def generate_people():
    if not os.path.exists(STATIONS_FILE):
        raise FileNotFoundError(f"{STATIONS_FILE} not found. Run station_generator.py first.")

    stations_df = pd.read_csv(STATIONS_FILE)

    records = []
    for i in range(1, TOTAL_PEOPLE + 1):
        gender = random.choice(["Male", "Female"])
        first = random.choice(FIRST_NAMES_MALE if gender == "Male" else FIRST_NAMES_FEMALE)
        last = random.choice(LAST_NAMES)
        full_name = f"{first} {last}"
        dob = generate_dob()

        # Pick a random police station and derive district
        station_row = stations_df.sample(1).iloc[0]
        station_id = station_row["Station_ID"]
        district = station_row["District"]

        records.append({
            "Person_ID": f"P{i:06d}",
            "Full_Name": full_name,
            "Gender": gender,
            "DOB": dob.strftime("%Y-%m-%d"),
            "Age": age_from_dob(dob),
            "Occupation": random.choice(OCCUPATIONS),
            "Education": random.choice(EDUCATION),
            "Marital_Status": random.choice(MARITAL_STATUS),
            "Blood_Group": random.choice(BLOOD_GROUPS),
            "Nationality": "Indian",
            "District": district,
            "Station_ID": station_id
        })

    df = pd.DataFrame(records)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"[SUCCESS] Generated {len(df)} citizens -> {OUTPUT_FILE}")
    return df

if __name__ == "__main__":
    generate_people()
