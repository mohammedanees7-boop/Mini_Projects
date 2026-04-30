# config.py — API credentials and settings
# Set MOCK_API = True to run without real credentials (recommended for demo/testing)

MOCK_API = True  # <-- Change to False only if you have real API credentials

# ── ServiceNow ────────────────────────────────────────────────────────────────
SNOW_INSTANCE = "your-instance"   # e.g. dev12345
SNOW_USERNAME = "admin"
SNOW_PASSWORD = "your_password"
SNOW_BASE_URL = f"https://{SNOW_INSTANCE}.service-now.com/api/now/table/incident"

# ── Jira ──────────────────────────────────────────────────────────────────────
JIRA_DOMAIN   = "your-domain"     # e.g. mycompany
JIRA_EMAIL    = "you@example.com"
JIRA_API_TOKEN = "your_jira_api_token"
JIRA_PROJECT_KEY = "IT"
JIRA_BASE_URL = f"https://{JIRA_DOMAIN}.atlassian.net/rest/api/3/issue"

# ── Azure Boards ──────────────────────────────────────────────────────────────
AZURE_ORG     = "your-org"
AZURE_PROJECT = "your-project"
AZURE_PAT     = "your_personal_access_token"
AZURE_BASE_URL = (
    f"https://dev.azure.com/{AZURE_ORG}/{AZURE_PROJECT}"
    "/_apis/wit/workitems/$Bug?api-version=7.1"
)
