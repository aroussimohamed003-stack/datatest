-- إصلاح سياسات RLS لجدول profiles
-- استخدم هذا الملف لحل مشكلة "violates row-level security policy"

-- 1. حذف السياسات الموجودة
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;

-- 2. إنشاء سياسات جديدة صحيحة
CREATE POLICY "Enable read access for all users" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 3. التحقق من تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. اختبار السياسات
SELECT 'تم إصلاح سياسات RLS بنجاح' as result;
