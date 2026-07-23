import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(BASE_DIR, "reference")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")

def export_all_csvs():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    tables = ["districts", "stations", "people", "firs", "arrests", "chargesheets"]
    
    print("=" * 60)
    print("EXPORTING DATASETS TO STANDARDIZED CSVs")
    print("=" * 60)

    for tbl in tables:
        src = os.path.join(REF_DIR, f"{tbl}.csv")
        dst = os.path.join(EXPORT_DIR, f"{tbl}.csv")
        if os.path.exists(src):
            df = pd.read_csv(src)
            df.to_csv(dst, index=False)
            print(f"  Exported {tbl}.csv ({len(df)} records) -> {dst}")
        else:
            print(f"  [WARNING] {tbl}.csv not found in reference directory.")

if __name__ == "__main__":
    export_all_csvs()
