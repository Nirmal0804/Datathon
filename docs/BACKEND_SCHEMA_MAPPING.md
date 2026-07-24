# BACKEND_SCHEMA_MAPPING.md — Working Data Contract (CSV)

> **Checkpoint 2A deliverable.** This document is the authoritative backend
> schema reference. It supersedes any prior PDF-based analysis.
>
> Generated: 2026-07-23 | Data snapshot: `data/schema_reference/*.csv`

---

## 1. Scope

This document maps the six approved CSV files that form the **working data
contract** for the Karnataka Police Crime Analytics backend. It covers:

- Every column in every file, with observed type, nullability, and meaning.
- Candidate keys, foreign-key relationships, and referential integrity.
- Data quality findings and edge cases.
- Mapping to backend modules, endpoints, and ML ownership.
- Sensitive data classification and handling requirements.
- Architecture implications and open questions.

**Out of scope:** Production database schema, ORM model definitions,
migration scripts, ML model training details.

---

## 2. Working Data Contract

| File | Rows | Columns | Primary Key | Location |
|------|-----:|--------:|-------------|----------|
| `districts.csv` | 31 | 13 | `District_ID` | `data/schema_reference/` |
| `stations.csv` | 250 | 12 | `Station_ID` | `data/schema_reference/` |
| `people.csv` | 10,000 | 12 | `Person_ID` | `data/schema_reference/` |
| `firs.csv` | 5,000 | 16 | `FIR_ID` | `data/schema_reference/` |
| `arrests.csv` | 2,540 | 19 | `Arrest_ID` | `data/schema_reference/` |
| `chargesheets.csv` | 2,469 | 11 | `ChargeSheet_ID` | `data/schema_reference/` |

**Total records:** 20,290 across 6 files.

### Key observations

- All CSVs are UTF-8 encoded, comma-delimited, with header rows.
- All primary keys are unique and non-empty across their respective files.
- Referential integrity is **100% clean** — zero orphan FK values detected.
- No null/blank values in any column across any file.
- Only **8 of 31 districts** are actually referenced in transactional data
  (stations, FIRs, arrests, chargesheets). The remaining 23 districts exist
  in `districts.csv` only.

---

## 3. File-by-File Schema Inventory

### 3.1 districts.csv — 31 rows, 13 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `District_ID` | INT (1–31) | 0 | 31 | Primary key. Integer district code. |
| 2 | `District` | STRING | 0 | 31 | District name (e.g., "Bagalkote", "Bengaluru Urban"). |
| 3 | `Police_Range` | STRING | 0 | 11 | Administrative range (e.g., "Belagavi Range", "Bengaluru City"). |
| 4 | `State` | STRING | 0 | 1 | Always "Karnataka". |
| 5 | `Population` | INT | 0 | 31 | Census population. Range: 1,536,213 – 3,467,006. |
| 6 | `Area_sq_km` | INT | 0 | 31 | Area in sq km. Range: 2,553 – 10,779. |
| 7 | `Population_Density` | INT | 0 | 31 | Persons per sq km. Range: 146 – 1,629. |
| 8 | `Literacy_Rate` | FLOAT | 0 | 31 | Percentage. Range: 60.8 – 91.14. |
| 9 | `Urban_Population_%` | INT | 0 | 23 | Urban percentage. Range: 11 – 90. |
| 10 | `Rural_Population_%` | INT | 0 | 23 | Rural percentage. Complements urban %. |
| 11 | `Police_Stations` | INT | 0 | 16 | Count of stations in district. Range: 16 – 45. |
| 12 | `Latitude` | FLOAT | 0 | 31 | District centroid latitude. Range: 11.93 – 17.73. |
| 13 | `Longitude` | FLOAT | 0 | 31 | District centroid longitude. Range: 74.49 – 77.73. |

**Candidate PKs:** `District_ID` (unique, immutable format), `District` (unique).
**Recommended PK:** `District_ID` (integer, compact).

### 3.2 stations.csv — 250 rows, 12 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `Station_ID` | STRING (PS0001–PS0250) | 0 | 250 | Primary key. Zero-padded 4-digit code. |
| 2 | `Station_Name` | STRING | 0 | 185 | Full station name. 65 names are non-unique (same name in different districts). |
| 3 | `District_ID` | INT (1–8) | 0 | 8 | FK → `districts.District_ID`. Only districts 1–8 used. |
| 4 | `District` | STRING | 0 | 8 | District name (denormalized). |
| 5 | `Zone` | STRING | 0 | varies | Zone within district (e.g., "East", "North", "Central"). |
| 6 | `Station_Type` | STRING | 0 | varies | Type (e.g., "Town Police Station", "Rural Police Station", "Traffic Police Station"). |
| 7 | `Latitude` | FLOAT | 0 | 250 | Station latitude. |
| 8 | `Longitude` | FLOAT | 0 | 250 | Station longitude. |
| 9 | `Personnel_Strength` | INT | 0 | varies | Number of personnel. |
| 10 | `Patrol_Vehicles` | INT | 0 | varies | Number of patrol vehicles. |
| 11 | `Contact_Number` | STRING | 0 | 250 | Phone number (format: 0XXXXXXXXX). |
| 12 | `Email` | STRING | 0 | 250 | Station email (format: psN@ksp.gov.in). |

**Candidate PKs:** `Station_ID`, `Contact_Number`, `Email`.
**Recommended PK:** `Station_ID`.

**FK integrity:** All 250 `District_ID` values match `districts.District_ID` (0 orphans).

**Note:** Only 8 of 31 districts have stations in this dataset. Districts 9–31
have no station records.

### 3.3 people.csv — 10,000 rows, 12 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `Person_ID` | STRING (P000001–P010000) | 0 | 10,000 | Primary key. Zero-padded 6-digit code. |
| 2 | `Full_Name` | STRING | 0 | 9,954 | Person's full name. |
| 3 | `Gender` | STRING | 0 | 2 | "Male" (5,004) or "Female" (4,996). |
| 4 | `DOB` | DATE (YYYY-MM-DD) | 0 | 10,000 | Date of birth. |
| 5 | `Age` | INT | 0 | varies | Age in years. Range: ~18–80+. |
| 6 | `Occupation` | STRING | 0 | varies | Occupation category (e.g., "Government Employee", "Nurse", "Lawyer"). |
| 7 | `Education` | STRING | 0 | varies | Education level (e.g., "PhD", "High School", "Post Graduate"). |
| 8 | `Marital_Status` | STRING | 0 | varies | "Married", "Single", "Divorced", etc. |
| 9 | `Blood_Group` | STRING | 0 | 8 | Blood type (e.g., "AB-", "A-", "B+"). |
| 10 | `Nationality` | STRING | 0 | 1 | Always "Indian". |
| 11 | `District` | STRING | 0 | varies | District name (denormalized, text). |
| 12 | `Station_ID` | STRING | 0 | 250 | FK → `stations.Station_ID`. Person's home station area. |

**Candidate PKs:** `Person_ID` (unique, sequential).
**Recommended PK:** `Person_ID`.

**Important:** People table has **no Role column** (Accused/Complainant/Victim/Witness).
Person roles are implicit — determined by which FIR column references them
(`Complainant_ID`, `Victim_ID`, or `Accused_ID`).

**Sensitive data:** This table contains **no Aadhaar, PAN, Phone, Email, or
Address** columns. The only personal identifiers are `Full_Name`, `DOB`, and
`Age`. Classification: **MODERATE** (PII — names + DOB).

### 3.4 firs.csv — 5,000 rows, 16 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `FIR_ID` | STRING (FIR2025XXXXX) | 0 | 5,000 | Primary key. Format: FIR + year + 5-digit seq. |
| 2 | `FIR_Number` | STRING (FIR/NNNN/YYYY) | 0 | 5,000 | Human-readable FIR number. |
| 3 | `Station_ID` | STRING (PS0001–PS0250) | 0 | 250 | FK → `stations.Station_ID`. Reporting station. |
| 4 | `District` | STRING | 0 | 8 | District name (denormalized). Only 8 districts. |
| 5 | `Incident_Date` | DATETIME (YYYY-MM-DD HH:MM) | 0 | 4,975 | When the incident occurred. |
| 6 | `FIR_Date` | DATETIME (YYYY-MM-DD HH:MM) | 0 | 4,982 | When the FIR was registered. |
| 7 | `Crime_Head` | STRING | 0 | 11 | Top-level crime category. |
| 8 | `Crime_Subhead` | STRING | 0 | 27 | Detailed crime sub-category. |
| 9 | `BNS_Sections` | STRING | 0 | 10 | Legal sections (Bharatiya Nyaya Sanhita / NDPS / IT Act). |
| 10 | `Latitude` | FLOAT | 0 | 4,992 | Incident latitude. |
| 11 | `Longitude` | FLOAT | 0 | 4,977 | Incident longitude. |
| 12 | `Complainant_ID` | STRING (PXXXXXX) | 0 | 3,914 | FK → `people.Person_ID`. Complainant. |
| 13 | `Victim_ID` | STRING (PXXXXXX) | 0 | 3,977 | FK → `people.Person_ID`. Victim. |
| 14 | `Accused_ID` | STRING (PXXXXXX or CSV list) | 0 | 4,327 | FK → `people.Person_ID`. **May contain comma-separated IDs for multi-accused.** |
| 15 | `Investigating_Officer` | STRING | 0 | 11 | Officer name (e.g., "SI Ganesh Rao", "PI Ramesh Gowda"). |
| 16 | `Status` | STRING | 0 | 4 | Case status. |

**Crime_Head values (11):**

| Category | Count |
|----------|------:|
| Assault | 657 |
| Cyber Crime | 657 |
| Theft | 657 |
| Fraud | 433 |
| Burglary | 433 |
| Murder | 414 |
| NDPS | 328 |
| Vehicle Theft | ~300 |
| Robbery | ~200 |
| Dacoity | ~200 |
| POCSO | ~120 |

**Status values (4):**

| Status | Count |
|--------|------:|
| Chargesheeted | 2,469 |
| Under Investigation | 1,765 |
| Untraced | 482 |
| Closed | 284 |

**Date range:** 2025-01-01 to 2026-01-04.

**Candidate PKs:** `FIR_ID`, `FIR_Number`.
**Recommended PK:** `FIR_ID`.

**Critical edge case:** `Accused_ID` may contain comma-separated values
(e.g., `"P008456, P004333"`). Backend must parse this field to resolve
individual accused persons.

**FK integrity:**
- `Station_ID` → `stations.Station_ID`: 0 orphans (all 250 stations matched).
- `Complainant_ID` → `people.Person_ID`: 0 orphans.
- `Victim_ID` → `people.Person_ID`: 0 orphans.
- `Accused_ID` → `people.Person_ID`: 0 orphans (individual IDs after splitting).

### 3.5 arrests.csv — 2,540 rows, 19 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `Arrest_ID` | STRING (ARRXXXXX) | 0 | 2,540 | Primary key. |
| 2 | `FIR_ID` | STRING | 0 | 2,540 | FK → `firs.FIR_ID`. Each FIR has exactly 1 arrest record. |
| 3 | `Person_ID` | STRING | 0 | 2,292 | FK → `people.Person_ID`. Arrested person. |
| 4 | `Accused_Name` | STRING | 0 | 832 | Name of accused (denormalized from people). |
| 5 | `Gender` | STRING | 0 | 2 | "Male" (2,184) or "Female" (356). |
| 6 | `Age` | INT | 0 | 54 | Age at arrest. |
| 7 | `District` | STRING | 0 | 8 | District name (denormalized). |
| 8 | `Station_ID` | STRING | 0 | 250 | FK → `stations.Station_ID`. Arresting station. |
| 9 | `Arrest_Date` | DATETIME | 0 | 2,533 | When the arrest occurred. |
| 10 | `Arrest_Location` | STRING | 0 | 13 | Location type (e.g., "Lodge", "Residence", "Highway Checkpost"). |
| 11 | `Arresting_Officer` | STRING | 0 | 10 | Officer who made the arrest. |
| 12 | `Custody_Type` | STRING | 0 | 3 | "Police Custody", "Judicial Custody", or "Released on Bail". |
| 13 | `Bail_Status` | STRING | 0 | 3 | "Granted", "Rejected", or "Pending". |
| 14 | `Recovery_Item` | STRING | 0 | 9 | Item recovered (e.g., "Gold", "Cash", "Vehicle", "Drugs", "None"). |
| 15 | `Recovery_Value` | INT | 0 | 2,265 | Estimated value in INR. |
| 16 | `Medical_Examination` | STRING (Yes/No) | 0 | 2 | Whether medical exam was conducted. |
| 17 | `Fingerprint_Taken` | STRING (Yes/No) | 0 | 2 | Whether fingerprints were taken. |
| 18 | `DNA_Sample` | STRING (Yes/No) | 0 | 2 | Whether DNA sample was collected. |
| 19 | `Photograph_Taken` | STRING (Yes/No) | 0 | 2 | Whether photograph was taken. |

**Candidate PKs:** `Arrest_ID`.
**Recommended PK:** `Arrest_ID`.

**Cardinality:** Each FIR has at most 1 arrest record (1:0..1).
2,540 arrests reference 2,540 of the 5,000 FIRs (50.8%).

**FK integrity:**
- `FIR_ID` → `firs.FIR_ID`: 0 orphans.
- `Person_ID` → `people.Person_ID`: 0 orphans.
- `Station_ID` → `stations.Station_ID`: 0 orphans.

### 3.6 chargesheets.csv — 2,469 rows, 11 columns

| # | Column | Observed Type | Nulls | Unique | Description |
|---|--------|---------------|------:|-------:|-------------|
| 1 | `ChargeSheet_ID` | STRING (CS2025XXXXX) | 0 | 2,469 | Primary key. |
| 2 | `FIR_ID` | STRING | 0 | 2,469 | FK → `firs.FIR_ID`. Exactly 1:1 with FIRs. |
| 3 | `Accused_ID` | STRING | 0 | 2,234 | FK → `people.Person_ID`. |
| 4 | `Crime_Type` | STRING | 0 | 11 | Crime category (mirrors `firs.Crime_Head`). |
| 5 | `Sections` | STRING | 0 | 10 | Legal sections (mirrors `firs.BNS_Sections`). |
| 6 | `Investigating_Officer` | STRING | 0 | 11 | Officer name. |
| 7 | `Court` | STRING | 0 | 8 | Court name (e.g., "Bengaluru Urban District & Sessions Court"). |
| 8 | `Witness_Count` | INT | 0 | 17 | Number of witnesses. Range: ~1–18. |
| 9 | `Evidence_Count` | INT | 0 | 28 | Number of evidence items. Range: ~1–30. |
| 10 | `ChargeSheet_Date` | DATE | 0 | 412 | Filing date. Range: 2025-02-03 to 2026-04-16. |
| 11 | `Status` | STRING | 0 | 4 | "Accepted", "Filed", "Pending Scrutiny", "Returned for Correction". |

**ChargeSheet Status values (4):**

| Status | Count |
|--------|------:|
| Filed | 633 |
| Accepted | 627 |
| Pending Scrutiny | 613 |
| Returned for Correction | 596 |

**Candidate PKs:** `ChargeSheet_ID`, `FIR_ID` (both unique).
**Recommended PK:** `ChargeSheet_ID`. `FIR_ID` is a candidate unique key (1:1).

**Cardinality:** Each FIR has at most 1 chargesheet (1:0..1).
2,469 chargesheets reference 2,469 of the 5,000 FIRs (49.4%). All 2,469 chargesheeted FIRs have exactly one chargesheet.

**FK integrity:**
- `FIR_ID` → `firs.FIR_ID`: 0 orphans.
- `Accused_ID` → `people.Person_ID`: 0 orphans.

---

## 4. Observed Data Types

| CSV Type | Python Type | Backend Suggested Type | Notes |
|----------|-------------|------------------------|-------|
| INT | `int` | `int` | District_ID, Population, Age, etc. |
| FLOAT | `float` | `float` | Latitude, Longitude, Literacy_Rate. |
| STRING | `str` | `str` | All text fields. |
| DATE | `str` → parse | `date` | DOB, ChargeSheet_Date (YYYY-MM-DD). |
| DATETIME | `str` → parse | `datetime` | Incident_Date, FIR_Date, Arrest_Date (YYYY-MM-DD HH:MM). |
| Yes/No | `str` | `bool` | Medical_Examination, Fingerprint_Taken, DNA_Sample, Photograph_Taken. Backend should normalize to `bool`. |

**Boolean normalization:** Arrests.csv uses `"Yes"`/`"No"` strings for 4 boolean
columns. Backend should convert to Python `bool` at the repository or schema layer.

---

## 5. Candidate Keys

| File | Column | Uniqueness | Recommended Role |
|------|--------|------------|------------------|
| districts | `District_ID` | 31/31 unique | PK |
| districts | `District` | 31/31 unique | Alternate key |
| stations | `Station_ID` | 250/250 unique | PK |
| stations | `Contact_Number` | 250/250 unique | Alternate key |
| stations | `Email` | 250/250 unique | Alternate key |
| people | `Person_ID` | 10,000/10,000 unique | PK |
| firs | `FIR_ID` | 5,000/5,000 unique | PK |
| firs | `FIR_Number` | 5,000/5,000 unique | Alternate key |
| arrests | `Arrest_ID` | 2,540/2,540 unique | PK |
| chargesheets | `ChargeSheet_ID` | 2,469/2,469 unique | PK |
| chargesheets | `FIR_ID` | 2,469/2,469 unique | Alternate key (1:1) |

---

## 6. Relationship Mapping

```
districts (1) ──────< (N) stations
                              │
stations (1) ───────< (N) firs
                              │
                    ┌─────────┼──────────┐
                    │         │          │
                    v         v          v
              Complainant  Victim    Accused
              (people)    (people)  (people)
                    │
                    │
firs (1) ─────────< (0..1) arrests (at most 1 per FIR)
                    │
                    │
firs (1) ─────────< (0..1) chargesheets (at most 1 per FIR)
                              │
                              v
                        Accused (people)
```

### Relationship details

| Parent | Child | FK Column(s) | Cardinality | Orphans |
|--------|-------|-------------|-------------|---------|
| districts | stations | `stations.District_ID` | 1:N | 0 |
| stations | firs | `firs.Station_ID` | 1:N | 0 |
| people | firs | `firs.Complainant_ID` | 1:N | 0 |
| people | firs | `firs.Victim_ID` | 1:N | 0 |
| people | firs | `firs.Accused_ID` (may be CSV) | 1:N | 0 |
| firs | arrests | `arrests.FIR_ID` | 1:0..1 | 0 |
| firs | chargesheets | `chargesheets.FIR_ID` | 1:0..1 | 0 |
| people | arrests | `arrests.Person_ID` | 1:N | 0 |
| people | chargesheets | `chargesheets.Accused_ID` | 1:N | 0 |
| stations | people | `people.Station_ID` | 1:N | 0 |

### Role resolution

A person's role in the criminal justice system is determined by context:

| Role | Source | Example |
|------|--------|---------|
| Complainant | `firs.Complainant_ID = person.Person_ID` | Person who filed the FIR |
| Victim | `firs.Victim_ID = person.Person_ID` | Person harmed by the crime |
| Accused | `firs.Accused_ID` contains `person.Person_ID` | Person accused of the crime |
| Arrested | `arrests.Person_ID = person.Person_ID` | Person who was arrested |

A single `Person_ID` may appear in multiple roles across different FIRs.

---

## 7. Referential Integrity

| Check | Source FK | Target PK | Total FKs | Matched | Orphans | Status |
|-------|-----------|-----------|----------:|--------:|--------:|--------|
| stations → districts | `District_ID` | `District_ID` | 250 | 250 | 0 | PASS |
| firs → stations | `Station_ID` | `Station_ID` | 5,000 | 5,000 | 0 | PASS |
| firs → people (complainant) | `Complainant_ID` | `Person_ID` | 5,000 | 5,000 | 0 | PASS |
| firs → people (victim) | `Victim_ID` | `Person_ID` | 5,000 | 5,000 | 0 | PASS |
| firs → people (accused) | `Accused_ID` | `Person_ID` | 5,000 | 5,000 | 0 | PASS |
| arrests → firs | `FIR_ID` | `FIR_ID` | 2,540 | 2,540 | 0 | PASS |
| arrests → people | `Person_ID` | `Person_ID` | 2,540 | 2,540 | 0 | PASS |
| arrests → stations | `Station_ID` | `Station_ID` | 2,540 | 2,540 | 0 | PASS |
| chargesheets → firs | `FIR_ID` | `FIR_ID` | 2,469 | 2,469 | 0 | PASS |
| chargesheets → people | `Accused_ID` | `Person_ID` | 2,469 | 2,469 | 0 | PASS |

**All 10 FK checks pass with zero orphans.** Referential integrity is clean.

---

## 8. Data Quality

### 8.1 Null/blank analysis

**Zero nulls or blanks across all 20,290 records and all 83 columns.**
This is clean synthetic data — production data will likely have nulls.

### 8.2 District coverage gap

Only **8 of 31 districts** (District_IDs 1–8) appear in transactional data:
1. Bagalkote
2. Ballari
3. Belagavi
4. Bengaluru Rural
5. Bengaluru Urban
6. Bidar
7. Chamarajanagar
8. Chikkaballapura

The remaining 23 districts exist only in `districts.csv` and have no stations,
FIRs, arrests, or chargesheets.

### 8.3 Multi-accused FIRs

`firs.Accused_ID` may contain **comma-separated values** for multi-accused cases
(e.g., `"P008456, P004333"`). Backend must split and handle these correctly.

### 8.4 Station name non-uniqueness

65 station names are shared across multiple stations in different districts
(e.g., "Bagalkote North Rural Police Station" appears twice). `Station_ID`
is the reliable identifier.

### 8.5 Denormalized fields

Multiple files contain denormalized data:
- `firs.District` duplicates `stations.District`
- `arrests.District` duplicates `firs.District`
- `arrests.Accused_Name` duplicates `people.Full_Name`
- `chargesheets.Crime_Type` mirrors `firs.Crime_Head`
- `chargesheets.Sections` mirrors `firs.BNS_Sections`

Backend should prefer normalized joins over denormalized fields where possible.

### 8.6 Boolean string fields

Arrests.csv uses `"Yes"`/`"No"` strings for:
- `Medical_Examination`
- `Fingerprint_Taken`
- `DNA_Sample`
- `Photograph_Taken`

These should be normalized to `bool` in backend models/schemas.

### 8.7 Date format inconsistency

- `people.DOB`: date only (`YYYY-MM-DD`)
- `firs.Incident_Date` / `firs.FIR_Date`: datetime (`YYYY-MM-DD HH:MM`)
- `arrests.Arrest_Date`: datetime (`YYYY-MM-DD HH:MM`)
- `chargesheets.ChargeSheet_Date`: date only (`YYYY-MM-DD`)

Backend parsers must handle both formats.

---

## 9. Backend Module Mapping

### 9.1 Dashboard module (Phase 3)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| Total FIRs | `firs` | `FIR_ID` (COUNT) |
| Active cases | `firs` | `Status` IN ('Under Investigation') |
| Closed cases | `firs` | `Status` IN ('Closed', 'Chargesheeted') |
| Arrest count | `arrests` | `Arrest_ID` (COUNT) |
| Category distribution | `firs` | `Crime_Head` (GROUP BY) |
| District statistics | `firs` + `districts` | `District`, `Population` |
| Top districts | `firs` + `districts` | Aggregation by district |
| Daily/monthly summaries | `firs` | `Incident_Date`, `FIR_Date` |
| KPI cards | `firs` + `arrests` + `chargesheets` | Various aggregations |

### 9.2 District Intelligence module (Phase 4)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| District crime overview | `firs` + `districts` | `Crime_Head`, `District`, lat/lng |
| Police station table | `stations` + `firs` | Station info + FIR counts |
| Hotspot detection | `firs` | `Latitude`, `Longitude`, `Crime_Head` |
| Recent cases | `firs` | `FIR_ID`, `Crime_Head`, `Incident_Date`, `Status` |
| Crime statistics | `firs` + `chargesheets` | Status counts, resolution rates |

### 9.3 Crime Map module (Phase 5)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| Map markers | `firs` | `Latitude`, `Longitude`, `Crime_Head`, `Status` |
| District boundaries | `districts` | `Latitude`, `Longitude`, `District` |
| Station locations | `stations` | `Latitude`, `Longitude`, `Station_Name` |
| Layer filtering | `firs` | `Crime_Head`, `Status`, date filters |

### 9.4 Analytics module (Phase 6)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| Anomaly detection | `firs` + `stations` | `Crime_Head`, station-level aggregation |
| Network analysis | `firs` + `people` + `arrests` | Person-FIR relationships, co-accused |
| Risk scoring | `firs` + `arrests` + `chargesheets` | Crime patterns, arrest/chargesheet rates |
| Trend analysis | `firs` | Time-series on `Incident_Date` |

### 9.5 Reports module (Phase 7)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| District reports | All | Aggregated per district |
| Station reports | `stations` + `firs` + `arrests` | Station-level metrics |
| Crime reports | `firs` + `chargesheets` | Crime-type breakdowns |
| Export (CSV/PDF) | All | All relevant fields |

### 9.6 Network Analysis module (Phase 6)

| Frontend Need | CSV Source(s) | Fields Used |
|---------------|---------------|-------------|
| Person-to-person links | `firs` | Complainant ↔ Accused, Victim ↔ Accused |
| Co-accused networks | `firs.Accused_ID` | Multi-accused parsing |
| Repeat offenders | `arrests` + `people` | Person_ID frequency |
| Officer caseloads | `firs` | `Investigating_Officer` aggregation |

---

## 10. Backend/ML Ownership

| Component | Owner | CSV Dependencies |
|-----------|-------|------------------|
| Data loading / CSV ingestion | Backend | All |
| Repository / query layer | Backend | All |
| API endpoints | Backend | All |
| Dashboard aggregations | Backend | `firs`, `arrests`, `chargesheets`, `districts` |
| Crime map data | Backend | `firs`, `stations`, `districts` |
| Filter/pagination logic | Backend | All |
| Export/report generation | Backend | All |
| Anomaly detection model | ML Team | `firs`, `stations` (input) |
| Risk scoring model | ML Team | `firs`, `arrests`, `chargesheets` (input) |
| Network/graph analysis | Backend (graph construction) + ML (community detection) | `firs`, `people`, `arrests` |
| Prediction accuracy metric | ML Team | Not available in CSV — must be supplied by ML team |

**Boundary rule:** Backend aggregates and serves data. ML team supplies
trained models/artifacts. Backend never trains models. ML never exposes
raw database queries.

---

## 11. Sensitive Data

| File | Column(s) | Classification | Handling |
|------|-----------|----------------|----------|
| people | `Full_Name`, `DOB` | PII (Moderate) | Minimize in API responses; never log full payloads |
| people | `Blood_Group` | Sensitive (Health) | Exclude from public API responses |
| stations | `Contact_Number`, `Email` | Operational (Low) | Include in station detail API only |
| firs | `Complainant_ID`, `Victim_ID` | PII (High — crime victims) | Never expose full Person_ID in public endpoints; use anonymized IDs or aggregate |
| firs | `Accused_ID` | Sensitive (Legal) | Follow same rules as victims; accused ≠ guilty |
| firs | `Investigating_Officer` | PII (Low — public servants) | Include in detail views |
| arrests | `Accused_Name` | PII (High) | Minimize; prefer Person_ID references |
| arrests | `DNA_Sample`, `Fingerprint_Taken`, `Photograph_Taken` | Sensitive (Biometric) | Never expose in public API |
| arrests | `Recovery_Item`, `Recovery_Value` | Case-sensitive | Include in authorized detail views only |

### Handling rules

1. **Never log** full person records, FIR payloads, or arrest details.
2. **Minimize returned fields** — default API responses should omit PII columns.
3. **Anonymize** victim/complainant IDs in public aggregations.
4. **Accused ≠ guilty** — never imply guilt in API responses or labels.
5. **Correlation ≠ causation** — analytics outputs are decision-support signals.
6. **No Aadhaar/PAN** — these columns do not exist in the current dataset.
   If they appear in future data, they must be excluded from all API responses
   and never logged.

---

## 12. Data Provenance

| Attribute | Value |
|-----------|-------|
| Data type | Synthetic / generated working data |
| Source | `data/schema_reference/*.csv` |
| Format | UTF-8 CSV with headers |
| Encoding | UTF-8 |
| Delimiter | Comma |
| Date range | 2025-01-01 to 2026-04-16 |
| Geographic scope | 8 of 31 Karnataka districts |
| Total records | 20,290 across 6 files |
| Last verified | 2026-07-23 |

**Known limitations:**
1. Only 8 of 31 districts have transactional data.
2. All data is synthetic — not real operational data.
3. Date range covers ~16 months (Jan 2025 – Apr 2026).
4. No production-grade null handling needed (zero nulls in current data).
5. FIR numbering resets at year boundary (all FIR2025 prefix).

---

## 13. Architecture Implications

### 13.1 CSV loading strategy

Since data is in CSV files (not a live database), backend should implement:
- **Startup loading** — read all CSVs into in-memory structures or lightweight
  query engine (e.g., SQLite in-memory, DuckDB, or pandas).
- **Repository pattern** — abstract data access so the loading strategy can be
  swapped when production DB is available.
- **No ORM initially** — CSV data doesn't require SQLAlchemy models yet.
  Use Pydantic schemas for validation and plain Python for queries.

### 13.2 District filter normalization

Frontend shows "31 / 31 districts monitored" but only 8 have data. Backend
APIs should:
- Return all 31 districts in district listing endpoints.
- Handle empty results gracefully for districts with no FIRs.
- Document the coverage gap in API responses where appropriate.

### 13.3 Multi-accused parsing

`firs.Accused_ID` may contain comma-separated values. Backend must:
- Parse this field at the repository or service layer.
- Provide a normalized view for graph/network analysis.
- Handle single-ID and multi-ID cases uniformly.

### 13.4 Denormalization decisions

The CSVs contain significant denormalization. Backend should:
- Use normalized joins (e.g., `firs.Station_ID → stations`) for queries.
- Avoid relying on denormalized text fields for filtering.
- Prefer FK lookups for district names over embedded `District` text.

### 13.5 Date/time handling

- Store all timestamps in UTC internally.
- Accept filter parameters in ISO 8601 format.
- Support period-based filtering (daily, weekly, monthly, quarterly, yearly).

### 13.6 Pagination

All list endpoints must support pagination:
- `page` (default: 1)
- `page_size` (default: 50, max: 200)

Never return unrestricted bulk records.

---

## 14. Open Questions

| # | Question | Impact | Blocks |
|---|----------|--------|--------|
| 1 | Are these CSVs the real operational data or generated working data? | Data quality assumptions, production readiness | Deployment planning |
| 2 | What is the eventual production database engine? | ORM choice, SQL dialect, PostGIS decision | Checkpoint 2B |
| 3 | Will the data team provide additional districts (9–31) in future data? | Coverage expectations, frontend alignment | Module completeness |
| 4 | Is the Accused_ID comma-separated format intentional or a data generation artifact? | Parsing complexity, multi-accused handling | Network analysis |
| 5 | What is the relationship between `firs.Station_ID` (reporting station) and `arrests.Station_ID` (arresting station)? Are they always the same? | Query logic, join semantics | Arrest APIs |
| 6 | Will ML team supply model artifacts before or after Phase 6? | Risk/anomaly endpoint availability | Analytics module |
| 7 | Is authorization/authentication required? What role model? | Security middleware, access control | All endpoints |
| 8 | What is the expected peak concurrent load? | Caching, rate limiting, infrastructure | Performance planning |

---

## 15. Checkpoint 2B Readiness

### Ready to proceed

- [x] All 6 CSV files analyzed and documented
- [x] All primary keys identified and validated
- [x] All foreign key relationships verified (0 orphans across 10 checks)
- [x] Referential integrity confirmed clean
- [x] Data quality issues cataloged (multi-accused, denormalization, booleans)
- [x] Backend module mapping complete (Dashboard, District Intel, Crime Map, Analytics, Reports, Network)
- [x] Sensitive data classification documented
- [x] Architecture implications identified

### Needs resolution before 2B implementation

- [ ] Production database engine choice (or confirm CSV-in-memory for hackathon)
- [ ] Multi-accused parsing strategy confirmation
- [ ] Authorization model (or confirm "none for hackathon")

### Recommended approach for Checkpoint 2B

Given the CSV-based data contract and hackathon context, **recommend:**
1. **CSV-in-memory via SQLite** — load all 6 CSVs into SQLite at startup.
2. **Repository pattern** — abstract queries behind repository interfaces.
3. **Pydantic schemas** — define request/response contracts.
4. **No ORM** — use raw SQL for SQLite queries (simpler, faster for hackathon).
5. **Deferred auth** — document the gap but implement without auth initially.

---

*End of BACKEND_SCHEMA_MAPPING.md — Checkpoint 2A deliverable.*
