import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(BASE_DIR, "reference")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")

def run_validation():
    report_lines = []
    def log(msg=""):
        print(msg)
        report_lines.append(msg)

    log("=" * 80)
    log("      KARNATAKA POLICE OPERATIONAL DATASET VALIDATION REPORT      ")
    log("=" * 80)

    files = {
        "districts": os.path.join(REF_DIR, "districts.csv"),
        "stations": os.path.join(REF_DIR, "stations.csv"),
        "people": os.path.join(REF_DIR, "people.csv"),
        "firs": os.path.join(REF_DIR, "firs.csv"),
        "arrests": os.path.join(REF_DIR, "arrests.csv"),
        "chargesheets": os.path.join(REF_DIR, "chargesheets.csv")
    }

    dfs = {}
    for name, path in files.items():
        if not os.path.exists(path):
            log(f"[FAIL] Missing required file: {path}")
            return False
        dfs[name] = pd.read_csv(path)

    errors = 0

    # 1. PRIMARY KEY UNIQUE CHECKS
    log("\n--- Primary Key Uniqueness Checks ---")
    pk_map = {
        "districts": "District_ID",
        "stations": "Station_ID",
        "people": "Person_ID",
        "firs": "FIR_ID",
        "arrests": "Arrest_ID",
        "chargesheets": "ChargeSheet_ID"
    }

    for tbl, pk in pk_map.items():
        df = dfs[tbl]
        if df[pk].duplicated().any():
            dups = df[df[pk].duplicated()][pk].tolist()
            log(f"[FAIL] Duplicate Primary Key found in {tbl} ({pk}): {dups[:5]}")
            errors += 1
        else:
            log(f"[PASS] {tbl.upper()} Primary Key ({pk}) Unique: {len(df)} records")

    # 2. FOREIGN KEY REFERENTIAL INTEGRITY CHECKS
    log("\n--- Foreign Key Integrity Checks ---")

    # Stations -> Districts
    invalid_st_dist = set(dfs["stations"]["District_ID"]) - set(dfs["districts"]["District_ID"])
    if invalid_st_dist:
        log(f"[FAIL] Invalid District_ID in stations: {invalid_st_dist}")
        errors += 1
    else:
        log("[PASS] stations -> districts (District_ID) FK valid")

    # People -> Stations
    invalid_people_st = set(dfs["people"]["Station_ID"]) - set(dfs["stations"]["Station_ID"])
    if invalid_people_st:
        log(f"[FAIL] Invalid Station_ID in people: {list(invalid_people_st)[:5]}")
        errors += 1
    else:
        log("[PASS] people -> stations (Station_ID) FK valid")

    # FIRs -> Stations, Complainant, Victim, Accused
    fir_df = dfs["firs"]
    people_ids = set(dfs["people"]["Person_ID"])
    station_ids = set(dfs["stations"]["Station_ID"])

    invalid_fir_st = set(fir_df["Station_ID"]) - station_ids
    if invalid_fir_st:
        log(f"[FAIL] Invalid Station_ID in firs: {list(invalid_fir_st)[:5]}")
        errors += 1
    else:
        log("[PASS] firs -> stations (Station_ID) FK valid")

    for col in ["Complainant_ID", "Victim_ID"]:
        invalid_p = set(fir_df[col]) - people_ids
        if invalid_p:
            log(f"[FAIL] Invalid {col} in firs: {list(invalid_p)[:5]}")
            errors += 1
        else:
            log(f"[PASS] firs -> people ({col}) FK valid")

    # Validate Accused_ID (supports single and comma-separated co-accused lists)
    invalid_accused = set()
    all_accused_ids = []
    for raw_acc in fir_df["Accused_ID"]:
        acc_list = [a.strip() for a in str(raw_acc).split(",")]
        all_accused_ids.extend(acc_list)
        for acc in acc_list:
            if acc not in people_ids:
                invalid_accused.add(acc)

    if invalid_accused:
        log(f"[FAIL] Invalid Accused_ID in firs: {list(invalid_accused)[:5]}")
        errors += 1
    else:
        log("[PASS] firs -> people (Accused_ID / Co-Accused) FK valid")

    # Arrests -> FIRs, People
    arrests_df = dfs["arrests"]
    fir_ids = set(fir_df["FIR_ID"])

    invalid_arr_fir = set(arrests_df["FIR_ID"]) - fir_ids
    if invalid_arr_fir:
        log(f"[FAIL] Invalid FIR_ID in arrests: {list(invalid_arr_fir)[:5]}")
        errors += 1
    else:
        log("[PASS] arrests -> firs (FIR_ID) FK valid")

    invalid_arr_p = set(arrests_df["Person_ID"]) - people_ids
    if invalid_arr_p:
        log(f"[FAIL] Invalid Person_ID in arrests: {list(invalid_arr_p)[:5]}")
        errors += 1
    else:
        log("[PASS] arrests -> people (Person_ID) FK valid")

    # Chargesheets -> FIRs, Accused
    cs_df = dfs["chargesheets"]
    invalid_cs_fir = set(cs_df["FIR_ID"]) - fir_ids
    if invalid_cs_fir:
        log(f"[FAIL] Invalid FIR_ID in chargesheets: {list(invalid_cs_fir)[:5]}")
        errors += 1
    else:
        log("[PASS] chargesheets -> firs (FIR_ID) FK valid")

    invalid_cs_acc = set(cs_df["Accused_ID"]) - people_ids
    if invalid_cs_acc:
        log(f"[FAIL] Invalid Accused_ID in chargesheets: {list(invalid_cs_acc)[:5]}")
        errors += 1
    else:
        log("[PASS] chargesheets -> people (Accused_ID) FK valid")

    # 3. DATE CHRONOLOGICAL SANITY CHECKS
    log("\n--- Date Chronology Sanity Checks ---")
    incident_dts = pd.to_datetime(fir_df["Incident_Date"])
    fir_dts = pd.to_datetime(fir_df["FIR_Date"])
    if (incident_dts > fir_dts).any():
        log("[FAIL] Found Incident_Date > FIR_Date in firs")
        errors += 1
    else:
        log("[PASS] FIR Incident_Date <= FIR_Date timeline valid")

    arrests_merged = arrests_df.merge(fir_df[["FIR_ID", "FIR_Date"]], on="FIR_ID")
    arr_dts = pd.to_datetime(arrests_merged["Arrest_Date"])
    arr_fir_dts = pd.to_datetime(arrests_merged["FIR_Date"])
    if (arr_fir_dts > arr_dts).any():
        log("[FAIL] Found FIR_Date > Arrest_Date in arrests")
        errors += 1
    else:
        log("[PASS] Arrest FIR_Date <= Arrest_Date timeline valid")

    cs_merged = cs_df.merge(fir_df[["FIR_ID", "FIR_Date"]], on="FIR_ID")
    cs_dts = pd.to_datetime(cs_merged["ChargeSheet_Date"])
    cs_fir_dts = pd.to_datetime(cs_merged["FIR_Date"])
    if (cs_fir_dts > cs_dts).any():
        log("[FAIL] Found FIR_Date > ChargeSheet_Date in chargesheets")
        errors += 1
    else:
        log("[PASS] ChargeSheet FIR_Date <= ChargeSheet_Date timeline valid")

    # 4. DATASET STATISTICAL AUDIT
    log("\n--- Dataset Distribution & Statistical Audit ---")
    log(f"Total Districts       : {len(dfs['districts'])}")
    log(f"Total Police Stations : {len(dfs['stations'])}")
    log(f"Total Citizens        : {len(dfs['people'])}")
    log(f"Total FIR Records     : {len(dfs['firs'])}")
    log(f"Total Arrest Records  : {len(dfs['arrests'])}")
    log(f"Total Chargesheets    : {len(dfs['chargesheets'])}")

    accused_series = pd.Series(all_accused_ids)
    counts = accused_series.value_counts()
    single_cnt = (counts == 1).sum()
    repeat_2_4 = ((counts >= 2) & (counts <= 4)).sum()
    repeat_5_plus = (counts >= 5).sum()
    total_accused = len(counts)

    log("\nRecidivism Ratio Check:")
    log(f"  Total Unique Accused   : {total_accused}")
    log(f"  1 FIR (Single Offense) : {single_cnt} ({round(single_cnt/total_accused*100, 2)}%)")
    log(f"  2-4 FIRs (Repeat)      : {repeat_2_4} ({round(repeat_2_4/total_accused*100, 2)}%)")
    log(f"  5-10 FIRs (Chronic)    : {repeat_5_plus} ({round(repeat_5_plus/total_accused*100, 2)}%)")

    arrest_ratio = round(len(dfs['arrests']) / len(dfs['firs']) * 100, 2)
    chargesheet_ratio = round(len(dfs['chargesheets']) / len(dfs['firs']) * 100, 2)
    log(f"\nOperational Case Outcomes:")
    log(f"  Arrest Rate            : {arrest_ratio}%")
    log(f"  Chargesheet Rate       : {chargesheet_ratio}%")

    log("=" * 80)
    if errors == 0:
        log("[SUCCESS] ALL VALIDATION CHECKS PASSED PERFECTLY!")
    else:
        log(f"[FAIL] VALIDATION COMPLETED WITH {errors} ERROR(S)")

    # Save Validation Report to exports/validation_report.txt
    os.makedirs(EXPORT_DIR, exist_ok=True)
    report_file = os.path.join(EXPORT_DIR, "validation_report.txt")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    print(f"\n[INFO] Validation Report saved -> {report_file}")

    return errors == 0

if __name__ == "__main__":
    run_validation()

