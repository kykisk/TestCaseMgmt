-- TestCase Management System Database Schema
-- PostgreSQL Version

-- ============================================
-- 1. Projects Table
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_name ON projects(name);

-- ============================================
-- 2. Requirements Table
-- ============================================
CREATE TABLE IF NOT EXISTS requirements (
    id VARCHAR(50) PRIMARY KEY,  -- REQ-YYYYMMDD-XXX
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
    status VARCHAR(50) CHECK (status IN ('Draft', 'Approved', 'In Development', 'Completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_requirements_project ON requirements(project_id);
CREATE INDEX idx_requirements_status ON requirements(status);

-- ============================================
-- 3. Test Cases Table
-- ============================================
CREATE TABLE IF NOT EXISTS testcases (
    id VARCHAR(50) PRIMARY KEY,  -- TC-YYYYMMDD-XXX
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
    category VARCHAR(50),
    preconditions TEXT,
    postconditions TEXT,
    status VARCHAR(50) CHECK (status IN ('Not Executed', 'Pass', 'Fail', 'Blocked', 'In Progress')) DEFAULT 'Not Executed',
    tags TEXT[],  -- Array of tags
    attachments TEXT[],  -- Array of attachment URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_testcases_project ON testcases(project_id);
CREATE INDEX idx_testcases_status ON testcases(status);
CREATE INDEX idx_testcases_priority ON testcases(priority);

-- ============================================
-- 4. Test Steps Table
-- ============================================
CREATE TABLE IF NOT EXISTS test_steps (
    id SERIAL PRIMARY KEY,
    testcase_id VARCHAR(50) NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    action TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    UNIQUE(testcase_id, step_number)
);

CREATE INDEX idx_test_steps_testcase ON test_steps(testcase_id);

-- ============================================
-- 5. Testcase-Requirement Mapping Table (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS testcase_requirements (
    testcase_id VARCHAR(50) NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    requirement_id VARCHAR(50) NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    PRIMARY KEY (testcase_id, requirement_id)
);

CREATE INDEX idx_tr_testcase ON testcase_requirements(testcase_id);
CREATE INDEX idx_tr_requirement ON testcase_requirements(requirement_id);

-- ============================================
-- 6. Test Executions Table
-- ============================================
CREATE TABLE IF NOT EXISTS test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    testcase_id VARCHAR(50) NOT NULL REFERENCES testcases(id) ON DELETE CASCADE,
    result VARCHAR(20) CHECK (result IN ('Pass', 'Fail', 'Blocked')) NOT NULL,
    actual_result TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_by VARCHAR(100),
    notes TEXT,
    bug_links TEXT[]
);

CREATE INDEX idx_executions_testcase ON test_executions(testcase_id);
CREATE INDEX idx_executions_result ON test_executions(result);

-- ============================================
-- 7. Step Execution Results Table
-- ============================================
CREATE TABLE IF NOT EXISTS step_results (
    id SERIAL PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES test_executions(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    result VARCHAR(20) CHECK (result IN ('Pass', 'Fail', 'Blocked', 'N/A')),
    note TEXT
);

CREATE INDEX idx_step_results_execution ON step_results(execution_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testcases_updated_at BEFORE UPDATE ON testcases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional - Comment out if not needed)
-- ============================================
-- INSERT INTO projects (id, name, description)
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Sample Project', 'A sample project for testing');
