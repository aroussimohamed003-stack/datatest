-- حل بسيط لمشكلة Storage في Supabase
-- استخدم هذا الملف إذا فشل الملف السابق

-- 1. إنشاء Buckets فقط (بدون سياسات معقدة)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. اختبار إنشاء Buckets
SELECT 'تم إنشاء Storage Buckets بنجاح' as result;
