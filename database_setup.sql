-- =============================================
-- إعداد قاعدة البيانات لموقع Instagram Clone
-- =============================================

-- 1. إنشاء جدول الملفات الشخصية (profiles)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة جميع الملفات الشخصية
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين المصادق عليهم بإدراج ملفهم الشخصي
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- سياسة للسماح للمستخدمين بتحديث ملفهم الشخصي فقط
CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- سياسة للسماح للمستخدمين بحذف ملفهم الشخصي
CREATE POLICY "Enable delete for users based on user_id" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. إنشاء جدول المنشورات (posts)
-- =============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة المنشورات
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين بإضافة منشورات
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بتحديث منشوراتهم
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بحذف منشوراتهم
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- سياسة للسماح للمديرين بحذف أي منشور
CREATE POLICY "Admins can delete any post" ON posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 3. إنشاء جدول الإعجابات (likes)
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- تفعيل RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمستخدمين بإدارة إعجاباتهم
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- 4. إنشاء جدول التعليقات (comments)
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة التعليقات
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- سياسة للسماح للمستخدمين بإضافة تعليقات
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بتحديث تعليقاتهم
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسة للسماح للمستخدمين بحذف تعليقاتهم
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- سياسة للسماح للمديرين بحذف أي تعليق
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. إنشاء Storage Buckets
-- =============================================

-- إنشاء bucket للملفات الشخصية
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للمنشورات
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 6. إعداد سياسات Storage
-- =============================================

-- سياسات profiles bucket
CREATE POLICY "Public Access for profiles" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- سياسات posts bucket
CREATE POLICY "Public Access for posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts' 
  AND auth.uid()::text = split_part(name, '_', 1)
);

CREATE POLICY "Users can update own post images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = split_part(name, '_', 1)
);

CREATE POLICY "Users can delete own post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = split_part(name, '_', 1)
);

-- 7. إنشاء Functions مفيدة
-- =============================================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على الجداول
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لحساب عدد الإعجابات
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول الإعجابات
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 8. إنشاء فهارس لتحسين الأداء
-- =============================================

-- فهارس لجدول المنشورات
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);

-- فهارس لجدول التعليقات
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- فهارس لجدول الإعجابات
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- 9. إدراج بيانات تجريبية (اختياري)
-- =============================================

-- يمكنك إلغاء التعليق عن هذا القسم لإضافة بيانات تجريبية
/*
-- إنشاء مستخدم تجريبي (يجب أن يكون موجود في auth.users أولاً)
INSERT INTO profiles (id, username, email, is_admin) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin',
  'admin@example.com',
  true
) ON CONFLICT (id) DO NOTHING;
*/

-- =============================================
-- انتهاء إعداد قاعدة البيانات
-- =============================================
