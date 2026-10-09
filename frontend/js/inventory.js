document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = user.email;

    loadInventory();
    setNavigationActive('inventory');

    if (isAdmin()) {
        document.getElementById('addItemBtn').style.display = 'inline-block';
    } else {
        document.getElementById('addItemBtn').style.display = 'none';
    }
});

async function loadInventory() {
    try {
        const response = await apiRequest('/inventory');
        const items = response.data;
        const tbody = document.getElementById('inventoryTableBody');
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No items in inventory</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td><strong>${item.item_name}</strong></td>
                <td>${item.category}</td>
                <td>${item.unit}</td>
                <td>${item.current_stock}</td>
                <td>${item.reorder_level}</td>
                <td>
                    <span class="status-badge ${getStockStatus(item.current_stock, item.reorder_level)}">
                        ${getStockStatusText(item.current_stock, item.reorder_level)}
                    </span>
                </td>
                <td>
                    ${isAdmin() ? `<button class="btn btn-sm btn-secondary" onclick="editItem(${item.id})">Edit</button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('inventoryTableBody').innerHTML = '<tr><td colspan="7" class="text-center">Error loading inventory</td></tr>';
    }
}

function getStockStatus(current, reorder) {
    if (current <= reorder) return 'status-low';
    if (current <= reorder * 1.5) return 'status-moderate';
    return 'status-good';
}

function getStockStatusText(current, reorder) {
    if (current <= reorder) return 'LOW';
    if (current <= reorder * 1.5) return 'MODERATE';
    return 'GOOD';
}

function openAddItemModal() {
    document.getElementById('addItemModal').classList.add('show');
}

function closeAddItemModal() {
    document.getElementById('addItemModal').classList.remove('show');
    document.getElementById('addItemForm').reset();
}

document.getElementById('addItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemData = {
        item_name: document.getElementById('itemName').value,
        category: document.getElementById('category').value,
        unit: document.getElementById('unit').value,
        opening_stock: parseInt(document.getElementById('openingStock').value) || 0,
        reorder_level: parseInt(document.getElementById('reorderLevel').value) || 0,
        unit_cost: parseFloat(document.getElementById('unitCost').value) || 0,
        supplier: document.getElementById('supplier').value
    };

    try {
        await apiRequest('/inventory', 'POST', itemData);
        closeAddItemModal();
        loadInventory();
        showSuccess('Item added successfully!');
    } catch (error) {
        alert('Error adding item: ' + error.message);
    }
});

function editItem(id) {
    alert('Edit functionality coming soon!');
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

window.openAddItemModal = openAddItemModal;
window.closeAddItemModal = closeAddItemModal;
window.editItem = editItem;
window.showSuccess = showSuccess;
