# services/servicenow.py — ServiceNow REST API integration (real + mock)

import json
import base64
import uuid

import config
from utils.decorators import log_call, retry

# Severity → ServiceNow urgency mapping
_URGENCY_MAP = {'critical': 1, 'high': 1, 'medium': 2, 'low': 3}


@log_call
@retry(times=3, delay=1)
def create_ticket(incident) -> str:
    """
    Create a ServiceNow incident ticket.
    Returns the ticket sys_id (real or mock).
    """
    payload = {
        "short_description": incident.title,
        "description"      : incident.description,
        "urgency"          : _URGENCY_MAP.get(incident.severity, 3),
        "category"         : type(incident).__name__.replace('Incident', '').lower(),
        "assignment_group" : incident.assigned_team,
        "caller_id"        : incident.reported_by,
    }

    if config.MOCK_API:
        mock_id = f"MOCK-SNOW-{incident.id}"
        print(f"\n    [ServiceNow MOCK] Would POST to: {config.SNOW_BASE_URL}")
        print(f"    Payload: {json.dumps(payload, indent=6)}")
        print(f"    → Fake ticket ID: {mock_id}")
        return mock_id

    # ── Real API call ──────────────────────────────────────────────────────
    import requests
    from requests.auth import HTTPBasicAuth

    response = requests.post(
        config.SNOW_BASE_URL,
        json=payload,
        auth=HTTPBasicAuth(config.SNOW_USERNAME, config.SNOW_PASSWORD),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        timeout=10,
    )
    response.raise_for_status()
    sys_id = response.json()['result']['sys_id']
    print(f"    [ServiceNow] Created ticket: {sys_id}")
    return sys_id


@log_call
@retry(times=3, delay=1)
def update_ticket_status(sys_id: str, status: str = 'In Progress'):
    """
    PATCH an existing ServiceNow ticket to update its state.
    """
    state_map = {'New': 1, 'In Progress': 2, 'Resolved': 6, 'Closed': 7}
    payload = {"state": state_map.get(status, 2)}

    if config.MOCK_API:
        print(f"    [ServiceNow MOCK] Would PATCH ticket {sys_id} → state={status}")
        return

    import requests
    from requests.auth import HTTPBasicAuth

    url = f"{config.SNOW_BASE_URL}/{sys_id}"
    response = requests.patch(
        url,
        json=payload,
        auth=HTTPBasicAuth(config.SNOW_USERNAME, config.SNOW_PASSWORD),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        timeout=10,
    )
    response.raise_for_status()
    print(f"    [ServiceNow] Updated ticket {sys_id} → {status}")
