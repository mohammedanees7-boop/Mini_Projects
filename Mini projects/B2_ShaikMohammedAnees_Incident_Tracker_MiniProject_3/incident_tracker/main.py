#!/usr/bin/env python3
"""
main.py — IT Incident Auto-Triage & Tracker
============================================
Entry point for the CLI tool.

Usage:
    python main.py                          # process all incidents
    python main.py --severity critical      # only push critical incidents
    python main.py --severity high          # only push high incidents

The pipeline:
  1. Load raw incidents from data/incidents.json
  2. Validate each record's schema
  3. Classify each incident (type + severity) via regex
  4. Trigger domain-specific side-effects (escalate, notify_soc, etc.)
  5. Push tickets to ServiceNow, Jira, and Azure Boards (mock or real)
  6. Generate output/report.html + output/summary.json
"""

import argparse
import json
import sys
import os

# ── Make sure imports work regardless of where main.py is run from ────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Internal imports ──────────────────────────────────────────────────────────
import config
from models.incident    import (Incident, NetworkIncident, AppIncident,
                                SecurityIncident, IncidentIterator,
                                batch_incidents)
from models.report      import ReportGenerator
from services           import servicenow, jira, azure_boards
from utils.classifier   import detect_type
from utils.helpers      import (get_critical_incidents, get_incidents_by_severity,
                                get_summary_stats)


# ══════════════════════════════════════════════════════════════════════════════
# STEP 1 — Load raw JSON
# ══════════════════════════════════════════════════════════════════════════════

def load_incidents(path: str) -> list[dict]:
    """Read incidents.json and return a list of raw dicts."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


# ══════════════════════════════════════════════════════════════════════════════
# STEP 2 — Instantiate correct subclass based on detected type
# ══════════════════════════════════════════════════════════════════════════════

def build_incident(record: dict) -> Incident:
    """
    Validate the raw record, detect its type via regex,
    and return the appropriate Incident subclass instance.
    """
    # Stretch goal: validate schema before constructing
    Incident.validate_schema(record)

    combined = f"{record['title']} {record['description']}"
    inc_type = detect_type(combined)

    common = dict(
        id           = record['id'],
        title        = record['title'],
        description  = record['description'],
        reported_by  = record['reported_by'],
        timestamp    = record['timestamp'],
        assigned_team= record['assigned_team'],
    )

    if inc_type == 'network':
        return NetworkIncident(**common)
    elif inc_type == 'security':
        return SecurityIncident(**common)
    elif inc_type == 'app':
        return AppIncident(**common)
    else:
        return Incident(**common)   # fallback — general incident


# ══════════════════════════════════════════════════════════════════════════════
# STEP 3 — Push tickets to all three platforms
# ══════════════════════════════════════════════════════════════════════════════

def push_tickets(incident: Incident):
    """Call all three service modules and store ticket IDs on the incident."""
    print(f"\n  Processing: [{incident.id}] {incident.title}")
    print(f"  Type: {type(incident).__name__}  |  Severity: {incident.severity}")

    snow_id  = servicenow.create_ticket(incident)
    jira_id  = jira.create_issue(incident)
    azure_id = azure_boards.create_work_item(incident)

    incident.ticket_ids['snow' ] = snow_id
    incident.ticket_ids['jira' ] = jira_id
    incident.ticket_ids['azure'] = azure_id


# ══════════════════════════════════════════════════════════════════════════════
# STEP 4 — Domain-specific side-effects
# ══════════════════════════════════════════════════════════════════════════════

def trigger_side_effects(incident: Incident):
    """Call type-specific extra methods based on severity."""
    if isinstance(incident, NetworkIncident) and incident.severity == 'critical':
        incident.escalate()

    if isinstance(incident, SecurityIncident):
        incident.notify_soc()

    if isinstance(incident, AppIncident) and incident.severity in ('critical', 'high'):
        print(incident.get_stack_trace())


# ══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

def main():
    # ── Argument parsing ──────────────────────────────────────────────────────
    parser = argparse.ArgumentParser(
        description='IT Incident Auto-Triage & Tracker'
    )
    parser.add_argument(
        '--severity',
        choices=['critical', 'high', 'medium', 'low'],
        default=None,
        help='Filter: only push incidents of this severity level',
    )
    args = parser.parse_args()

    print("=" * 65)
    print("  IT INCIDENT AUTO-TRIAGE & TRACKER")
    print(f"  Mode: {'MOCK (no real API calls)' if config.MOCK_API else 'LIVE'}")
    if args.severity:
        print(f"  Filter: severity == '{args.severity}' only")
    print("=" * 65)

    # ── Load raw JSON ─────────────────────────────────────────────────────────
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'data', 'incidents.json')
    raw_records = load_incidents(data_path)
    print(f"\n✔ Loaded {len(raw_records)} raw incident records from {data_path}")

    # ── Build incident objects ────────────────────────────────────────────────
    incidents: list[Incident] = []
    for record in raw_records:
        try:
            inc = build_incident(record)
            incidents.append(inc)
        except ValueError as e:
            print(f"  ⚠ Skipping record: {e}")

    # ── Classify each incident (sets severity) ────────────────────────────────
    for inc in incidents:
        if hasattr(inc, 'classify') and type(inc) is not Incident:
            inc.classify()

    print(f"✔ Classified {len(incidents)} incidents\n")

    # ── Print summary before processing ──────────────────────────────────────
    stats = get_summary_stats(incidents)
    print(f"  Summary: {stats['by_severity']}")
    print(f"  Types  : {stats['by_type']}")

    # ── Apply severity filter if requested (--severity flag) ──────────────────
    if args.severity:
        incidents_to_process = get_incidents_by_severity(incidents, args.severity)
        print(f"\n  → Filtering to {len(incidents_to_process)} "
              f"'{args.severity}' incidents for ticket creation.")
    else:
        incidents_to_process = incidents

    # ── Process in batches of 3 (using generator) ─────────────────────────────
    print("\n" + "─" * 65)
    print("  TICKET CREATION (batches of 3)")
    print("─" * 65)

    processed: list[Incident] = []

    for batch_num, batch in enumerate(batch_incidents(incidents_to_process, batch_size=3), 1):
        print(f"\n  ── Batch {batch_num} ──")
        for inc in batch:
            push_tickets(inc)
            trigger_side_effects(inc)
            processed.append(inc)

    # ── Merge ticket IDs back into the full incident list for the report ───────
    # (if filter was used, unprocessed incidents have empty ticket_ids — that's fine)
    all_for_report = incidents   # always include all incidents in the report

    # ── Generate HTML report + JSON summary ───────────────────────────────────
    print("\n" + "─" * 65)
    print("  GENERATING REPORTS")
    print("─" * 65)

    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
    os.makedirs(output_dir, exist_ok=True)

    rg = ReportGenerator(all_for_report)
    html_path = rg.generate_html(os.path.join(output_dir, 'report.html'))
    json_path = rg.export_json(os.path.join(output_dir, 'summary.json'))

    # ── Show critical incidents via IncidentIterator ──────────────────────────
    print("\n" + "─" * 65)
    print("  CRITICAL INCIDENTS SUMMARY (IncidentIterator demo)")
    print("─" * 65)
    critical_iter = IncidentIterator(incidents, severity_filter='critical')
    for inc in critical_iter:
        print(f"  🔴 {inc}")

    print("\n" + "=" * 65)
    print(f"  ✅ Pipeline complete.")
    print(f"     Tickets created : {len(processed)}")
    print(f"     Report          : {html_path}")
    print(f"     JSON summary    : {json_path}")
    print("=" * 65)


if __name__ == '__main__':
    main()
