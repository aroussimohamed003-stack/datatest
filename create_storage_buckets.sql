-- إنشاء Storage Buckets لرفع الصور
-- استخدم هذا الملف إذا لم تكن Buckets موجودة

-- 1. إنشاء bucket للملفات الشخصية
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. إنشاء bucket للمنشورات
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. حذف السياسات الموجودة أولاً
DROP POLICY IF EXISTS "Public Access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;

-- 4. إنشاء سياسات Storage مبسطة للملفات الشخصية
CREATE POLICY "Enable read access for profiles" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Enable insert for profiles" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for profiles" ON storage.objects
FOR UPDATE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for profiles" ON storage.objects
FOR DELETE USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- 5. إنشاء سياسات Storage مبسطة للمنشورات
CREATE POLICY "Enable read access for posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Enable insert for posts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for posts" ON storage.objects
FOR UPDATE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for posts" ON storage.objects
FOR DELETE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- 5. اختبار إنشاء Buckets
SELECT 'تم إنشاء Storage Buckets بنجاح' as result;
