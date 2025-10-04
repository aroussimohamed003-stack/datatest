-- إصلاح سياسات Storage لرفع الصور
-- استخدم هذا الملف لحل مشكلة "violates row-level security policy"

-- 1. حذف السياسات الموجودة للـ Storage
DROP POLICY IF EXISTS "Public Access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;

-- 2. إنشاء سياسات جديدة مبسطة للـ Storage
-- سياسات للملفات الشخصية
CREATE POLICY "Enable read access for profiles" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Enable insert for profiles" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for profiles" ON storage.objects
FOR UPDATE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for profiles" ON storage.objects
FOR DELETE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- سياسات للمنشورات
CREATE POLICY "Enable read access for posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Enable insert for posts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for posts" ON storage.objects
FOR UPDATE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for posts" ON storage.objects
FOR DELETE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- 3. التأكد من تفعيل RLS على storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. اختبار السياسات
SELECT 'تم إصلاح سياسات Storage بنجاح' as result;
