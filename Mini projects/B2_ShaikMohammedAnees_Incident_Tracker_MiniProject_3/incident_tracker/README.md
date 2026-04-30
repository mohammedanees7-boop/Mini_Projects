# IT Incident Auto-Triage & Tracker — Mini Project 3

A Python CLI tool that reads IT incident data, classifies each incident using regex,
creates mock tickets across ServiceNow, Jira, and Azure Boards, and generates an HTML report.

---

## 🖥️ Prerequisites

| What you need | Where to get it |
|---|---|
| Python 3.10 or higher | https://www.python.org/downloads/ |
| Git | https://git-scm.com/downloads |
| A terminal / command prompt | Built into Windows, Mac, Linux |

To check if Python is installed, open a terminal and type:
```
python --version
```
You should see something like `Python 3.11.4`.

---

## 📁 Folder Structure (after you unzip)

```
incident_tracker/
├── main.py                  ← Run this to start the tool
├── config.py                ← API settings (MOCK_API flag is here)
├── models/
│   ├── incident.py          ← Incident classes (base + 3 subclasses)
│   └── report.py            ← HTML + JSON report generator
├── services/
│   ├── servicenow.py        ← ServiceNow integration
│   ├── jira.py              ← Jira integration
│   └── azure_boards.py      ← Azure Boards integration
├── utils/
│   ├── classifier.py        ← Regex type + severity detection
│   ├── decorators.py        ← @log_call and @retry decorators
│   └── helpers.py           ← map / filter / reduce helpers
├── data/
│   └── incidents.json       ← 12 sample incident records (input)
└── output/
    ├── report.html          ← Auto-generated HTML report (created on run)
    └── summary.json         ← Auto-generated JSON summary (created on run)
```

---

## 🚀 Step-by-Step: How to Run the Project

### Step 1 — Unzip the project
Unzip `[YourBatchNo]_[YourName]_Incident_Tracker_MiniProject_3.zip` to any folder
on your computer, for example your Desktop.

### Step 2 — Open a terminal inside the project folder

**On Windows:**
1. Open File Explorer
2. Navigate into the `incident_tracker` folder (the one that contains `main.py`)
3. Click the address bar at the top, type `cmd`, and press Enter
   → This opens Command Prompt directly inside that folder

**On Mac / Linux:**
1. Open Terminal
2. Type: `cd ~/Desktop/incident_tracker`   *(adjust path if needed)*

### Step 3 — (Optional) Install the `requests` library
The project uses `requests` for real API calls. In mock mode it is not strictly required,
but it is good practice to install it:
```
pip install requests
```

### Step 4 — Run the tool

**Process all 12 incidents (mock mode, recommended for demo):**
```
python main.py
```

**Process only CRITICAL incidents:**
```
python main.py --severity critical
```

**Process only HIGH incidents:**
```
python main.py --severity high
```

### Step 5 — View the output

After running, open the file `output/report.html` in any web browser
(double-click the file in File Explorer / Finder).

You will see a styled dashboard with:
- Summary cards (total, critical, high, medium, low counts)
- Breakdown by type, severity, and team
- A detailed incident table with mock ticket IDs

---

## ⚙️ Configuration (config.py)

Open `config.py` in any text editor (Notepad, VS Code, etc.).

```python
MOCK_API = True   # ← Keep this True for mock mode (no real credentials needed)
```

**To use real APIs:** Set `MOCK_API = False` and fill in your actual credentials
for ServiceNow, Jira, and Azure Boards. You only need to do this for the stretch
goal of demonstrating a real ticket.

---

## 📋 What the tool does (pipeline summary)

```
data/incidents.json
        ↓
  Load 12 incidents
        ↓
  Validate schema (static method)
        ↓
  Detect type via regex → NetworkIncident / AppIncident / SecurityIncident
        ↓
  Detect severity via regex → critical / high / medium / low
        ↓
  Process in batches of 3
        ↓
  ┌─────────────────────────────────────────────────────┐
  │  ServiceNow (POST)  Jira (POST)  Azure Boards (POST)│
  │     MOCK-SNOW-xxx   MOCK-JIRA-xxx  MOCK-AZB-xxx     │
  └─────────────────────────────────────────────────────┘
        ↓
  output/report.html  +  output/summary.json
```

---

## 🎯 Stretch Goals (Bonus Features — already implemented)

| Stretch goal | Where to find it |
|---|---|
| `--severity` CLI flag | `main.py` — argparse section |
| Generator expression with comment | `models/incident.py` — `batch_incidents()` |
| Static method for JSON schema validation | `models/incident.py` — `Incident.validate_schema()` |
| Real API demo | Set `MOCK_API = False` in `config.py` and add credentials |

---

## 🐛 Common Problems & Fixes

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'requests'` | Run: `pip install requests` |
| `python: command not found` | Try `python3 main.py` instead of `python main.py` |
| `No such file or directory: data/incidents.json` | Make sure you run the command from inside the `incident_tracker/` folder |
| Report looks blank in browser | Try a different browser (Chrome or Firefox recommended) |

---

## 📦 Submission

Zip the entire `incident_tracker/` folder and rename it:
```
[B2]_[ShaikMohammedAnees]_Incident_Tracker_MiniProject_3.zip
```

Include in your submission:
- ✅ The complete project folder
- ✅ This README.md
- ✅ The `output/report.html` file generated from a successful mock-mode run

---

*Python Training Program — .NET + Python Freshers Batch*
