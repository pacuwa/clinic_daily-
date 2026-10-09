<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reports</title>
    <link rel="stylesheet" href="../css/style.css" />
  </head>
  <body>
    <nav>
      <strong>Clinic Daily</strong>
      <div>
        <a href="dashboard.html">Dashboard</a>
        <a href="inventory.html">Inventory</a>
        <a href="stock-in.html">Stock In</a>
        <a href="stock-out.html">Stock Out</a>
        <a href="reports.html">Reports</a>
        <a href="login.html" onclick="logoutUser()">Logout</a>
      </div>
    </nav>

    <div class="container">
      <div class="card">
        <h1>Daily Report</h1>
        <p id="dailyReport">Loading...</p>
      </div>
    </div>

    <script src="../js/api.js"></script>
    <script src="../js/reports.js"></script>
    <script src="../js/auth.js"></script>
  </body>
</html>
