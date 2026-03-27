#step1
ALTER TABLE schools ADD COLUMN assigned_to INT DEFAULT NULL;
ALTER TABLE schools ADD COLUMN  assigned_date DATE DEFAULT NULL;
ALTER TABLE schools ADD COLUMN  interested_in VARCHAR(255) DEFAULT NULL;
ALTER TABLE schools ADD COLUMN  studnetscount VARCHAR(255) DEFAULT NULL;
ALTER TABLE schools ADD COLUMN  demorequire VARCHAR(255) DEFAULT NULL;
ALTER TABLE schools ADD COLUMN  Board VARCHAR(255) DEFAULT NULL;
CREATE TABLE IF NOT EXISTS marketing_orders (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                school_id       bigint NOT NULL,
                modules         TEXT,
                total_amount    DECIMAL(10,2) DEFAULT 0,
                initial_payment DECIMAL(10,2) DEFAULT 0,
                payment_mode    VARCHAR(50) DEFAULT 'Cash',
                payment_status  VARCHAR(50) DEFAULT 'Pending',
                expected_go_live DATE DEFAULT NULL,
                order_date      DATE DEFAULT (CURRENT_DATE),
                contract_signed VARCHAR(10) DEFAULT 'No',
                contact_person  VARCHAR(255),
                cost_per_student VARCHAR(50) DEFAULT '0',
                remarks         TEXT,
                status          VARCHAR(50) DEFAULT 'Draft',
                created_by      INT,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
            );