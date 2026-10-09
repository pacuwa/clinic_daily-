INSERT OR IGNORE INTO users (email, password_hash, role, full_name)
VALUES
  ('admin@clinic.com', '$2a$10$QRTmE0O0bF7kA9p3dL3O.uH8d7LJ9kWT1nvh7orD0M5QmZtBqG.5u', 'Admin', 'System Admin'),
  ('staff@clinic.com', '$2a$10$P4KcQYgNQxYp0Zk6cZQ3lO7Z3f01tqN6t5QjY4j0ODQbSUtRj0Y5S', 'Staff', 'Clinic Staff');

INSERT OR IGNORE INTO items (item_name, category, unit, opening_stock, current_stock, reorder_level, unit_cost, supplier)
VALUES
  ('Paracetamol', 'Medicine', 'Tablet', 200, 200, 30, 0.50, 'Clinic Supplier'),
  ('Cough Syrup', 'Medicine', 'Bottle', 80, 80, 20, 2.00, 'Clinic Supplier'),
  ('Gloves', 'Supply', 'Box', 100, 100, 25, 10.00, 'Medical Supply');
