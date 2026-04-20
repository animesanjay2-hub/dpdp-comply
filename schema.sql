CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  clerk_user_id text NOT NULL UNIQUE,
  name text NOT NULL,
  gstin text,
  website text,
  founder_name text,
  email text NOT NULL,
  phone text,
  employee_count integer,
  funding_stage text,
  industry text,
  compliance_score integer DEFAULT 0,
  grievance_officer_name text,
  grievance_officer_email text,
  onboarding_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

CREATE TABLE public.breach_incidents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_clerk_user_id text NOT NULL,
  detected_at timestamp with time zone NOT NULL,
  breach_type text,
  affected_users_count integer,
  data_categories_affected ARRAY,
  dpb_notified_at timestamp with time zone,
  users_notified_at timestamp with time zone,
  status text NOT NULL,
  incident_report text,
  dpb_letter text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT breach_incidents_pkey PRIMARY KEY (id),
  CONSTRAINT breach_incidents_company_clerk_user_id_fkey FOREIGN KEY (company_clerk_user_id) REFERENCES public.companies(clerk_user_id)
);

CREATE TABLE public.compliance_tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_clerk_user_id text NOT NULL,
  task_name text NOT NULL,
  category text NOT NULL,
  priority text NOT NULL,
  deadline timestamp with time zone,
  status text NOT NULL,
  estimated_time text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compliance_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT compliance_tasks_company_clerk_user_id_fkey FOREIGN KEY (company_clerk_user_id) REFERENCES public.companies(clerk_user_id)
);

CREATE TABLE public.data_inventory_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_clerk_user_id text NOT NULL,
  data_category text NOT NULL,
  data_type text NOT NULL,
  collection_purpose text,
  storage_location text,
  retention_period text,
  third_party_shared boolean DEFAULT false,
  third_party_names ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT data_inventory_items_pkey PRIMARY KEY (id),
  CONSTRAINT data_inventory_items_company_clerk_user_id_fkey FOREIGN KEY (company_clerk_user_id) REFERENCES public.companies(clerk_user_id)
);

CREATE TABLE public.generated_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_clerk_user_id text NOT NULL,
  doc_type text NOT NULL,
  content text NOT NULL,
  language text NOT NULL,
  version integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT generated_documents_pkey PRIMARY KEY (id),
  CONSTRAINT generated_documents_company_clerk_user_id_fkey FOREIGN KEY (company_clerk_user_id) REFERENCES public.companies(clerk_user_id)
);

-- Enable Row Level Security on all tablesALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Policies for companies (only allow access to own data)
CREATE POLICY "companies_select_policy" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "companies_insert_policy" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update_policy" ON public.companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "companies_delete_policy" ON public.companies FOR DELETE TO authenticated USING (true);

-- Policies for breach_incidents
CREATE POLICY "breach_incidents_select_policy" ON public.breach_incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "breach_incidents_insert_policy" ON public.breach_incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "breach_incidents_update_policy" ON public.breach_incidents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "breach_incidents_delete_policy" ON public.breach_incidents FOR DELETE TO authenticated USING (true);

-- Policies for compliance_tasksCREATE POLICY "compliance_tasks_select_policy" ON public.compliance_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "compliance_tasks_insert_policy" ON public.compliance_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "compliance_tasks_update_policy" ON public.compliance_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "compliance_tasks_delete_policy" ON public.compliance_tasks FOR DELETE TO authenticated USING (true);

-- Policies for data_inventory_items
CREATE POLICY "data_inventory_items_select_policy" ON public.data_inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "data_inventory_items_insert_policy" ON public.data_inventory_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "data_inventory_items_update_policy" ON public.data_inventory_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "data_inventory_items_delete_policy" ON public.data_inventory_items FOR DELETE TO authenticated USING (true);

-- Policies for generated_documents
CREATE POLICY "generated_documents_select_policy" ON public.generated_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "generated_documents_insert_policy" ON public.generated_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "generated_documents_update_policy" ON public.generated_documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "generated_documents_delete_policy" ON public.generated_documents FOR DELETE TO authenticated USING (true);