# utils/classifier.py — Regex-based incident type and severity detection

import re

# ── Pre-compiled patterns ─────────────────────────────────────────────────────

# Matches network-related keywords: IP addresses, protocols, network devices
NETWORK_PATTERN = re.compile(
    r'\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|TCP|UDP|ICMP|VLAN|switch|firewall|'
    r'router|DNS|packet|network|NIC|ethernet|bandwidth|latency|ping|traceroute|'
    r'subnet|gateway|interface|port|rack|DC)\b',
    re.IGNORECASE
)

# Matches security-related keywords
SECURITY_PATTERN = re.compile(
    r'\b(breach|ransomware|brute[\-\s]?force|malware|phishing|unauthorized|'
    r'intrusion|exploit|vulnerability|CVE|suspicious|threat|virus|trojan|'
    r'credential|privilege|escalation|injection|XSS|DDoS)\b',
    re.IGNORECASE
)

# Matches application-level keywords: error codes, exceptions, HTTP status codes
APP_PATTERN = re.compile(
    r'\b(NullPointerException|StackOverflow|OutOfMemory|HTTP[\-\s]?\d{3}|'
    r'HTTP503|HTTP500|HTTP404|error\s*code|exception|stack\s*trace|crash|'
    r'timeout|500|503|404|deploy|build|pipeline|CI/CD|microservice|API|'
    r'database|DB|query|ORM|payload|endpoint|service|container|pod)\b',
    re.IGNORECASE
)

# Severity keywords
CRITICAL_PATTERN = re.compile(
    r'\b(outage|down|breach|ransomware|production|prod|critical|offline|'
    r'unavailable|data\s*loss|emergency|catastrophic)\b',
    re.IGNORECASE
)

HIGH_PATTERN = re.compile(
    r'\b(timeout|failing|unreachable|high|major|significant|'
    r'NullPointerException|HTTP[\-\s]?503|HTTP[\-\s]?500|brute[\-\s]?force|'
    r'suspicious|unauthorized|exception)\b',
    re.IGNORECASE
)

MEDIUM_PATTERN = re.compile(
    r'\b(slow|degraded|warning|intermittent|medium|moderate|'
    r'phishing|intermittent|packet\s*loss|latency|P95|misconfiguration)\b',
    re.IGNORECASE
)


# ── Public functions ──────────────────────────────────────────────────────────

def detect_type(text: str) -> str:
    """
    Detect the incident type from combined title + description text.
    Returns: 'network', 'security', 'app', or 'general'
    Priority order: security > network > app > general
    """
    security_score = len(SECURITY_PATTERN.findall(text))
    network_score  = len(NETWORK_PATTERN.findall(text))
    app_score      = len(APP_PATTERN.findall(text))

    if security_score == 0 and network_score == 0 and app_score == 0:
        return 'general'

    # Highest score wins; security wins ties with network/app
    scores = {
        'security': security_score,
        'network' : network_score,
        'app'     : app_score,
    }
    return max(scores, key=scores.get)


def detect_severity(text: str) -> str:
    """
    Detect the incident severity from combined title + description text.
    Returns: 'critical', 'high', 'medium', or 'low'
    """
    if CRITICAL_PATTERN.search(text):
        return 'critical'
    if HIGH_PATTERN.search(text):
        return 'high'
    if MEDIUM_PATTERN.search(text):
        return 'medium'
    return 'low'
