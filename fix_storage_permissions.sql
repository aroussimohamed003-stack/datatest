-- إصلاح صلاحيات Storage في Supabase
-- استخدم هذا الملف لحل مشكلة "must be owner of table objects"

-- 1. إنشاء Storage Buckets (إذا لم تكن موجودة)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. إنشاء سياسات Storage باستخدام auth.uid() بدلاً من auth.role()
-- سياسات للملفات الشخصية
CREATE POLICY IF NOT EXISTS "Public profiles are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY IF NOT EXISTS "Users can upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can update profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can delete profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.uid() IS NOT NULL
);

-- سياسات للمنشورات
CREATE POLICY IF NOT EXISTS "Public posts are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY IF NOT EXISTS "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can update post images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can delete post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts' 
  AND auth.uid() IS NOT NULL
);

-- 3. اختبار إنشاء السياسات
SELECT 'تم إنشاء سياسات Storage بنجاح' as result;
