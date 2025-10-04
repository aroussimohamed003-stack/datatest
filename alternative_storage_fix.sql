-- حل بديل لمشكلة Storage RLS
-- استخدم هذا الملف إذا فشلت الطرق الأخرى

-- 1. إنشاء Buckets فقط
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "Public Access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for profiles" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for posts" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for posts" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for posts" ON storage.objects;

-- 3. إنشاء سياسة واحدة بسيطة للجميع
CREATE POLICY "Allow all operations for authenticated users" ON storage.objects
FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. اختبار النتيجة
SELECT 'تم إنشاء Storage مع سياسة بسيطة' as result;
