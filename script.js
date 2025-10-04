// إعداد Supabase
const supabaseUrl = 'https://mpcrbgtqqeopypxvcicj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wY3JiZ3RxcWVvcHlweHZjaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjcwMjQsImV4cCI6MjA3NTE0MzAyNH0.6WDHyVsg4XmQ1wzwJ6WZj366Q838LsfzSuzTuBQWbEo';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// متغيرات عامة
let currentUser = null;
let currentUserProfile = null;
let posts = [];
let users = [];

// عناصر DOM
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const mainPage = document.getElementById('mainPage');
const adminPage = document.getElementById('adminPage');
const profilePage = document.getElementById('profilePage');
const addPostModal = document.getElementById('addPostModal');

// النماذج
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const addPostForm = document.getElementById('addPostForm');
const updateProfileForm = document.getElementById('updateProfileForm');

// الأزرار
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
const adminBtn = document.getElementById('adminBtn');
const addPostBtn = document.getElementById('addPostBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelPostBtn = document.getElementById('cancelPost');
const backToMainBtn = document.getElementById('backToMainBtn');
const backToMainFromProfileBtn = document.getElementById('backToMainFromProfile');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const profileLogoutBtn = document.getElementById('profileLogoutBtn');
const cancelProfileUpdateBtn = document.getElementById('cancelProfileUpdate');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// المحتوى
const postsContainer = document.getElementById('postsContainer');
const usersList = document.getElementById('usersList');
const adminPostsList = document.getElementById('adminPostsList');
const totalUsers = document.getElementById('totalUsers');
const totalPosts = document.getElementById('totalPosts');

// عناصر الملف الشخصي
const currentAvatar = document.getElementById('currentAvatar');
const currentUsername = document.getElementById('currentUsername');
const currentEmail = document.getElementById('currentEmail');
const newUsername = document.getElementById('newUsername');
const newProfileImage = document.getElementById('newProfileImage');
const newAvatarPreview = document.getElementById('newAvatarPreview');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    // التحقق من حالة تسجيل الدخول
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        await loadUserData();
        showMainPage();
    } else {
        showLoginPage();
    }
    
    setupEventListeners();
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تسجيل الدخول
    showRegisterBtn.addEventListener('click', () => {
        showRegisterPage();
    });
    
    showLoginBtn.addEventListener('click', () => {
        showLoginPage();
    });
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // الأزرار الرئيسية
    logoutBtn.addEventListener('click', handleLogout);
    profileBtn.addEventListener('click', showProfilePage);
    adminBtn.addEventListener('click', showAdminPage);
    addPostBtn.addEventListener('click', () => {
        addPostModal.classList.remove('hidden');
    });
    
    // نافذة إضافة المنشور
    closeModalBtn.addEventListener('click', () => {
        addPostModal.classList.add('hidden');
    });
    
    cancelPostBtn.addEventListener('click', () => {
        addPostModal.classList.add('hidden');
    });
    
    addPostForm.addEventListener('submit', handleAddPost);
    
    // صفحة الإدارة
    backToMainBtn.addEventListener('click', showMainPage);
    adminLogoutBtn.addEventListener('click', handleLogout);
    
    // صفحة الملف الشخصي
    backToMainFromProfileBtn.addEventListener('click', showMainPage);
    profileLogoutBtn.addEventListener('click', handleLogout);
    updateProfileForm.addEventListener('submit', handleUpdateProfile);
    cancelProfileUpdateBtn.addEventListener('click', () => {
        showMainPage();
    });
    deleteAccountBtn.addEventListener('click', handleDeleteAccount);
}

// عرض الصفحات
function showLoginPage() {
    hideAllPages();
    loginPage.classList.remove('hidden');
}

function showRegisterPage() {
    hideAllPages();
    registerPage.classList.remove('hidden');
}

function showMainPage() {
    hideAllPages();
    mainPage.classList.remove('hidden');
    loadPosts();
}

function showAdminPage() {
    hideAllPages();
    adminPage.classList.remove('hidden');
    loadAdminData();
}

function showProfilePage() {
    hideAllPages();
    profilePage.classList.remove('hidden');
    loadProfileData();
}

function hideAllPages() {
    loginPage.classList.add('hidden');
    registerPage.classList.add('hidden');
    mainPage.classList.add('hidden');
    adminPage.classList.add('hidden');
    profilePage.classList.add('hidden');
}

// تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // التحقق من صحة البيانات
    if (!email || !password) {
        showAlert('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('البريد الإلكتروني غير صالح، استخدم تنسيق صحيح مثل: example@gmail.com', 'error');
        return;
    }
    
    try {
        console.log('محاولة تسجيل الدخول...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            throw error;
        }
        
        console.log('تم تسجيل الدخول بنجاح:', data);
        currentUser = data.user;
        await loadUserData();
        showMainPage();
        showAlert('تم تسجيل الدخول بنجاح', 'success');
    } catch (error) {
        console.error('تفاصيل الخطأ:', error);
        let errorMessage = 'خطأ في تسجيل الدخول';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'يرجى تأكيد البريد الإلكتروني أولاً';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'محاولات كثيرة جداً، حاول مرة أخرى لاحقاً';
        } else if (error.message.includes('Invalid email')) {
            errorMessage = 'البريد الإلكتروني غير صالح، استخدم بريد إلكتروني حقيقي';
        } else {
            errorMessage = 'خطأ في تسجيل الدخول: ' + error.message;
        }
        
        showAlert(errorMessage, 'error');
    }
}

// التسجيل
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const profileImage = document.getElementById('profileImage').files[0];
    
    // التحقق من صحة البيانات
    if (!username || !email || !password) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('البريد الإلكتروني غير صالح، استخدم تنسيق صحيح مثل: example@gmail.com', 'error');
        return;
    }
    
    // التحقق من أن البريد الإلكتروني لا ينتهي بـ .com فقط
    if (email.endsWith('.com') && !email.includes('@')) {
        showAlert('البريد الإلكتروني غير صالح، استخدم تنسيق صحيح مثل: example@gmail.com', 'error');
        return;
    }
    
    // التحقق من أن البريد الإلكتروني يحتوي على @
    if (!email.includes('@')) {
        showAlert('البريد الإلكتروني يجب أن يحتوي على @', 'error');
        return;
    }
    
    // التحقق من أن البريد الإلكتروني لا يبدأ بـ @
    if (email.startsWith('@')) {
        showAlert('البريد الإلكتروني لا يمكن أن يبدأ بـ @', 'error');
        return;
    }
    
    try {
        console.log('بدء عملية التسجيل...');
        
        // إنشاء المستخدم
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('خطأ في إنشاء المستخدم:', error);
            throw error;
        }
        
        console.log('تم إنشاء المستخدم:', data);
        
        // رفع صورة الملف الشخصي
        let profileImageUrl = null;
        if (profileImage) {
            try {
                console.log('بدء رفع صورة الملف الشخصي...', profileImage);
                
                // التحقق من وجود bucket
                const { data: buckets } = await supabase.storage.listBuckets();
                console.log('Buckets الموجودة:', buckets);
                
                const fileExt = profileImage.name.split('.').pop();
                const fileName = `${data.user.id}.${fileExt}`;
                
                console.log('اسم الملف:', fileName);
                
                // رفع الصورة
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(fileName, profileImage, {
                        cacheControl: '3600',
                        upsert: true
                    });
                
                if (uploadError) {
                    console.error('خطأ في رفع الصورة:', uploadError);
                    showAlert('خطأ في رفع صورة الملف الشخصي: ' + uploadError.message, 'error');
                } else {
                    console.log('تم رفع الصورة بنجاح:', uploadData);
                    
                    // الحصول على الرابط العام
                    const { data: { publicUrl } } = supabase.storage
                        .from('profiles')
                        .getPublicUrl(fileName);
                    
                    profileImageUrl = publicUrl;
                    console.log('رابط الصورة:', profileImageUrl);
                }
            } catch (uploadError) {
                console.error('خطأ في رفع الصورة:', uploadError);
                showAlert('خطأ في رفع صورة الملف الشخصي: ' + uploadError.message, 'error');
            }
        }
        
        // حفظ بيانات المستخدم
        console.log('حفظ بيانات الملف الشخصي...');
        
        // انتظار قليل للتأكد من إنشاء المستخدم
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    username: username,
                    email: email,
                    avatar_url: profileImageUrl,
                    is_admin: false
                }
            ]);
        
        if (profileError) {
            console.error('خطأ في حفظ الملف الشخصي:', profileError);
            
            // إذا كان الخطأ بسبب عدم وجود الجدول، أنشئه
            if (profileError.code === 'PGRST116' || profileError.message.includes('relation "profiles" does not exist')) {
                console.log('جدول profiles غير موجود، سيتم إنشاؤه...');
                showAlert('يرجى تشغيل ملف database_setup.sql في Supabase أولاً', 'error');
                return;
            }
            
            // إذا كان الخطأ بسبب تكرار البيانات
            if (profileError.code === '23505') {
                console.log('المستخدم موجود بالفعل، محاولة التحديث...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        username: username,
                        email: email,
                        avatar_url: profileImageUrl
                    })
                    .eq('id', data.user.id);
                
                if (updateError) {
                    console.error('خطأ في تحديث الملف الشخصي:', updateError);
                    throw updateError;
                }
            } else {
                throw profileError;
            }
        }
        
        console.log('تم إنشاء الحساب بنجاح');
        currentUser = data.user;
        await loadUserData();
        showMainPage();
        showAlert('تم إنشاء الحساب بنجاح', 'success');
    } catch (error) {
        console.error('تفاصيل الخطأ في التسجيل:', error);
        let errorMessage = 'خطأ في التسجيل';
        
        if (error.message.includes('User already registered')) {
            errorMessage = 'هذا البريد الإلكتروني مسجل بالفعل';
        } else if (error.message.includes('Password should be at least')) {
            errorMessage = 'كلمة المرور قصيرة جداً';
        } else if (error.message.includes('Invalid email')) {
            errorMessage = 'البريد الإلكتروني غير صالح، استخدم بريد إلكتروني حقيقي (مثل @gmail.com)';
        } else if (error.message.includes('duplicate key value')) {
            errorMessage = 'اسم المستخدم مستخدم بالفعل';
        } else if (error.message.includes('Email address') && error.message.includes('is invalid')) {
            errorMessage = 'البريد الإلكتروني غير صالح، استخدم تنسيق صحيح مثل: example@gmail.com';
        } else if (error.message.includes('Email address') && error.message.includes('.com') && error.message.includes('is invalid')) {
            errorMessage = 'البريد الإلكتروني غير مكتمل، تأكد من كتابة اسم المستخدم قبل @ والنطاق بعد @';
        } else {
            errorMessage = 'خطأ في التسجيل: ' + error.message;
        }
        
        showAlert(errorMessage, 'error');
    }
}

// تسجيل الخروج
async function handleLogout() {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        showLoginPage();
        showAlert('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ في تسجيل الخروج: ' + error.message, 'error');
    }
}

// تحميل بيانات المستخدم
async function loadUserData() {
    if (!currentUser) {
        console.log('لا يوجد مستخدم مسجل الدخول');
        return;
    }
    
    try {
        console.log('تحميل بيانات المستخدم...');
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) {
            console.error('خطأ في تحميل بيانات المستخدم:', error);
            
            // إذا لم يكن هناك ملف شخصي، أنشئ واحد
            if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
                console.log('إنشاء ملف شخصي جديد...');
                
                try {
                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: currentUser.id,
                                username: currentUser.email.split('@')[0],
                                email: currentUser.email,
                                avatar_url: null,
                                is_admin: false
                            }
                        ]);
                    
                    if (insertError) {
                        console.error('خطأ في إنشاء الملف الشخصي:', insertError);
                        
                        // إذا كان الخطأ بسبب عدم وجود الجدول
                        if (insertError.code === 'PGRST116' || insertError.message.includes('relation "profiles" does not exist')) {
                            showAlert('يرجى تشغيل ملف database_setup.sql في Supabase أولاً', 'error');
                        }
                    } else {
                        console.log('تم إنشاء الملف الشخصي بنجاح');
                        // إعادة تحميل البيانات بعد الإنشاء
                        await loadUserData();
                    }
                } catch (insertErr) {
                    console.error('خطأ في إنشاء الملف الشخصي:', insertErr);
                }
            } else if (error.code === 'PGRST116' || error.message.includes('relation "profiles" does not exist')) {
                showAlert('يرجى تشغيل ملف database_setup.sql في Supabase أولاً', 'error');
            }
        } else {
            console.log('تم تحميل بيانات المستخدم:', data);
            currentUserProfile = data;
            // تحديث عرض الملف الشخصي في الواجهة
            updateUserProfileDisplay();
        }
    } catch (error) {
        console.error('خطأ عام في تحميل بيانات المستخدم:', error);
    }
}

// تحديث عرض الملف الشخصي في الواجهة
function updateUserProfileDisplay() {
    if (!currentUserProfile) return;
    
    console.log('تحديث عرض الملف الشخصي:', currentUserProfile);
    
    // تحديث صورة الملف الشخصي في المنشورات
    const avatarImages = document.querySelectorAll('.post-avatar');
    avatarImages.forEach(img => {
        if (currentUserProfile.avatar_url) {
            console.log('تحديث صورة الملف الشخصي:', currentUserProfile.avatar_url);
            img.src = currentUserProfile.avatar_url;
        }
    });
    
    // تحديث اسم المستخدم في الواجهة
    const usernameElements = document.querySelectorAll('.post-user-info h3');
    usernameElements.forEach(element => {
        if (element.textContent === 'مستخدم' || element.textContent === currentUser.email.split('@')[0]) {
            element.textContent = currentUserProfile.username;
        }
    });
}

// تحميل المنشورات
async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        posts = data || [];
        displayPosts();
        // تحديث عرض الملف الشخصي بعد تحميل المنشورات
        updateUserProfileDisplay();
    } catch (error) {
        showAlert('خطأ في تحميل المنشورات: ' + error.message, 'error');
    }
}

// عرض المنشورات
function displayPosts() {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">لا توجد منشورات بعد</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
    
    // إصلاح صور الملف الشخصي بعد إنشاء المنشورات
    setTimeout(() => {
        fixProfileImages();
    }, 100);
}

// إصلاح صور الملف الشخصي
function fixProfileImages() {
    console.log('إصلاح صور الملف الشخصي...');
    
    const avatarImages = document.querySelectorAll('.post-avatar');
    avatarImages.forEach((img, index) => {
        // إذا كانت الصورة لا تزال الافتراضية، جرب تحديثها
        if (img.src.includes('placeholder.com') && currentUserProfile?.avatar_url) {
            console.log(`تحديث صورة الملف الشخصي ${index + 1}:`, currentUserProfile.avatar_url);
            img.src = currentUserProfile.avatar_url;
        }
    });
}

// إنشاء عنصر المنشور
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    
    const createdAt = new Date(post.created_at).toLocaleDateString('ar-SA');
    
    // معالجة صورة الملف الشخصي
    let avatarUrl = 'https://via.placeholder.com/40/667eea/ffffff?text=👤';
    if (post.profiles?.avatar_url) {
        avatarUrl = post.profiles.avatar_url;
        console.log('استخدام صورة من post.profiles:', avatarUrl);
    } else if (currentUserProfile?.avatar_url) {
        avatarUrl = currentUserProfile.avatar_url;
        console.log('استخدام صورة من currentUserProfile:', avatarUrl);
    } else {
        console.log('استخدام الصورة الافتراضية');
    }
    
    // معالجة صورة المنشور
    let postImageHtml = '';
    if (post.image_url) {
        postImageHtml = `<img src="${post.image_url}" alt="صورة المنشور" class="post-image" onerror="this.style.display='none'">`;
    }
    
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${avatarUrl}" 
                 alt="صورة الملف الشخصي" 
                 class="post-avatar"
                 onerror="this.src='https://via.placeholder.com/40/667eea/ffffff?text=👤'">
            <div class="post-user-info">
                <h3>${post.profiles?.username || 'مستخدم'}</h3>
                <p>${createdAt}</p>
            </div>
        </div>
        ${postImageHtml}
        <div class="post-content">
            <p class="post-text">${post.content || ''}</p>
        </div>
        <div class="post-actions">
            <button class="post-action">❤️ ${post.likes || 0}</button>
            <button class="post-action">💬 تعليق</button>
            <button class="post-action">📤 مشاركة</button>
        </div>
        <div class="post-date">${createdAt}</div>
    `;
    
    return postDiv;
}

// إضافة منشور جديد
async function handleAddPost(e) {
    e.preventDefault();
    
    const content = document.getElementById('postText').value;
    const imageFile = document.getElementById('postImage').files[0];
    
    if (!content && !imageFile) {
        showAlert('يرجى إدخال نص أو صورة', 'error');
        return;
    }
    
    try {
        let imageUrl = null;
        
        // رفع الصورة
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('posts')
                .upload(fileName, imageFile);
            
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);
            imageUrl = publicUrl;
        }
        
        // حفظ المنشور
        const { error } = await supabase
            .from('posts')
            .insert([
                {
                    user_id: currentUser.id,
                    content: content,
                    image_url: imageUrl,
                    likes: 0
                }
            ]);
        
        if (error) throw error;
        
        // إعادة تحميل المنشورات
        await loadPosts();
        
        // إغلاق النافذة المنبثقة
        addPostModal.classList.add('hidden');
        addPostForm.reset();
        
        showAlert('تم نشر المنشور بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ في نشر المنشور: ' + error.message, 'error');
    }
}

// تحميل بيانات الإدارة
async function loadAdminData() {
    try {
        // تحميل المستخدمين
        const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (usersError) throw usersError;
        
        users = usersData || [];
        displayUsers();
        totalUsers.textContent = users.length;
        
        // تحميل المنشورات
        const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });
        
        if (postsError) throw postsError;
        
        posts = postsData || [];
        displayAdminPosts();
        totalPosts.textContent = posts.length;
    } catch (error) {
        showAlert('خطأ في تحميل بيانات الإدارة: ' + error.message, 'error');
    }
}

// عرض المستخدمين
function displayUsers() {
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        
        // معالجة صورة الملف الشخصي
        let avatarUrl = 'https://via.placeholder.com/50/667eea/ffffff?text=👤';
        if (user.avatar_url) {
            avatarUrl = user.avatar_url;
        }
        
        userDiv.innerHTML = `
            <div class="user-info">
                <img src="${avatarUrl}" 
                     alt="صورة الملف الشخصي" 
                     class="user-avatar"
                     onerror="this.src='https://via.placeholder.com/50/667eea/ffffff?text=👤'">
                <div>
                    <h4>${user.username}</h4>
                    <p>${user.email}</p>
                    <small>${user.is_admin ? 'مدير' : 'مستخدم عادي'}</small>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteUser('${user.id}')">حذف</button>
        `;
        
        usersList.appendChild(userDiv);
    });
}

// عرض منشورات الإدارة
function displayAdminPosts() {
    adminPostsList.innerHTML = '';
    
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-item';
        
        const createdAt = new Date(post.created_at).toLocaleDateString('ar-SA');
        
        // معالجة صورة الملف الشخصي
        let avatarUrl = 'https://via.placeholder.com/50/667eea/ffffff?text=👤';
        if (post.profiles?.avatar_url) {
            avatarUrl = post.profiles.avatar_url;
        }
        
        // معالجة محتوى المنشور
        let postContent = post.content || 'منشور بصورة فقط';
        if (post.image_url) {
            postContent += ' 📷';
        }
        
        postDiv.innerHTML = `
            <div class="post-info">
                <img src="${avatarUrl}" 
                     alt="صورة الملف الشخصي" 
                     class="user-avatar"
                     onerror="this.src='https://via.placeholder.com/50/667eea/ffffff?text=👤'">
                <div>
                    <h4>${post.profiles?.username || 'مستخدم'}</h4>
                    <p>${postContent}</p>
                    <small>${createdAt}</small>
                </div>
            </div>
            <button class="delete-btn" onclick="deletePost('${post.id}')">حذف</button>
        `;
        
        adminPostsList.appendChild(postDiv);
    });
}

// حذف مستخدم
async function deleteUser(userId) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        await loadAdminData();
        showAlert('تم حذف المستخدم بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ في حذف المستخدم: ' + error.message, 'error');
    }
}

// حذف منشور
async function deletePost(postId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
        
        if (error) throw error;
        
        await loadAdminData();
        showAlert('تم حذف المنشور بنجاح', 'success');
    } catch (error) {
        showAlert('خطأ في حذف المنشور: ' + error.message, 'error');
    }
}

// عرض رسائل التنبيه
function showAlert(message, type) {
    // إزالة الرسائل السابقة
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // إدراج الرسالة في أعلى الصفحة
    const firstPage = document.querySelector('.page:not(.hidden)');
    firstPage.insertBefore(alertDiv, firstPage.firstChild);
    
    // إزالة الرسالة بعد 5 ثوان
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// إعداد قاعدة البيانات
async function setupDatabase() {
    try {
        // إنشاء جدول الملفات الشخصية
        const { error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (profilesError && profilesError.code === 'PGRST116') {
            console.log('يجب إنشاء جدول profiles في Supabase');
        }
        
        // إنشاء جدول المنشورات
        const { error: postsError } = await supabase
            .from('posts')
            .select('*')
            .limit(1);
        
        if (postsError && postsError.code === 'PGRST116') {
            console.log('يجب إنشاء جدول posts في Supabase');
        }
        
        // إنشاء bucket للتخزين
        const { data: buckets } = await supabase.storage.listBuckets();
        
        if (!buckets.find(bucket => bucket.name === 'profiles')) {
            console.log('يجب إنشاء bucket profiles في Supabase Storage');
        }
        
        if (!buckets.find(bucket => bucket.name === 'posts')) {
            console.log('يجب إنشاء bucket posts في Supabase Storage');
        }
        
    } catch (error) {
        console.error('خطأ في إعداد قاعدة البيانات:', error);
    }
}

// تشغيل إعداد قاعدة البيانات عند تحميل الصفحة
setupDatabase();

// =============================================
// دوال صفحة الملف الشخصي
// =============================================

// تحميل بيانات الملف الشخصي
async function loadProfileData() {
    if (!currentUser || !currentUserProfile) {
        console.log('لا توجد بيانات مستخدم للعرض');
        return;
    }
    
    console.log('تحميل بيانات الملف الشخصي للعرض:', currentUserProfile);
    
    // تحديث الصورة الحالية
    if (currentUserProfile.avatar_url) {
        currentAvatar.src = currentUserProfile.avatar_url;
    } else {
        currentAvatar.src = 'https://via.placeholder.com/150/667eea/ffffff?text=👤';
    }
    
    // تحديث اسم المستخدم
    currentUsername.textContent = currentUserProfile.username;
    currentEmail.textContent = currentUserProfile.email;
    
    // تحديث حقل اسم المستخدم الجديد
    newUsername.value = currentUserProfile.username;
}

// معاينة صورة الملف الشخصي الجديدة
function previewNewAvatar() {
    const file = newProfileImage.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newAvatarPreview.innerHTML = `
                <img src="${e.target.result}" alt="معاينة الصورة الجديدة">
                <p style="margin-top: 10px; color: #666;">معاينة الصورة الجديدة</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        newAvatarPreview.innerHTML = '';
    }
}

// جعل الدالة متاحة عالمياً
window.previewNewAvatar = previewNewAvatar;

// تحديث الملف الشخصي
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const username = newUsername.value.trim();
    const profileImage = newProfileImage.files[0];
    
    if (!username) {
        showAlert('يرجى إدخال اسم المستخدم', 'error');
        return;
    }
    
    try {
        console.log('بدء تحديث الملف الشخصي...');
        
        let avatarUrl = currentUserProfile.avatar_url;
        
        // رفع صورة جديدة إذا تم اختيارها
        if (profileImage) {
            console.log('رفع صورة جديدة...');
            
            const fileExt = profileImage.name.split('.').pop();
            const fileName = `${currentUser.id}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(fileName, profileImage, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('خطأ في رفع الصورة:', uploadError);
                showAlert('خطأ في رفع الصورة: ' + uploadError.message, 'error');
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);
            
            avatarUrl = publicUrl;
            console.log('تم رفع الصورة بنجاح:', publicUrl);
        }
        
        // تحديث بيانات الملف الشخصي
        console.log('تحديث بيانات الملف الشخصي...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                username: username,
                avatar_url: avatarUrl
            })
            .eq('id', currentUser.id);
        
        if (updateError) {
            console.error('خطأ في تحديث الملف الشخصي:', updateError);
            showAlert('خطأ في تحديث الملف الشخصي: ' + updateError.message, 'error');
            return;
        }
        
        // تحديث البيانات المحلية
        currentUserProfile.username = username;
        currentUserProfile.avatar_url = avatarUrl;
        
        // تحديث العرض
        await loadProfileData();
        
        showAlert('تم تحديث الملف الشخصي بنجاح', 'success');
        
        // العودة للصفحة الرئيسية
        setTimeout(() => {
            showMainPage();
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في تحديث الملف الشخصي:', error);
        showAlert('خطأ في تحديث الملف الشخصي: ' + error.message, 'error');
    }
}

// حذف الحساب
async function handleDeleteAccount() {
    if (!confirm('هل أنت متأكد من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه!')) {
        return;
    }
    
    if (!confirm('تأكيد نهائي: هل أنت متأكد من حذف الحساب نهائياً؟')) {
        return;
    }
    
    try {
        console.log('بدء حذف الحساب...');
        
        // حذف الملف الشخصي
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', currentUser.id);
        
        if (profileError) {
            console.error('خطأ في حذف الملف الشخصي:', profileError);
            showAlert('خطأ في حذف الملف الشخصي: ' + profileError.message, 'error');
            return;
        }
        
        // حذف المنشورات
        const { error: postsError } = await supabase
            .from('posts')
            .delete()
            .eq('user_id', currentUser.id);
        
        if (postsError) {
            console.warn('خطأ في حذف المنشورات:', postsError);
        }
        
        // تسجيل الخروج
        await supabase.auth.signOut();
        
        currentUser = null;
        currentUserProfile = null;
        
        showAlert('تم حذف الحساب بنجاح', 'success');
        
        // العودة لصفحة تسجيل الدخول
        setTimeout(() => {
            showLoginPage();
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في حذف الحساب:', error);
        showAlert('خطأ في حذف الحساب: ' + error.message, 'error');
    }
}
