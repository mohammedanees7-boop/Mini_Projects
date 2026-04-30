# models/report.py — ReportGenerator: HTML + JSON output

import json
import os
from datetime import datetime


_SEVERITY_COLOURS = {
    'critical': '#e74c3c',
    'high'    : '#e67e22',
    'medium'  : '#f1c40f',
    'low'     : '#2ecc71',
}

_SEVERITY_TEXT_COLOURS = {
    'critical': '#ffffff',
    'high'    : '#ffffff',
    'medium'  : '#333333',
    'low'     : '#ffffff',
}

_TYPE_ICONS = {
    'NetworkIncident' : '🌐',
    'AppIncident'     : '⚙️',
    'SecurityIncident': '🔐',
    'Incident'        : '📋',
}


class ReportGenerator:
    """
    Receives a list of processed Incident objects and generates:
      • output/report.html  — styled HTML dashboard
      • output/summary.json — JSON summary
    """

    def __init__(self, incidents: list):
        self.incidents  = incidents
        self.generated  = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        os.makedirs('output', exist_ok=True)

    # ── HTML report ───────────────────────────────────────────────────────────

    def generate_html(self, path: str = 'output/report.html') -> str:
        """Write a styled HTML report and return the file path."""

        # Summary counts
        total    = len(self.incidents)
        critical = sum(1 for i in self.incidents if i.severity == 'critical')
        high     = sum(1 for i in self.incidents if i.severity == 'high')
        medium   = sum(1 for i in self.incidents if i.severity == 'medium')
        low      = sum(1 for i in self.incidents if i.severity == 'low')

        # Type breakdown
        type_counts: dict = {}
        for inc in self.incidents:
            t = type(inc).__name__
            type_counts[t] = type_counts.get(t, 0) + 1

        # Team breakdown
        team_counts: dict = {}
        for inc in self.incidents:
            team_counts[inc.assigned_team] = team_counts.get(inc.assigned_team, 0) + 1

        # ── Build rows ────────────────────────────────────────────────────────
        rows = ''
        for inc in sorted(self.incidents):   # sorted uses __lt__ → severity order
            sev_bg   = _SEVERITY_COLOURS.get(inc.severity, '#999')
            sev_fg   = _SEVERITY_TEXT_COLOURS.get(inc.severity, '#fff')
            icon     = _TYPE_ICONS.get(type(inc).__name__, '📋')
            inc_type = type(inc).__name__.replace('Incident', '')
            snow_id  = inc.ticket_ids.get('snow', '—')
            jira_id  = inc.ticket_ids.get('jira', '—')
            azure_id = inc.ticket_ids.get('azure', '—')
            ts       = inc.timestamp.strftime('%Y-%m-%d %H:%M')

            rows += f"""
            <tr>
              <td class="id-cell">{inc.id}</td>
              <td>{icon} {inc.title}</td>
              <td><span class="badge" style="background:{sev_bg};color:{sev_fg};">{inc.severity.upper()}</span></td>
              <td>{inc_type}</td>
              <td>{inc.assigned_team}</td>
              <td>{ts}</td>
              <td>
                <span class="ticket snow" title="ServiceNow">{snow_id}</span>
                <span class="ticket jira" title="Jira">{jira_id}</span>
                <span class="ticket azure" title="Azure">{azure_id}</span>
              </td>
            </tr>"""

        # ── Type tag pills ────────────────────────────────────────────────────
        type_tags = ' '.join(
            f'<span class="tag-type">{_TYPE_ICONS.get(k,"📋")} {k.replace("Incident","")} '
            f'<b>{v}</b></span>'
            for k, v in type_counts.items()
        )

        # ── Severity tag pills ────────────────────────────────────────────────
        sev_tags = ''
        for sev in ['critical', 'high', 'medium', 'low']:
            cnt = sum(1 for i in self.incidents if i.severity == sev)
            bg  = _SEVERITY_COLOURS.get(sev, '#999')
            fg  = _SEVERITY_TEXT_COLOURS.get(sev, '#fff')
            sev_tags += (f'<span class="badge" style="background:{bg};color:{fg};">'
                         f'{sev.upper()} <b>{cnt}</b></span> ')

        # ── Team tags ─────────────────────────────────────────────────────────
        team_tags = ' '.join(
            f'<span class="tag-team">{team} <b>{cnt}</b></span>'
            for team, cnt in team_counts.items()
        )

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>IT Incident Auto-Triage Report</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f0f2f5;
      color: #333;
    }}
    header {{
      background: linear-gradient(135deg, #1a2340 0%, #2c3e6b 100%);
      color: #fff;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    header h1 {{ font-size: 1.4rem; font-weight: 700; }}
    header p  {{ font-size: 0.82rem; opacity: 0.75; margin-top: 4px; }}
    .container {{ max-width: 1300px; margin: 28px auto; padding: 0 20px; }}

    /* Summary cards */
    .summary {{
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }}
    .card {{
      background: #fff;
      border-radius: 10px;
      padding: 18px 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      text-align: center;
      min-width: 110px;
    }}
    .card .num {{ font-size: 2rem; font-weight: 800; color: #2c3e6b; }}
    .card .lbl {{ font-size: 0.75rem; color: #888; margin-top: 2px; }}

    /* Breakdown panels */
    .breakdown {{
      background: #fff;
      border-radius: 10px;
      padding: 16px 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      margin-bottom: 20px;
    }}
    .breakdown h3 {{ font-size: 0.85rem; color: #555; margin-bottom: 10px; }}

    .badge {{
      display: inline-block;
      border-radius: 20px;
      padding: 3px 12px;
      font-size: 0.75rem;
      font-weight: 700;
      margin: 2px;
    }}
    .tag-type, .tag-team {{
      display: inline-block;
      background: #eef0f7;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 0.8rem;
      margin: 2px;
    }}

    /* Table */
    .table-wrap {{
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      overflow: hidden;
    }}
    .table-wrap h3 {{
      padding: 16px 24px;
      font-size: 0.95rem;
      border-bottom: 1px solid #eee;
    }}
    table {{ width: 100%; border-collapse: collapse; font-size: 0.82rem; }}
    thead tr {{ background: #1a2340; color: #fff; }}
    th {{ padding: 11px 14px; text-align: left; font-weight: 600; }}
    tbody tr {{ border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }}
    tbody tr:hover {{ background: #f7f9ff; }}
    td {{ padding: 10px 14px; vertical-align: middle; }}
    .id-cell {{ font-weight: 700; color: #2c3e6b; }}

    .ticket {{
      display: inline-block;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 0.72rem;
      font-weight: 600;
      margin: 1px;
    }}
    .ticket.snow  {{ background: #e8f5e9; color: #2e7d32; }}
    .ticket.jira  {{ background: #e3f2fd; color: #1565c0; }}
    .ticket.azure {{ background: #fce4ec; color: #880e4f; }}

    footer {{
      text-align: center;
      padding: 24px;
      font-size: 0.75rem;
      color: #aaa;
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>🖥️ IT Incident Auto-Triage Report</h1>
      <p>Generated: {self.generated} &nbsp;|&nbsp; Total incidents: {total}</p>
    </div>
  </header>

  <div class="container">

    <!-- Summary Cards -->
    <div class="summary">
      <div class="card"><div class="num">{total}</div><div class="lbl">Total Incidents</div></div>
      <div class="card"><div class="num" style="color:#e74c3c">{critical}</div><div class="lbl">Critical</div></div>
      <div class="card"><div class="num" style="color:#e67e22">{high}</div><div class="lbl">High</div></div>
      <div class="card"><div class="num" style="color:#c0a000">{medium}</div><div class="lbl">Medium</div></div>
      <div class="card"><div class="num" style="color:#27ae60">{low}</div><div class="lbl">Low</div></div>
    </div>

    <!-- Breakdown by Type -->
    <div class="breakdown">
      <h3>Breakdown by Type</h3>
      {type_tags}
    </div>

    <!-- Breakdown by Severity -->
    <div class="breakdown">
      <h3>Breakdown by Severity</h3>
      {sev_tags}
    </div>

    <!-- Breakdown by Team -->
    <div class="breakdown">
      <h3>Breakdown by Team</h3>
      {team_tags}
    </div>

    <!-- Incident Detail Table -->
    <div class="table-wrap">
      <h3>Incident Detail</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Severity</th>
            <th>Type</th>
            <th>Team</th>
            <th>Timestamp</th>
            <th>Tickets (SNOW | Jira | Azure)</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>

  </div>
  <footer>IT Incident Auto-Triage Tracker — Mini Project 3</footer>
</body>
</html>"""

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"  ✅ HTML report written → {path}")
        return path

    # ── JSON export ───────────────────────────────────────────────────────────

    def export_json(self, path: str = 'output/summary.json') -> str:
        """Write a JSON summary of all incidents and return the file path."""
        summary = {
            'generated'  : self.generated,
            'total'      : len(self.incidents),
            'incidents'  : [i.to_dict() for i in self.incidents],
        }
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, default=str)

        print(f"  ✅ JSON summary written → {path}")
        return path
