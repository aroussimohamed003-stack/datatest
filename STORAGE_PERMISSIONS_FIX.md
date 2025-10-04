# حل مشكلة صلاحيات Storage في Supabase

## 🚨 المشكلة
```
ERROR: 42501: must be owner of table objects
```

## 🔍 السبب
المستخدم لا يملك صلاحيات كافية لتعديل جدول `storage.objects` في Supabase.

## ✅ الحلول

### الحل الأول: استخدام ملف مبسط
1. **افتح Supabase Dashboard > SQL Editor**
2. **انسخ محتوى `simple_storage_fix.sql`**
3. **الصق واضغط Run**

### الحل الثاني: إعداد Storage من Dashboard
1. **اذهب إلى Storage في Supabase Dashboard**
2. **اضغط "New bucket"**
3. **أنشئ bucket باسم `profiles`**
4. **اختر "Public bucket"**
5. **اضغط "Create bucket"**
6. **كرر العملية لـ `posts`**

### الحل الثالث: استخدام ملف الصلاحيات
1. **افتح Supabase Dashboard > SQL Editor**
2. **انسخ محتوى `fix_storage_permissions.sql`**
3. **الصق واضغط Run**

## 🔧 إعداد Storage يدوياً

### في Supabase Dashboard:

#### 1. إنشاء Bucket للملفات الشخصية:
- **الاسم:** `profiles`
- **النوع:** Public bucket
- **الوصف:** صور الملفات الشخصية

#### 2. إنشاء Bucket للمنشورات:
- **الاسم:** `posts`
- **النوع:** Public bucket
- **الوصف:** صور المنشورات

#### 3. إعداد السياسات:
- **اذهب إلى Storage > Policies**
- **اضغط "New Policy"**
- **اختر "For full customization"**
- **استخدم هذا الكود:**

```sql
-- للقراءة العامة
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (true);

-- للرفع (للمستخدمين المصادق عليهم)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

## 🧪 اختبار الحل

### 1. افتح `test_storage_fix.html`
### 2. اضغط "اختبار شامل"
### 3. راقب النتائج

إذا ظهر:
- ✅ **"تم رفع الصورة بنجاح"** = المشكلة محلولة
- ❌ **"خطأ RLS"** = جرب الحلول الأخرى

## 📝 ملاحظات مهمة

### للاختبار:
- استخدم بريد إلكتروني حقيقي
- تأكد من تسجيل الدخول
- اختبر رفع صورة صغيرة أولاً

### للإنتاج:
- فعّل RLS على Storage
- أضف سياسات أمنية مناسبة
- راقب استخدام Storage

## 🚀 خطوات سريعة

1. **جرب `simple_storage_fix.sql` أولاً**
2. **إذا فشل، استخدم Dashboard**
3. **اختبر مع `test_storage_fix.html`**
4. **تأكد من عمل رفع الصور**

الآن يجب أن تعمل عملية رفع الصور! 🎉
