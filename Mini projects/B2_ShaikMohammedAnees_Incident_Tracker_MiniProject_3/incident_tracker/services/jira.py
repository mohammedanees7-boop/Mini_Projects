# services/jira.py — Jira REST API integration (real + mock)

import json
import base64

import config
from utils.decorators import log_call, retry

# Severity → Jira priority mapping
_PRIORITY_MAP = {
    'critical': 'Highest',
    'high'    : 'High',
    'medium'  : 'Medium',
    'low'     : 'Low',
}

# Incident type → Jira label mapping
_LABEL_MAP = {
    'NetworkIncident' : 'network',
    'AppIncident'     : 'application',
    'SecurityIncident': 'security',
}


def _build_auth_header() -> dict:
    """Base64-encode email:api_token for Jira Bearer auth."""
    credentials = f"{config.JIRA_EMAIL}:{config.JIRA_API_TOKEN}"
    encoded     = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type" : "application/json",
        "Accept"       : "application/json",
    }


@log_call
@retry(times=3, delay=1)
def create_issue(incident) -> str:
    """
    Create a Jira issue for the incident.
    Returns the issue key (e.g. 'IT-42') or a mock key.
    """
    label = _LABEL_MAP.get(type(incident).__name__, 'general')

    payload = {
        "fields": {
            "summary"    : incident.title,
            "description": {
                "type"   : "doc",
                "version": 1,
                "content": [
                    {
                        "type"   : "paragraph",
                        "content": [{"type": "text", "text": incident.description}],
                    }
                ],
            },
            "issuetype" : {"name": "Bug"},
            "priority"  : {"name": _PRIORITY_MAP.get(incident.severity, "Medium")},
            "project"   : {"key": config.JIRA_PROJECT_KEY},
            "labels"    : [label, incident.assigned_team.replace(' ', '_')],
        }
    }

    if config.MOCK_API:
        mock_key = f"MOCK-JIRA-{incident.id}"
        print(f"\n    [Jira MOCK] Would POST to: {config.JIRA_BASE_URL}")
        print(f"    Payload: {json.dumps(payload, indent=6)}")
        print(f"    → Fake issue key: {mock_key}")
        return mock_key

    # ── Real API call ──────────────────────────────────────────────────────
    import requests

    response = requests.post(
        config.JIRA_BASE_URL,
        json=payload,
        headers=_build_auth_header(),
        timeout=10,
    )
    response.raise_for_status()
    issue_key = response.json()['key']
    print(f"    [Jira] Created issue: {issue_key}")
    return issue_key


@log_call
@retry(times=3, delay=1)
def update_issue_priority(issue_key: str, priority: str = 'High'):
    """
    PUT to update an existing Jira issue's priority.
    """
    payload = {"fields": {"priority": {"name": priority}}}

    if config.MOCK_API:
        print(f"    [Jira MOCK] Would PUT issue {issue_key} → priority={priority}")
        return

    import requests

    url = f"{config.JIRA_BASE_URL}/{issue_key}"
    response = requests.put(
        url,
        json=payload,
        headers=_build_auth_header(),
        timeout=10,
    )
    response.raise_for_status()
    print(f"    [Jira] Updated issue {issue_key} → priority={priority}")
