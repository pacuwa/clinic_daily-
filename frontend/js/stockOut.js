document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = user.email;

    loadStockOutPage();
    setNavigationActive('stock-out');
});

async function loadStockOutPage() {
    try {
        const response = await apiRequest('/inventory');
        const itemSelect = document.getElementById('itemId');
        
        itemSelect.innerHTML = '<option value="">-- Select an item --</option>';
        response.data.forEach(item => {
            itemSelect.innerHTML += `<option value="${item.id}">${item.item_name} (${item.unit}) - Stock: ${item.current_stock}</option>`;
        });
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

document.getElementById('itemId').addEventListener('change', async (e) => {
    if (!e.target.value) return;
    
    try {
        const response = await apiRequest(`/inventory/${e.target.value}`);
        const item = response.data;
        document.getElementById('availableStock').textContent = item.current_stock;
        document.getElementById('availableStock').className = 
            item.current_stock <= item.reorder_level ? 'text-danger' : '';
    } catch (error) {
        console.error('Error loading item details:', error);
    }
});

document.getElementById('stockOutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        item_id: parseInt(document.getElementById('itemId').value),
        quantity_out: parseInt(document.getElementById('quantityOut').value),
        sale_price: parseFloat(document.getElementById('salePrice').value) || 0,
        sold_to: document.getElementById('soldTo').value,
        notes: document.getElementById('notes').value
    };

    try {
        await apiRequest('/stock-out', 'POST', formData);
        document.getElementById('stockOutForm').reset();
        document.getElementById('availableStock').textContent = '0';
        showSuccess('Stock out recorded successfully!');
        loadStockOutHistory();
    } catch (error) {
        showError('Error: ' + error.message);
    }
});

async function loadStockOutHistory() {
    try {
        const response = await apiRequest('/stock-out');
        const tbody = document.getElementById('historyTableBody');
        
        if (response.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No stock out records</td></tr>';
            return;
        }

        tbody.innerHTML = response.data.slice(0, 10).map(record => `
            <tr>
                <td>${new Date(record.date_out).toLocaleDateString()}</td>
                <td>${record.item_name}</td>
                <td>${record.quantity_out}</td>
                <td>$${record.sale_price.toFixed(2)}</td>
                <td>${record.sold_to}</td>
                <td>${record.recorded_by_name}</td>
                <td>${record.notes || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

window.addEventListener('load', loadStockOutHistory);
window.showError = showError;
window.showSuccess = showSuccess;
