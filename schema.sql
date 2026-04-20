-- DPDP Comply Database Schema
-- Run this in your Supabase SQL Editor

-- Enable uuid-ossp extension (still used for row IDs on child tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MIGRATION: Run this if you already have the old UUID schema
-- ============================================================
-- DROP TABLE IF EXISTS generated_documents;
-- DROP TABLE IF EXISTS data_inventory_items;
-- DROP TABLE IF EXISTS compliance_tasks;
-- DROP TABLE IF EXISTS breach_incidents;
-- DROP TABLE IF EXISTS companies;

-- 1. Create Companies Table
-- clerk_user_id stores the Clerk userId string (e.g. "user_2abc123...")
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gstin TEXT,
  website TEXT,
  founder_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  employee_count INTEGER,
  funding_stage TEXT,
  industry TEXT,
  compliance_score INTEGER DEFAULT 0,
  grievance_officer_name TEXT,
  grievance_officer_email TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Compliance Tasks Table
CREATE TABLE compliance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_clerk_user_id TEXT REFERENCES companies(clerk_user_id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  estimated_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Breach Incidents Table
CREATE TABLE breach_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_clerk_user_id TEXT REFERENCES companies(clerk_user_id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  breach_type TEXT,
  affected_users_count INTEGER,
  data_categories_affected TEXT[],
  dpb_notified_at TIMESTAMP WITH TIME ZONE,
  users_notified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  incident_report TEXT,
  dpb_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Data Inventory Items Table
CREATE TABLE data_inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_clerk_user_id TEXT REFERENCES companies(clerk_user_id) ON DELETE CASCADE,
  data_category TEXT NOT NULL,
  data_type TEXT NOT NULL,
  collection_purpose TEXT,
  storage_location TEXT,
  retention_period TEXT,
  third_party_shared BOOLEAN DEFAULT FALSE,
  third_party_names TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Generated Documents Table
CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_clerk_user_id TEXT REFERENCES companies(clerk_user_id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development (enable and tighten for production)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE breach_incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents DISABLE ROW LEVEL SECURITY;
