document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (!isAdmin()) {
        window.location.href = 'dashboard.html';
        return;
    }
    loadStockInPage();
    setNavigationActive('stock-in');
});

async function loadStockInPage() {
    try {
        const response = await apiRequest('/inventory');
        const itemSelect = document.getElementById('itemId');
        
        itemSelect.innerHTML = '<option value="">-- Select an item --</option>';
        response.data.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.id}">${item.item_name} (${item.unit})</option>`;
        });
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

document.getElementById('stockInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        item_id: parseInt(document.getElementById('itemId').value),
        quantity_in: parseInt(document.getElementById('quantityIn').value),
        unit_cost: parseFloat(document.getElementById('unitCost').value) || 0,
        supplier: document.getElementById('supplier').value,
        notes: document.getElementById('notes').value
    };

    try {
        await apiRequest('/stock-in', 'POST', formData);
        document.getElementById('stockInForm').reset();
        alert('Stock in recorded successfully!');
        loadStockInHistory();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

async function loadStockInHistory() {
    try {
        const response = await apiRequest('/stock-in');
        const tbody = document.getElementById('historyTableBody');
        
        if (response.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No stock in records</td></tr>';
            return;
        }

        tbody.innerHTML = response.data.slice(0, 10).map(record => `
            <tr>
                <td>${new Date(record.date_in).toLocaleDateString()}</td>
                <td>${record.item_name}</td>
                <td>${record.quantity_in}</td>
                <td>$${record.unit_cost.toFixed(2)}</td>
                <td>${record.supplier}</td>
                <td>${record.received_by_name}</td>
                <td>${record.notes || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

window.addEventListener('load', loadStockInHistory);
