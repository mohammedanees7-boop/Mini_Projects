# utils/helpers.py — Functional helpers using map / filter / reduce

from functools import reduce


def get_critical_incidents(incidents):
    """Return only incidents with severity == 'critical' (uses filter)."""
    return list(filter(lambda i: i.severity == 'critical', incidents))


def get_incidents_by_severity(incidents, severity: str):
    """Return incidents matching a given severity level (uses filter)."""
    return list(filter(lambda i: i.severity == severity, incidents))


def build_jira_payloads(incidents):
    """Convert all incidents to dict representation for Jira payloads (uses map)."""
    return list(map(lambda i: i.to_dict(), incidents))


def count_by_team(incidents) -> dict:
    """
    Count incidents grouped by assigned_team.
    Uses reduce — returns e.g. {'Backend': 4, 'Network Ops': 3, ...}
    """
    return reduce(
        lambda acc, i: {**acc, i.assigned_team: acc.get(i.assigned_team, 0) + 1},
        incidents,
        {}
    )


def count_by_type(incidents) -> dict:
    """Count incidents grouped by their class name (type)."""
    return reduce(
        lambda acc, i: {
            **acc,
            type(i).__name__: acc.get(type(i).__name__, 0) + 1
        },
        incidents,
        {}
    )


def count_by_severity(incidents) -> dict:
    """Count incidents grouped by severity level."""
    return reduce(
        lambda acc, i: {**acc, i.severity: acc.get(i.severity, 0) + 1},
        incidents,
        {}
    )


def get_summary_stats(incidents) -> dict:
    """Return a combined summary dict for report generation."""
    return {
        'total'      : len(incidents),
        'by_severity': count_by_severity(incidents),
        'by_type'    : count_by_type(incidents),
        'by_team'    : count_by_team(incidents),
    }
