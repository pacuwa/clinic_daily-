document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadReports();
    setNavigationActive('reports');
});

async function loadReports() {
    try {
        const [daily, weekly, monthly, stockLevels] = await Promise.all([
            apiRequest('/reports/daily'),
            apiRequest('/reports/weekly'),
            apiRequest('/reports/monthly'),
            apiRequest('/reports/stock-levels')
        ]);

        displayDailyReport(daily.data);
        displayWeeklyReport(weekly.data);
        displayMonthlyReport(monthly.data);
        displayStockLevels(stockLevels.data);
    } catch (error) {
        alert('Error loading reports: ' + error.message);
    }
}

function displayDailyReport(data) {
    const html = `
        <div class="grid">
            <div class="stat-box info">
                <h3>Stock In Today</h3>
                <p class="value">${data.stock_in.total_quantity}</p>
                <p>${data.stock_in.total_transactions} transactions</p>
            </div>
            <div class="stat-box success">
                <h3>Stock Out Today</h3>
                <p class="value">${data.stock_out.total_quantity}</p>
                <p>${data.stock_out.total_transactions} transactions</p>
            </div>
            <div class="stat-box warning">
                <h3>Total Sales Today</h3>
                <p class="value">$${data.stock_out.total_sales.toFixed(2)}</p>
            </div>
        </div>
    `;
    document.getElementById('dailyReportDiv').innerHTML = html;
}

function displayWeeklyReport(data) {
    const tbody = document.getElementById('weeklyTableBody');
    tbody.innerHTML = data.daily_breakdown.map(day => `
        <tr>
            <td>${day.report_date}</td>
            <td>${day.total_quantity_out || 0}</td>
            <td>$${(day.total_sales || 0).toFixed(2)}</td>
        </tr>
    `).join('');
    
    document.getElementById('weeklySummary').innerHTML = `
        Total Quantity: ${data.summary.total_quantity} | Total Sales: $${data.summary.total_sales.toFixed(2)}
    `;
}

function displayMonthlyReport(data) {
    const tbody = document.getElementById('monthlyTableBody');
    tbody.innerHTML = data.daily_breakdown.map(day => `
        <tr>
            <td>${day.report_date}</td>
            <td>${day.total_quantity_out || 0}</td>
            <td>$${(day.total_sales || 0).toFixed(2)}</td>
        </tr>
    `).join('');
    
    document.getElementById('monthlySummary').innerHTML = `
        Total Quantity: ${data.summary.total_quantity} | Total Sales: $${data.summary.total_sales.toFixed(2)}
    `;
}

function displayStockLevels(data) {
    const tbody = document.getElementById('stockLevelsTableBody');
    tbody.innerHTML = data.items.map(item => `
        <tr>
            <td>${item.item_name}</td>
            <td>${item.category}</td>
            <td>${item.current_stock}</td>
            <td>${item.reorder_level}</td>
            <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
        </tr>
    `).join('');
    
    document.getElementById('stockLevelsSummary').innerHTML = `
        <strong>Good Stock:</strong> ${data.summary.good_stock} | 
        <strong>Moderate:</strong> ${data.summary.moderate_stock} | 
        <strong>Low Stock:</strong> ${data.summary.low_stock}
    `;
}
