# Instagram Clone - موقع مشابه لإنستغرام

موقع ويب مشابه لإنستغرام مبني باستخدام HTML, CSS, JavaScript مع Supabase كقاعدة بيانات.

## المميزات

- ✅ تسجيل الدخول والتسجيل
- ✅ إضافة المنشورات (نص وصور)
- ✅ عرض المنشورات
- ✅ صفحة إدارة للمشرف
- ✅ تخزين الصور في Supabase Storage
- ✅ تصميم متجاوب
- ✅ واجهة باللغة العربية

## إعداد قاعدة البيانات في Supabase

### الطريقة السريعة (مُوصى بها)

1. **افتح ملف `database_setup.sql`** - يحتوي على جميع الاستعلامات المطلوبة
2. **انسخ المحتوى كاملاً** من الملف
3. **اذهب إلى Supabase Dashboard > SQL Editor**
4. **الصق المحتوى واضغط Run**

### الطريقة اليدوية (للمتقدمين)

#### جدول الملفات الشخصية (profiles)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين بقراءة جميع الملفات الشخصية
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين بتحديث ملفهم الشخصي فقط
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- سياسة للسماح للمستخدمين بإدراج ملفهم الشخصي
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### جدول المنشورات (posts)
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة المنشورات
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين بإضافة منشورات
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بحذف منشوراتهم
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. إنشاء Storage Buckets

اذهب إلى Supabase Dashboard > Storage وقم بإنشاء bucket جديدين:

#### bucket للملفات الشخصية
- الاسم: `profiles`
- Public: `true`

#### bucket للمنشورات
- الاسم: `posts`
- Public: `true`

### 3. إعداد سياسات Storage

اذهب إلى Storage > Policies وقم بإنشاء السياسات التالية:

#### سياسات profiles bucket
```sql
-- السماح للجميع بقراءة الصور
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

-- السماح للمستخدمين برفع صورهم الشخصية
CREATE POLICY "Users can upload own profile images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### سياسات posts bucket
```sql
-- السماح للجميع بقراءة صور المنشورات
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

-- السماح للمستخدمين برفع صور منشوراتهم
CREATE POLICY "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = split_part(name, '_', 1));
```

## تشغيل الموقع

1. افتح ملف `index.html` في المتصفح
2. سجل حساب جديد أو سجل الدخول
3. ابدأ بإضافة المنشورات!

## هيكل المشروع

```
instagram-clone/
├── index.html              # الصفحة الرئيسية
├── styles.css              # ملف التنسيقات
├── script.js               # ملف JavaScript
├── database_setup.sql      # ملف إعداد قاعدة البيانات
├── SETUP_INSTRUCTIONS.md   # تعليمات الإعداد المبسطة
└── README.md               # هذا الملف
```

## المتطلبات

- متصفح ويب حديث
- اتصال بالإنترنت
- حساب Supabase

## الدعم

إذا واجهت أي مشاكل، تأكد من:
1. إعداد الجداول والسياسات بشكل صحيح
2. إعداد Storage buckets والسياسات
3. استخدام مفاتيح API الصحيحة
4. تفعيل RLS في Supabase

## التطوير المستقبلي

- إضافة نظام التعليقات
- إضافة نظام الإعجابات
- إضافة نظام المتابعة
- إضافة البحث
- إضافة الإشعارات
