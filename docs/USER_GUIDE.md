# Database Schema

## users
- id
- email
- password_hash
- role
- full_name
- created_at

## items
- id
- item_name
- category
- unit
- opening_stock
- current_stock
- reorder_level
- unit_cost
- supplier
- created_at

## stock_in
- id
- item_id
- quantity_in
- unit_cost
- supplier
- notes
- received_by
- date_in

## stock_out
- id
- item_id
- quantity_out
- sale_price
- sold_to
- notes
- recorded_by
- date_out
