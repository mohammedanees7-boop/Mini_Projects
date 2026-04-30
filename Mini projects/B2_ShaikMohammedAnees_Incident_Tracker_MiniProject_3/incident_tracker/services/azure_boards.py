# services/azure_boards.py — Azure Boards REST API integration (real + mock)

import json
import base64

import config
from utils.decorators import log_call, retry

# Severity → Azure Boards priority mapping (1=Critical, 2=High, 3=Medium, 4=Low)
_PRIORITY_MAP = {'critical': 1, 'high': 2, 'medium': 3, 'low': 4}


def _build_auth_header() -> dict:
    """Base64-encode PAT for Azure DevOps Basic auth."""
    encoded = base64.b64encode(f":{config.AZURE_PAT}".encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type" : "application/json-patch+json",
    }


@log_call
@retry(times=3, delay=1)
def create_work_item(incident) -> str:
    """
    Create an Azure Boards Bug work item for the incident.
    Returns the work item ID (int as string) or a mock ID.

    Note: Azure Boards uses JSON Patch format for work item creation.
    """
    payload = [
        {
            "op"   : "add",
            "path" : "/fields/System.Title",
            "value": incident.title,
        },
        {
            "op"   : "add",
            "path" : "/fields/System.Description",
            "value": incident.description,
        },
        {
            "op"   : "add",
            "path" : "/fields/Microsoft.VSTS.Common.Priority",
            "value": _PRIORITY_MAP.get(incident.severity, 3),
        },
        {
            "op"   : "add",
            "path" : "/fields/System.AssignedTo",
            "value": incident.assigned_team,
        },
        {
            "op"   : "add",
            "path" : "/fields/System.Tags",
            "value": f"{type(incident).__name__}; {incident.severity}",
        },
    ]

    if config.MOCK_API:
        mock_id = f"MOCK-AZB-{incident.id}"
        print(f"\n    [Azure Boards MOCK] Would POST to: {config.AZURE_BASE_URL}")
        print(f"    Payload (JSON Patch): {json.dumps(payload, indent=6)}")
        print(f"    → Fake work item ID: {mock_id}")
        return mock_id

    # ── Real API call ──────────────────────────────────────────────────────
    import requests

    response = requests.post(
        config.AZURE_BASE_URL,
        json=payload,
        headers=_build_auth_header(),
        timeout=10,
    )
    response.raise_for_status()
    work_item_id = str(response.json()['id'])
    print(f"    [Azure Boards] Created work item: {work_item_id}")
    return work_item_id
