import sys
import os

# Add package root to Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from generators.district_generator import generate_districts
from generators.station_generator import generate_stations
from generators.people_generator import generate_people
from generators.fir_generator import generate_firs
from generators.arrest_generator import generate_arrests
from generators.chargesheet_generator import generate_chargesheets
from validation.validator import run_validation
from export.csv_export import export_all_csvs
from export.excel_export import export_to_excel

def main():
    print("=" * 80)
    print("  KARNATAKA POLICE SYNTHETIC DATASET GENERATION ENGINE (DATATHON 2026)  ")
    print("=" * 80)

    try:
        print("\n--- Phase 1: Generating Base Reference Datasets ---")
        generate_districts()
        generate_stations()
        generate_people()

        print("\n--- Phase 2: Generating Transactional FIR & Case Lifecycle Datasets ---")
        generate_firs()
        generate_arrests()
        generate_chargesheets()

        print("\n--- Phase 3: Executing Quality & Referential Integrity Validation ---")
        valid = run_validation()
        if not valid:
            print("\n[ERROR] Dataset validation failed! Aborting export.")
            sys.exit(1)

        print("\n--- Phase 4: Exporting Standardized Datasets ---")
        export_all_csvs()
        export_to_excel()

        print("\n" + "=" * 80)
        print("  [SUCCESS] DATASET GENERATION PIPELINE COMPLETED SUCCESSFULLY!  ")
        print("=" * 80)

    except Exception as e:
        print(f"\n[CRITICAL ERROR] Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
