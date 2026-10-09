document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockInForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const payload = {
      item_id: Number(document.getElementById('itemId').value),
      quantity_in: Number(document.getElementById('quantityIn').value),
      supplier: document.getElementById('supplier').value,
      notes: document.getElementById('notes').value
    };

    try {
      await window.apiRequest('/stock-in', 'POST', payload, token);
      alert('Stock in added successfully.');
      form.reset();
    } catch (error) {
      alert(error.message);
    }
  });
});
