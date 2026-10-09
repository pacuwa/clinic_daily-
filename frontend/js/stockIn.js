document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('inventoryTableBody');
  const token = localStorage.getItem('token');

  if (!token || !tableBody) return;

  try {
    const items = await window.apiRequest('/inventory', 'GET', null, token);

    tableBody.innerHTML = items.map((item) => `
      <tr>
        <td>${item.item_name}</td>
        <td>${item.category}</td>
        <td>${item.unit}</td>
        <td>${item.current_stock}</td>
        <td>${item.reorder_level}</td>
      </tr>
    `).join('');
  } catch (error) {
    tableBody.innerHTML = '<tr><td colspan="5">Unable to load inventory.</td></tr>';
  }
});
