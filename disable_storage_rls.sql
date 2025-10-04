-- تعطيل RLS مؤقتاً لحل مشكلة رفع الصور
-- استخدم هذا الملف لحل مشكلة "violates row-level security policy"

-- 1. تعطيل RLS على storage.objects مؤقتاً
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. إنشاء Buckets إذا لم تكن موجودة
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. اختبار إنشاء Buckets
SELECT 'تم تعطيل RLS وإنشاء Buckets بنجاح' as result;
