========================================
  Employee Management System — Mini Project 1
========================================

Name  : [SHAIK MOHAMMED ANEES]
Batch : [B2]

----------------------------------------
HOW TO RUN THE APP
----------------------------------------
1. Unzip the project folder.
2. Open index.html directly in any modern browser (Chrome, Firefox, Edge).
   - No build step required. No server required.
3. Login with the demo credentials:
     Username : admin
     Password : admin123
   Or click "Sign up" to register a new admin account.

----------------------------------------
HOW TO RUN THE TESTS
----------------------------------------
Prerequisites: Node.js (v16+) installed on your machine.

1. Open a terminal in the project root folder.
2. Run:  npm install
3. Run:  npm test

All 3 test suites will execute:
  - tests/employeeService.test.js
  - tests/authService.test.js
  - tests/dashboardService.test.js

----------------------------------------
PROJECT STRUCTURE
----------------------------------------
employee-management-dashboard/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   ├── storageService.js
│   ├── authService.js
│   ├── employeeService.js
│   ├── validationService.js
│   ├── dashboardService.js
│   ├── uiService.js
│   └── app.js
├── tests/
│   ├── employeeService.test.js
│   ├── authService.test.js
│   └── dashboardService.test.js
├── package.json
├── jest.config.js
└── README.txt
