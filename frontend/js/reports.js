document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockOutForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const payload = {
      item_id: Number(document.getElementById('itemId').value),
      quantity_out: Number(document.getElementById('quantityOut').value),
      sold_to: document.getElementById('soldTo').value,
      sale_price: Number(document.getElementById('salePrice').value),
      notes: document.getElementById('notes').value
    };

    try {
      await window.apiRequest('/stock-out', 'POST', payload, token);
      alert('Stock out recorded successfully.');
      form.reset();
    } catch (error) {
      alert(error.message);
    }
  });
});
