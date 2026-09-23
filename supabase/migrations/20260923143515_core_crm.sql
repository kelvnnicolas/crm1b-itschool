-- Core: Organizations
create table public.organizations (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Core: Profiles (extends auth.users)
create type public.user_role as enum ('admin', 'commercial', 'teacher', 'operational');

create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    organization_id uuid references public.organizations(id) on delete restrict not null,
    full_name text,
    role user_role default 'operational'::user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRM: Contacts
create table public.contacts (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    email text,
    phone text,
    company text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRM: Lead Stages (Kanban Columns)
create table public.lead_stages (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    sort_order integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(organization_id, name)
);

-- CRM: Leads
create table public.leads (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    contact_id uuid references public.contacts(id) on delete set null,
    title text not null,
    value numeric(10,2) default 0.00,
    stage_id uuid references public.lead_stages(id) on delete restrict not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRM: Notes
create type public.note_entity_type as enum ('contact', 'lead');

create table public.notes (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    entity_type note_entity_type not null,
    entity_id uuid not null, -- Can be contact_id or lead_id
    content text not null,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CRM: Tasks
create type public.task_status as enum ('pending', 'completed', 'cancelled');
create type public.task_entity_type as enum ('contact', 'lead');

create table public.tasks (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    title text not null,
    description text,
    due_date timestamp with time zone,
    status task_status default 'pending'::task_status not null,
    assigned_to uuid references public.profiles(id) on delete set null,
    entity_type task_entity_type,
    entity_id uuid, -- Optional, can be related to a contact or lead
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)

-- Helper function to get current user's organization
create or replace function public.get_current_user_org()
returns uuid as $$
    select organization_id from public.profiles where id = auth.uid() limit 1;
$$ language sql security definer;

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.lead_stages enable row level security;
alter table public.leads enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;

-- Policies for Organizations
-- Users can only see their own organization
create policy "Users can view their own organization" 
    on public.organizations for select 
    using (id = public.get_current_user_org());

-- Policies for Profiles
-- Users can see all profiles in their organization
create policy "Users can view profiles in their organization" 
    on public.profiles for select 
    using (organization_id = public.get_current_user_org());

-- Users can update their own profile
create policy "Users can update their own profile" 
    on public.profiles for update 
    using (id = auth.uid());

-- Policies for Contacts
create policy "Users can view contacts in their organization" on public.contacts for select using (organization_id = public.get_current_user_org());
create policy "Users can insert contacts in their organization" on public.contacts for insert with check (organization_id = public.get_current_user_org());
create policy "Users can update contacts in their organization" on public.contacts for update using (organization_id = public.get_current_user_org());
create policy "Users can delete contacts in their organization" on public.contacts for delete using (organization_id = public.get_current_user_org());

-- Policies for Lead Stages
create policy "Users can view lead_stages in their organization" on public.lead_stages for select using (organization_id = public.get_current_user_org());
create policy "Admins can manage lead_stages" on public.lead_stages for all using (
    organization_id = public.get_current_user_org() and 
    (select role from public.profiles where id = auth.uid()) = 'admin'::user_role
);

-- Policies for Leads
create policy "Users can view leads in their organization" on public.leads for select using (organization_id = public.get_current_user_org());
create policy "Users can insert leads in their organization" on public.leads for insert with check (organization_id = public.get_current_user_org());
create policy "Users can update leads in their organization" on public.leads for update using (organization_id = public.get_current_user_org());
create policy "Users can delete leads in their organization" on public.leads for delete using (organization_id = public.get_current_user_org());

-- Policies for Notes
create policy "Users can view notes in their organization" on public.notes for select using (organization_id = public.get_current_user_org());
create policy "Users can insert notes in their organization" on public.notes for insert with check (organization_id = public.get_current_user_org());
create policy "Users can update their own notes" on public.notes for update using (organization_id = public.get_current_user_org() and created_by = auth.uid());
create policy "Users can delete their own notes" on public.notes for delete using (organization_id = public.get_current_user_org() and created_by = auth.uid());

-- Policies for Tasks
create policy "Users can view tasks in their organization" on public.tasks for select using (organization_id = public.get_current_user_org());
create policy "Users can insert tasks in their organization" on public.tasks for insert with check (organization_id = public.get_current_user_org());
create policy "Users can update tasks in their organization" on public.tasks for update using (organization_id = public.get_current_user_org());
create policy "Users can delete tasks in their organization" on public.tasks for delete using (organization_id = public.get_current_user_org());
