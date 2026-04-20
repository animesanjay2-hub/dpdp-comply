-- DPDP Comply Database Schema
-- Run this in your Supabase SQL Editor

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Companies Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
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
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: For development testing purposes, you can disable RLS (Row Level Security) 
-- on these tables so that your frontend app can read/write without complex auth policies.
-- In a production environment, you should tighten RLS appropriately.
