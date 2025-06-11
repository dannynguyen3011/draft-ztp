-- Database initialization script for ZeroTrust Platform
-- This script creates the necessary tables and initial data

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    keycloak_id VARCHAR(255) UNIQUE
);

-- Risk scores table
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    factors TEXT[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by UUID REFERENCES users(id),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    join_time TIMESTAMP,
    leave_time TIMESTAMP,
    duration_minutes INTEGER,
    UNIQUE(meeting_id, user_id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    risk_score INTEGER
);

-- Access policies table
CREATE TABLE IF NOT EXISTS access_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    policy_type VARCHAR(50) NOT NULL,
    resource_patterns TEXT[],
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_risk_scores_user_id ON risk_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_timestamp ON risk_scores(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);

-- Insert some initial test data
INSERT INTO users (username, email, role, keycloak_id) VALUES
    ('admin', 'admin@zerotrust.com', 'admin', null),
    ('john.doe', 'john.doe@company.com', 'employee', null),
    ('jane.smith', 'jane.smith@company.com', 'manager', null)
ON CONFLICT (username) DO NOTHING;

-- Insert initial access policies
INSERT INTO access_policies (name, description, policy_type, resource_patterns, conditions) VALUES
    (
        'Manager Analytics Access',
        'Allows managers to access analytics dashboard',
        'role_based',
        ARRAY['analytics', 'reports'],
        '{"roles": ["manager"], "time_restrictions": "business_hours"}'::jsonb
    ),
    (
        'Employee Dashboard Access',
        'Basic dashboard access for employees',
        'role_based',
        ARRAY['dashboard', 'meetings'],
        '{"roles": ["employee", "manager"], "time_restrictions": "any"}'::jsonb
    ),
    (
        'Audit Access Policy',
        'Restricts audit log access to managers only',
        'role_based',
        ARRAY['audit'],
        '{"roles": ["manager"], "location": "office", "mfa_required": true}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin; 