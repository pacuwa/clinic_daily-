document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = user.email;

    // Hide Stock In link for Non-Admin staff
    if (!isAdmin()) {
        const stockInLink = document.getElementById('stockInLink');
        if (stockInLink) {
            stockInLink.style.display = 'none';
        }
    }

    // Toggle Dropdown Menu
    const dropdownBtn = document.getElementById('dropdownBtn');
    const navDropdown = document.getElementById('navDropdown');

    if (dropdownBtn && navDropdown) {
        dropdownBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            navDropdown.classList.toggle('show');
        });

        // Close when clicking anywhere outside
        window.addEventListener('click', (event) => {
            if (!navDropdown.contains(event.target) && event.target !== dropdownBtn) {
                navDropdown.classList.remove('show');
            }
        });
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
        
        const totalSales = dailyReport.data.stock_out.total_sales || 0;
        document.getElementById('totalSales').textContent = 'Ugx' + totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
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
