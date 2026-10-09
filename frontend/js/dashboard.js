document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = user.email;

    // Hide Stock In link for Staff
    if (!isAdmin()) {
        const stockInLink = document.getElementById('stockInLink');
        if (stockInLink) {
            stockInLink.style.display = 'none';
        }
    }

    loadDashboardData();
    setNavigationActive('dashboard');
});

async function loadDashboardData() {
    try {
        const [inventory, dailyReport, stockLevels] = await Promise.all([
            apiRequest('/inventory'),
            apiRequest('/reports/daily'),
            apiRequest('/reports/stock-levels')
        ]);

        document.getElementById('totalItems').textContent = inventory.data.length;
        document.getElementById('stockInToday').textContent = dailyReport.data.stock_in.total_quantity || 0;
        document.getElementById('stockOutToday').textContent = dailyReport.data.stock_out.total_quantity || 0;
        document.getElementById('totalSales').textContent = '$' + (dailyReport.data.stock_out.total_sales || 0).toFixed(2);
        document.getElementById('lowStockCount').textContent = stockLevels.data.summary.low_stock;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

window.showError = showError;
