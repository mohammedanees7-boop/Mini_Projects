# NexForce EMS — Mini Project 2
### Full-Stack: .NET 8 Web API + SQL Server + JWT + EF Core + Frontend

---

## Login Credentials
| Username | Password | Role |
|----------|----------|------|
| `admin`  | `admin123` | Admin — Add, Edit, Delete, View |
| `viewer` | `viewer123` | Viewer — View only |

---

## THE MOST IMPORTANT THING — WHY "LOCALHOST REFUSED" HAPPENS

**The API must be running EVERY TIME you want to use the app.**
When you restart your PC or close VS Code, the API stops.
You must run `dotnet run` again each time before opening the frontend.

---

## Complete Step-by-Step Setup (Do This Once)

### STEP 1 — Install dotnet-ef tool
Open PowerShell and run:
```
dotnet tool install --global dotnet-ef
```
Then **close and reopen** PowerShell so the command is recognised.

Verify:
```
dotnet ef --version
```
You should see a version number like `8.0.x`

---

### STEP 2 — Open the EMS.API folder in VS Code
In VS Code: File → Open Folder → select the `EMS-MiniProject2` folder

---

### STEP 3 — Check your connection string
Open `EMS.API/appsettings.json`

The connection string is already set to:
```
Server=localhost\SQLEXPRESS
```

If your SQL Server uses a different name, change it.
To check your SQL Server name, run this in PowerShell:
```
sqlcmd -S localhost\SQLEXPRESS -Q "SELECT @@SERVERNAME" -No
```
If it prints your server name → connection string is correct.

---

### STEP 4 — Open a terminal IN THE EMS.API FOLDER
In VS Code: Terminal → New Terminal
Then navigate:
```
cd EMS.API
```

Confirm you are in the right place:
```
dir
```
You should see: `EMS.API.csproj`, `Program.cs`, `appsettings.json`

---

### STEP 5 — Restore packages
```
dotnet restore
```
Wait for: `Restore completed`

---

### STEP 6 — Run migrations (ONLY NEEDED ONCE — creates the database)
```
dotnet ef migrations add InitialCreate
```
Wait for: `Done.`

Then:
```
dotnet ef database update
```
Wait for: `Done.`

This creates the `EMSDashboard` database with all 15 employees and 2 user accounts.

---

### STEP 7 — Start the API
```
dotnet run
```

Wait for:
```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

**Leave this terminal open. Do NOT close it.**

---

### STEP 8 — Verify API works
Open your browser and go to:
```
http://localhost:5000/swagger
```
You should see the Swagger UI with all API endpoints.

---

### STEP 9 — Open the Frontend
In VS Code Explorer panel:
- Right-click `frontend/index.html`
- Click **Open with Live Server**

The browser opens at `http://localhost:5500`

**If you don't have Live Server:**
- Press Ctrl+Shift+X in VS Code
- Search "Live Server" by Ritwick Dey
- Click Install
- Then right-click index.html → Open with Live Server

---

### STEP 10 — Login
Use `admin` / `admin123` for full access
Use `viewer` / `viewer123` for read-only access

---

## Every Time You Restart Your PC (Daily Routine)

You only need to do STEPS 7 → 9 every day:

**Step 1 — Open terminal in EMS.API folder:**
```
cd "C:\path\to\EMS-MiniProject2\EMS.API"
```

**Step 2 — Start the API:**
```
dotnet run
```
Wait for `Now listening on: http://localhost:5000`

**Step 3 — Open frontend with Live Server**

That's it. The database already exists from the first setup.

---

## Run the Tests
Open a NEW terminal (keep the API terminal open), navigate to EMS.Tests:
```
cd EMS.Tests
dotnet test
```

---

## Common Errors and Fixes

### Error: "localhost refused to connect" or blank page
**Cause:** The API is not running.
**Fix:** Open terminal → go to EMS.API folder → run `dotnet ef database update` → wait for Done → run `dotnet run` → wait for "Now listening on: http://localhost:5000" → then open the frontend.

### Error: "dotnet ef not recognised"
**Fix:** Run `dotnet tool install --global dotnet-ef` then close and reopen the terminal.

### Error: Cannot connect to SQL Server
**Fix:** Open Windows Services (Win+R → services.msc) → find "SQL Server (SQLEXPRESS)" → right-click → Start

### Error: "A migration already exists" when running Add-Migration
**Fix:** Run `dotnet ef migrations remove` first, then run `dotnet ef migrations add InitialCreate` again.

### Error: "Database already exists" when running Update-Database
**Fix:** Run `dotnet ef database drop --force` then `dotnet ef database update` again.

### Frontend shows "Could not load dashboard"
**Cause:** API is not running or returned an error.
**Fix:** Check that `dotnet run` is still running and shows "Now listening on: http://localhost:5000".

---

## Project Structure
```
EMS-MiniProject2/
├── EMS.API/
│   ├── Controllers/
│   │   ├── EmployeesController.cs
│   │   └── AuthController.cs
│   ├── Data/
│   │   └── AppDbContext.cs         ← DB context + seed data
│   ├── DTOs/
│   │   └── EmployeeDtos.cs
│   ├── Models/
│   │   ├── Employee.cs
│   │   └── AppUser.cs
│   ├── Services/
│   │   ├── IEmployeeRepository.cs
│   │   ├── EmployeeRepository.cs
│   │   ├── EmployeeService.cs
│   │   └── AuthService.cs
│   ├── Program.cs
│   ├── appsettings.json           ← Change connection string here if needed
│   └── EMS.API.csproj
│
├── EMS.Tests/
│   ├── Services/
│   │   ├── EmployeeServiceTests.cs
│   │   └── AuthServiceTests.cs
│   ├── Controllers/
│   │   └── EmployeesControllerTests.cs
│   └── EMS.Tests.csproj
│
└── frontend/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── config.js          ← API URL set here
        ├── storageService.js  ← All fetch() API calls
        ├── authService.js     ← JWT login/register
        ├── employeeService.js
        ├── validationService.js
        ├── dashboardService.js
        ├── uiService.js       ← Pagination + role UI
        └── app.js             ← Main orchestrator
```
