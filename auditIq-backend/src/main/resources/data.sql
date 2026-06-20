-- Insert seed company (Using ID 1 for easy testing)
INSERT INTO company (id, name, industry, gst_number) 
VALUES (1, 'Tata Motors', 'Automotive', '27AAACT2727Q1ZW')
ON CONFLICT (id) DO NOTHING;

-- Insert Approved Vendors for Tata Motors (Company ID 1)
INSERT INTO approved_vendor (id, vendor_name, company_id) 
VALUES 
(1, 'BHARAT FORGE LTD', 1),
(2, 'BOSCH INDIA PVT LTD', 1),
(3, 'TATA STEEL LTD', 1),
(4, 'MAHINDRA CIE', 1),
(5, 'JBM AUTO LTD', 1),
(6, 'MINDA INDUSTRIES', 1),
(7, 'SUNDARAM CLAYTON', 1)
ON CONFLICT (id) DO NOTHING;

-- Reset PostgreSQL identity sequences so Hibernate inserts new rows without ID collisions
SELECT setval(pg_get_serial_sequence('company', 'id'), COALESCE(max(id), 1)) FROM company;
SELECT setval(pg_get_serial_sequence('approved_vendor', 'id'), COALESCE(max(id), 1)) FROM approved_vendor;
SELECT setval(pg_get_serial_sequence('upload', 'upload_id'), COALESCE(max(upload_id), 1)) FROM upload;
SELECT setval(pg_get_serial_sequence('transaction', 'id'), COALESCE(max(id), 1)) FROM transaction;
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('anomaly_result', 'id'), COALESCE(max(id), 1)) FROM anomaly_result;
