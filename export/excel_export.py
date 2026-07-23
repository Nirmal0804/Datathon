import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_DIR = os.path.join(BASE_DIR, "reference")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
OUTPUT_EXCEL = os.path.join(EXPORT_DIR, "karnataka_police_dataset.xlsx")

def export_to_excel():
    os.makedirs(EXPORT_DIR, exist_ok=True)
    tables = {
        "Districts": "districts.csv",
        "Police_Stations": "stations.csv",
        "Citizens": "people.csv",
        "FIR_Records": "firs.csv",
        "Arrests": "arrests.csv",
        "Chargesheets": "chargesheets.csv"
    }

    print("=" * 60)
    print("EXPORTING CONSOLIDATED MULTI-TAB EXCEL WORKBOOK")
    print("=" * 60)

    with pd.ExcelWriter(OUTPUT_EXCEL, engine="openpyxl") as writer:
        summary_rows = []
        for sheet_name, filename in tables.items():
            filepath = os.path.join(REF_DIR, filename)
            if os.path.exists(filepath):
                df = pd.read_csv(filepath)
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                summary_rows.append({
                    "Sheet_Name": sheet_name,
                    "Source_CSV": filename,
                    "Record_Count": len(df),
                    "Column_Count": len(df.columns)
                })
                print(f"  Added Sheet: '{sheet_name}' ({len(df)} rows)")
            else:
                print(f"  [WARNING] File {filename} not found.")

        # Metadata sheet
        meta_df = pd.DataFrame(summary_rows)
        meta_df.to_excel(writer, sheet_name="Dataset_Metadata", index=False)
        print("  Added Sheet: 'Dataset_Metadata'")

    print(f"[SUCCESS] Exported Excel Workbook -> {OUTPUT_EXCEL}")
    return OUTPUT_EXCEL

if __name__ == "__main__":
    export_to_excel()
