const fs = require('fs');

const usersSQL = `
-- ============================================================
-- FreshAI Grocery — Users Seed
-- ============================================================
-- Passwords below are hashes for 'admin123' and 'customer123'
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at) 
VALUES 
(1, 'admin@freshai.com', '$2a$10$j9KQzmajPcXtae099COc.uYhsP44jGHk89hKQJoB5nnaaMfDuox0y', 'Admin', 'FreshAI', '+919876543210', 'ADMIN', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at) 
VALUES 
(2, 'customer@freshai.com', '$2a$10$j9KQzmajPcXtae099COc.uYhsP44jGHk89hKQJoB5nnaaMfDuox0y', 'Test', 'Customer', '+919876543211', 'CUSTOMER', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
`;

fs.appendFileSync('backend/src/main/resources/data.sql', usersSQL);
console.log('Appended users');
