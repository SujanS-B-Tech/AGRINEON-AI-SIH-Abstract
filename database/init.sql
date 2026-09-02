-- AGRONEON Database Schema
-- PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (Farmers)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Farms
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(500) NOT NULL,
    land_area DECIMAL(10, 2) NOT NULL,
    soil_type VARCHAR(100),
    water_availability VARCHAR(50),
    previous_crop VARCHAR(100),
    current_season VARCHAR(50),
    current_crop VARCHAR(100),
    crop_stage VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_farms_user_id ON farms(user_id);

-- Soil Reports
CREATE TABLE IF NOT EXISTS soil_reports (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    report_type VARCHAR(50) DEFAULT 'manual',
    file_path VARCHAR(500),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soil_reports_farm_id ON soil_reports(farm_id);

-- Soil Parameters
CREATE TABLE IF NOT EXISTS soil_parameters (
    id SERIAL PRIMARY KEY,
    soil_report_id INTEGER NOT NULL REFERENCES soil_reports(id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    value DECIMAL(10, 4),
    unit VARCHAR(50),
    status VARCHAR(50),
    interpretation TEXT
);

CREATE INDEX idx_soil_params_report_id ON soil_parameters(soil_report_id);

-- Crop Recommendations
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    suitability_score DECIMAL(5, 2) NOT NULL,
    explanation JSONB,
    is_selected BOOLEAN DEFAULT FALSE,
    seed_cost DECIMAL(12, 2),
    fertilizer_cost DECIMAL(12, 2),
    labour_cost DECIMAL(12, 2),
    irrigation_cost DECIMAL(12, 2),
    equipment_cost DECIMAL(12, 2),
    other_cost DECIMAL(12, 2),
    expected_yield DECIMAL(10, 2),
    yield_unit VARCHAR(50),
    market_price DECIMAL(10, 2),
    estimated_revenue DECIMAL(14, 2),
    estimated_profit DECIMAL(14, 2),
    risk_level VARCHAR(20),
    risk_factors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crop_recs_farm_id ON crop_recommendations(farm_id);

-- Crop Plans
CREATE TABLE IF NOT EXISTS crop_plans (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(50),
    start_date DATE,
    current_stage VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crop_plans_farm_id ON crop_plans(farm_id);

-- Crop Tasks
CREATE TABLE IF NOT EXISTS crop_tasks (
    id SERIAL PRIMARY KEY,
    crop_plan_id INTEGER NOT NULL REFERENCES crop_plans(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL,
    task_description TEXT NOT NULL,
    scheduled_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    alert TEXT
);

CREATE INDEX idx_crop_tasks_plan_id ON crop_tasks(crop_plan_id);

-- Disease Predictions
CREATE TABLE IF NOT EXISTS disease_predictions (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    image_path VARCHAR(500),
    disease_name VARCHAR(255),
    confidence DECIMAL(5, 2),
    symptoms JSONB,
    prevention JSONB,
    next_steps JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disease_preds_farm_id ON disease_predictions(farm_id);

-- Markets
CREATE TABLE IF NOT EXISTS markets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    contact VARCHAR(100),
    is_demo BOOLEAN DEFAULT TRUE
);

-- Market Prices
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT '₹/quintal',
    grade VARCHAR(50),
    transport_cost DECIMAL(10, 2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_prices_market_id ON market_prices(market_id);
CREATE INDEX idx_market_prices_crop ON market_prices(crop_name);

-- Market Listings (Farmer Marketplace)
CREATE TABLE IF NOT EXISTS market_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    expected_price DECIMAL(10, 2),
    location VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_listings_user_id ON market_listings(user_id);

-- Agricultural Services
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    location VARCHAR(500),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    contact VARCHAR(100),
    website VARCHAR(500),
    is_demo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_services_type ON services(service_type);

-- Government Schemes
CREATE TABLE IF NOT EXISTS government_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    eligibility TEXT,
    benefit TEXT,
    farmer_category VARCHAR(100),
    application_info TEXT,
    official_source VARCHAR(500),
    is_demo BOOLEAN DEFAULT TRUE
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    event_date DATE,
    location VARCHAR(500),
    source VARCHAR(255),
    is_demo BOOLEAN DEFAULT TRUE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Demo seed data
INSERT INTO users (name, email, password_hash, preferred_language)
VALUES ('Raja Kumar', 'demo@agroneon.in', '$2b$12$demo_hash_placeholder', 'Tamil')
ON CONFLICT (email) DO NOTHING;
