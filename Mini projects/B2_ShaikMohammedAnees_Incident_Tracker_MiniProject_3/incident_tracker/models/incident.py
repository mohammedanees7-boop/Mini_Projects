# models/incident.py — Incident base class, subclasses, iterator, and batch generator

from datetime import datetime
from utils.classifier import detect_type, detect_severity

# Severity ranking used for sorting (lower number = more severe)
_SEVERITY_RANK = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}


# ══════════════════════════════════════════════════════════════════════════════
# BASE CLASS
# ══════════════════════════════════════════════════════════════════════════════

class Incident:
    """
    Base class for all incident types.
    Subclasses MUST override classify().
    """

    def __init__(self, id, title, description, reported_by, timestamp, assigned_team):
        self.id           = id
        self.title        = title
        self.description  = description
        self.reported_by  = reported_by
        self.timestamp    = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        self.assigned_team = assigned_team
        self._severity    = None    # private — set by classify()
        self.ticket_ids   = {}      # populated after API calls: {'snow': ..., 'jira': ..., 'azure': ...}

    # ── Abstract method ───────────────────────────────────────────────────────

    def classify(self):
        """Must be overridden by every subclass."""
        raise NotImplementedError("Subclasses must implement classify()")

    # ── Property ──────────────────────────────────────────────────────────────

    @property
    def severity(self):
        return self._severity

    # ── Static method: JSON schema validator ──────────────────────────────────

    @staticmethod
    def validate_schema(record: dict) -> bool:
        """
        Validates that a raw JSON record has all required fields.
        Returns True if valid, raises ValueError if not.
        (Stretch goal requirement)
        """
        required_fields = {'id', 'title', 'description', 'reported_by',
                           'timestamp', 'assigned_team'}
        missing = required_fields - set(record.keys())
        if missing:
            raise ValueError(f"Incident record {record.get('id', '?')} "
                             f"is missing fields: {missing}")
        return True

    # ── Serialisation ─────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        return {
            'id'           : self.id,
            'title'        : self.title,
            'description'  : self.description,
            'reported_by'  : self.reported_by,
            'timestamp'    : self.timestamp.isoformat(),
            'assigned_team': self.assigned_team,
            'severity'     : self._severity,
            'type'         : type(self).__name__,
            'ticket_ids'   : self.ticket_ids,
        }

    def __str__(self):
        return (f"[{self.id}] {self.title} | "
                f"Severity: {self._severity} | Team: {self.assigned_team}")

    def __repr__(self):
        return (f"{type(self).__name__}(id={self.id!r}, "
                f"severity={self._severity!r})")

    def __lt__(self, other):
        """Enables sorting by severity: critical < high < medium < low."""
        return (_SEVERITY_RANK.get(self._severity, 99) <
                _SEVERITY_RANK.get(other._severity, 99))


# ══════════════════════════════════════════════════════════════════════════════
# SUBCLASS 1 — NetworkIncident
# ══════════════════════════════════════════════════════════════════════════════

class NetworkIncident(Incident):
    """Represents network-related incidents: outages, switch failures, packet loss, etc."""

    def __init__(self, id, title, description, reported_by, timestamp,
                 assigned_team, affected_host="", protocol=""):
        super().__init__(id, title, description, reported_by, timestamp, assigned_team)
        self.affected_host = affected_host
        self.protocol      = protocol

    def classify(self):
        """Sets severity using regex on title + description."""
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def escalate(self):
        """Simulates paging the on-call network team."""
        print(f"  🚨 [ESCALATE] Paging on-call network team for incident {self.id}: "
              f"'{self.title}'")

    def to_dict(self) -> dict:
        d = super().to_dict()
        d.update({'affected_host': self.affected_host, 'protocol': self.protocol})
        return d


# ══════════════════════════════════════════════════════════════════════════════
# SUBCLASS 2 — AppIncident
# ══════════════════════════════════════════════════════════════════════════════

class AppIncident(Incident):
    """Represents application-level incidents: exceptions, HTTP errors, timeouts, etc."""

    def __init__(self, id, title, description, reported_by, timestamp,
                 assigned_team, app_name="", error_code=""):
        super().__init__(id, title, description, reported_by, timestamp, assigned_team)
        self.app_name   = app_name
        self.error_code = error_code

    def classify(self):
        """Sets severity using regex on title + description."""
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def get_stack_trace(self) -> str:
        """Returns a simulated stack trace / log snippet for the incident."""
        return (
            f"  [STACK TRACE — {self.id}]\n"
            f"  Exception in thread 'main' java.lang.{self.error_code or 'Exception'}\n"
            f"    at com.company.{self.app_name or 'app'}.Service.process(Service.java:42)\n"
            f"    at com.company.{self.app_name or 'app'}.Main.run(Main.java:18)\n"
        )

    def to_dict(self) -> dict:
        d = super().to_dict()
        d.update({'app_name': self.app_name, 'error_code': self.error_code})
        return d


# ══════════════════════════════════════════════════════════════════════════════
# SUBCLASS 3 — SecurityIncident
# ══════════════════════════════════════════════════════════════════════════════

class SecurityIncident(Incident):
    """Represents security incidents: breaches, ransomware, phishing, brute-force, etc."""

    def __init__(self, id, title, description, reported_by, timestamp,
                 assigned_team, threat_type="", source_ip=""):
        super().__init__(id, title, description, reported_by, timestamp, assigned_team)
        self.threat_type = threat_type
        self.source_ip   = source_ip

    def classify(self):
        """Sets severity using regex on title + description."""
        combined = f"{self.title} {self.description}"
        self._severity = detect_severity(combined)

    def notify_soc(self):
        """Simulates sending an alert to the Security Operations Centre."""
        print(f"  🔐 [SOC ALERT] Security incident {self.id} reported: "
              f"'{self.title}' | Threat: {self.threat_type} | Source IP: {self.source_ip}")

    def to_dict(self) -> dict:
        d = super().to_dict()
        d.update({'threat_type': self.threat_type, 'source_ip': self.source_ip})
        return d


# ══════════════════════════════════════════════════════════════════════════════
# INCIDENT ITERATOR
# ══════════════════════════════════════════════════════════════════════════════

class IncidentIterator:
    """
    Custom iterator over a list of Incident objects.
    Supports optional severity filtering.

    Usage:
        for incident in IncidentIterator(incidents, severity_filter='critical'):
            ...
    """

    def __init__(self, incidents: list, severity_filter: str = None):
        self._incidents       = incidents
        self._severity_filter = severity_filter
        self._index           = 0

        if severity_filter:
            self._filtered = [i for i in incidents
                              if i.severity == severity_filter]
        else:
            self._filtered = incidents

    def __iter__(self):
        self._index = 0   # reset so the iterator can be reused
        return self

    def __next__(self):
        if self._index >= len(self._filtered):
            raise StopIteration
        item = self._filtered[self._index]
        self._index += 1
        return item


# ══════════════════════════════════════════════════════════════════════════════
# BATCH GENERATOR
# ══════════════════════════════════════════════════════════════════════════════

def batch_incidents(incidents: list, batch_size: int = 3):
    """
    Generator: yields incidents in batches of `batch_size`.

    Using a generator (yield) instead of building the full list at once
    is memory-efficient — especially useful when incident lists are large.
    """
    for i in range(0, len(incidents), batch_size):
        yield incidents[i: i + batch_size]
