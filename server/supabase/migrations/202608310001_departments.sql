-- Migration: Create departments table and default seed departments
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  hod_id uuid references users(id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists departments_code_idx on departments(code);
create index if not exists departments_hod_idx on departments(hod_id);

alter table departments enable row level security;

grant usage on schema public to service_role, anon, authenticated;
grant all on departments to service_role;
grant select on departments to authenticated;
alter default privileges in schema public grant all on tables to service_role;

-- Seed the 13 official departments
insert into departments (name, code, description) values
  ('Artificial Intelligence', 'AI', 'Department of Artificial Intelligence'),
  ('Information Technology', 'IT', 'Department of Information Technology'),
  ('Computer Science & Engineering', 'CSE', 'Department of Computer Science & Engineering'),
  ('Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering'),
  ('Civil Engineering', 'CIVIL', 'Department of Civil Engineering'),
  ('Computer Science & Business Systems', 'CSBS', 'Department of Computer Science & Business Systems'),
  ('Master of Business Administration', 'MBA', 'Department of Management Studies (MBA)'),
  ('Master of Computer Applications', 'MCA', 'Department of Computer Applications (MCA)'),
  ('Cyber Security', 'CYBER', 'Department of Cyber Security'),
  ('Freshman Engineering', 'FE', 'Department of Freshman Engineering / Science & Humanities'),
  ('Electronics & Communication Engineering', 'ECE', 'Department of Electronics & Communication Engineering'),
  ('Electrical & Electronics Engineering', 'EEE', 'Department of Electrical & Electronics Engineering'),
  ('VLSI Design & Technology', 'VLSI', 'Department of VLSI Design & Technology')
on conflict (code) do nothing;

