-- Supabase Schema Migration
-- Create all required tables for MSPL HR Portal

-- 1. HR Users Table
CREATE TABLE IF NOT EXISTS public.hr_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  phoneNumber TEXT,
  verified BOOLEAN DEFAULT FALSE,
  isParentVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
ALTER TABLE public.hr_users ADD COLUMN IF NOT EXISTS isParentVerified BOOLEAN DEFAULT FALSE;

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  registeredAt TEXT,
  phoneNumber TEXT,
  password TEXT,
  email TEXT,
  familyDetails TEXT,
  address TEXT,
  leaveBalance JSONB DEFAULT '{"casual": 0, "sick": 0, "annual": 0}',
  uploadedFilesList JSONB DEFAULT '[]',
  isResigned BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 3. Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employeeId TEXT NOT NULL REFERENCES public.employees(id),
  employeeName TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  isManualOverride BOOLEAN DEFAULT FALSE,
  overrideBy TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 4. Payslips Table
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employeeId TEXT NOT NULL REFERENCES public.employees(id),
  monthYear TEXT NOT NULL,
  basicSalary DECIMAL(10, 2),
  allowances DECIMAL(10, 2),
  deductions DECIMAL(10, 2),
  netSalary DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  deliveredAt TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 5. Finance Ledger Table
CREATE TABLE IF NOT EXISTS public.finance_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2),
  date TEXT,
  category TEXT,
  notes TEXT,
  fileName TEXT,
  fileType TEXT,
  fileData TEXT,
  updatedAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 6. Recycle Bin Table
CREATE TABLE IF NOT EXISTS public.recycle_bin (
  id TEXT PRIMARY KEY,
  sourceType TEXT NOT NULL,
  title TEXT,
  fileName TEXT,
  fileType TEXT,
  fileData TEXT,
  deletedAt TEXT,
  originalPath JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- 7. Employee Queries (Help Desk) Table
CREATE TABLE IF NOT EXISTS public.employee_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employeeId TEXT NOT NULL REFERENCES public.employees(id),
  employeeName TEXT,
  status TEXT DEFAULT 'open',
  queryTitle TEXT,
  queryDescription TEXT,
  category TEXT,
  attachmentUrl TEXT,
  submittedAt TIMESTAMP DEFAULT NOW(),
  hrResponse TEXT,
  hrRespondedAt TEXT,
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- 8. System Config Table
CREATE TABLE IF NOT EXISTS public.system_config (
  id TEXT PRIMARY KEY,
  mdPasscode TEXT DEFAULT 'MD-DIRECTOR-2026',
  companyName TEXT DEFAULT 'MSPL',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON public.hr_users(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_employee ON public.attendance_logs(employeeId);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON public.payslips(employeeId);
CREATE INDEX IF NOT EXISTS idx_employee_queries_employee ON public.employee_queries(employeeId);
CREATE INDEX IF NOT EXISTS idx_employee_queries_status ON public.employee_queries(status);

-- Disable Row Level Security for now (app handles auth via Supabase)
ALTER TABLE public.hr_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_bin DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config DISABLE ROW LEVEL SECURITY;

-- Insert default system config
INSERT INTO public.system_config (id, mdPasscode, companyName) 
VALUES ('auth', 'MD-DIRECTOR-2026', 'MSPL')
ON CONFLICT (id) DO NOTHING;

-- Insert a demo HR user (optional)
INSERT INTO public.hr_users (email, password, verified, isParentVerified) 
VALUES ('demo@mspl.local', 'demo123456', true, true)
ON CONFLICT (email) DO NOTHING;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
