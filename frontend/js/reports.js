document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadReports();
    setNavigationActive('reports');
});

async function loadReports() {
    try {
        const [daily, weekly, monthly, stockLevels, category, items] = await Promise.all([
            apiRequest('/reports/daily'),
            apiRequest('/reports/weekly'),
            apiRequest('/reports/monthly'),
            apiRequest('/reports/stock-levels'),
            apiRequest('/reports/category'),
            apiRequest('/reports/items')
        ]);

        displayDailyReport(daily.data);
        displayCategoryReport(category.data);
        displayItemReport(items.data);
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

function displayCategoryReport(data) {
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = data.categories.map(cat => `
        <tr>
            <td><strong>${cat.category}</strong></td>
            <td>${cat.total_quantity}</td>
            <td>${cat.total_transactions}</td>
            <td>$${cat.total_sales.toFixed(2)}</td>
        </tr>
    `).join('');
    
    if (data.categories.length > 0) {
        tbody.innerHTML += `
            <tr style="font-weight: bold; background: #f0f0f0;">
                <td>TOTAL</td>
                <td>${data.summary.total_quantity}</td>
                <td>-</td>
                <td>$${data.summary.total_sales.toFixed(2)}</td>
            </tr>
        `;
    }
}

function displayItemReport(data) {
    const tbody = document.getElementById('itemTableBody');
    tbody.innerHTML = data.items.map(item => `
        <tr>
            <td>${item.item_name}</td>
            <td>${item.category}</td>
            <td>${item.total_quantity}</td>
            <td>$${item.total_sale_price.toFixed(2)}</td>
            <td>$${item.total_sales.toFixed(2)}</td>
            <td>$${(item.total_sales - (item.unit_cost * item.total_quantity)).toFixed(2)}</td>
        </tr>
    `).join('');
    
    if (data.items.length > 0) {
        tbody.innerHTML += `
            <tr style="font-weight: bold; background: #f0f0f0;">
                <td colspan="2">TOTAL</td>
                <td>${data.summary.total_quantity}</td>
                <td>-</td>
                <td>$${data.summary.total_sales.toFixed(2)}</td>
                <td>$${data.summary.total_profit.toFixed(2)}</td>
            </tr>
        `;
    }
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

// Export functions
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    downloadFile(csv, filename, 'text/csv');
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    return [headers, ...rows].join('\n');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// PDF export
function exportDailyReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    
    doc.setFontSize(16);
    doc.text('Daily Sales Report', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Date: ${today}`, 20, 30);
    doc.text(`Clinic Daily Inventory System`, 20, 40);
    
    // Get data from the page
    const categoryData = [];
    document.querySelectorAll('#categoryTableBody tr').forEach((row, index) => {
        if (index < document.querySelectorAll('#categoryTableBody tr').length - 1) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                categoryData.push({
                    category: cells[0].textContent,
                    quantity: cells[1].textContent,
                    transactions: cells[2].textContent,
                    sales: cells[3].textContent
                });
            }
        }
    });
    
    if (categoryData.length > 0) {
        const columns = ['Category', 'Quantity', 'Transactions', 'Sales'];
        const rows = categoryData.map(d => [d.category, d.quantity, d.transactions, d.sales]);
        
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50
        });
    }
    
    doc.save(`daily-report-${today.replace(/\//g, '-')}.pdf`);
}

function exportWeeklyReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();
    
    doc.setFontSize(16);
    doc.text('Weekly Sales Report', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${today}`, 20, 30);
    doc.text(`Period: Last 7 Days`, 20, 40);
    
    const weeklyData = [];
    document.querySelectorAll('#weeklyTableBody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            weeklyData.push({
                date: cells[0].textContent,
                quantity: cells[1].textContent,
                sales: cells[2].textContent
            });
        }
    });
    
    if (weeklyData.length > 0) {
        const columns = ['Date', 'Quantity Sold', 'Total Sales'];
        const rows = weeklyData.map(d => [d.date, d.quantity, d.sales]);
        
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 50
        });
        
        const summary = document.getElementById('weeklySummary').textContent;
        doc.text(summary, 20, doc.lastAutoTable.finalY + 10);
    }
    
    doc.save(`weekly-report-${today.replace(/\//g, '-')}.pdf`);
}

function exportDailyCategoryCSV() {
    const data = [];
    document.querySelectorAll('#categoryTableBody tr').forEach((row, index) => {
        if (index < document.querySelectorAll('#categoryTableBody tr').length - 1) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                data.push({
                    Category: cells[0].textContent,
                    Quantity: cells[1].textContent,
                    Transactions: cells[2].textContent,
                    Sales: cells[3].textContent
                });
            }
        }
    });
    
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(data, `daily-category-report-${today}.csv`);
}

function exportDailyItemsCSV() {
    const data = [];
    document.querySelectorAll('#itemTableBody tr').forEach((row, index) => {
        if (index < document.querySelectorAll('#itemTableBody tr').length - 1) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                data.push({
                    'Item Name': cells[0].textContent,
                    'Category': cells[1].textContent,
                    'Quantity': cells[2].textContent,
                    'Unit Price': cells[3].textContent,
                    'Total Sales': cells[4].textContent,
                    'Profit': cells[5].textContent
                });
            }
        }
    });
    
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(data, `daily-items-report-${today}.csv`);
}

window.exportDailyReportPDF = exportDailyReportPDF;
window.exportWeeklyReportPDF = exportWeeklyReportPDF;
window.exportDailyCategoryCSV = exportDailyCategoryCSV;
window.exportDailyItemsCSV = exportDailyItemsCSV;
