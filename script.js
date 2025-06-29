
let currentUser = null;
let posts = [];
let comments = [];
let editingPostId = null;
let currentPostId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateUI();
    loadPosts();
});

let storage = {
    users: [],
    posts: [],
    comments: []
};


function loadFromStorage() {
    if (storage.posts.length === 0) {
        storage.posts = [
            {
                id: 1,
                title: "Welcome to iBlog",
                content: "Welcome to your first blog post! iBlog is a vibrant platform where you can express your ideas, connect with fellow writers, and explore inspiring content. Start creating your own posts and join the conversation by leaving comments and feedback.",
                author: "Admin",
                authorId: "admin",
                category: "technology",
                timestamp: new Date().toISOString(),
                excerpt: "Join our inspiring platform where your stories spark connections and creativity thrives..."
            },
            {
                id: 2,
                title: "Tips for Great Blog Writing",
                content: "Crafting impactful blog posts takes creativity and strategy. Here are a few helpful tips: 1) Grab attention with a powerful headline, 2) Hook readers with an interesting introduction, 3) Organize your content using clear subheadings, 4) Support your points with meaningful examples, 5) Wrap up with a memorable conclusion that invites readers to engage.",
                author: "BlogMaster",
                authorId: "blogmaster",
                category: "lifestyle",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                excerpt: "Learn the essential techniques for creating blog posts that capture and hold your readers' attention..."
            }
        ];
        
        storage.comments = [
            {
                id: 1,
                postId: 1,
                author: "John Doe",
                authorId: "john",
                content: "Thrilled to be part of this awesome space — can’t wait to express my thoughts!",
                timestamp: new Date().toISOString()
            },

            {
                id: 2,
                postId: 2,
                author: "John Doe",
                authorId: "john",
                content: "Great platform! Looking forward to sharing my thoughts here.",
                timestamp: new Date().toISOString()
            }
        ];
    }
    
    posts = storage.posts;
    comments = storage.comments;
}
function initializeEventListeners() {
    document.getElementById('homeBtn').addEventListener('click', () => showSection('homeSection'));
    document.getElementById('loginBtn').addEventListener('click', () => showSection('loginSection'));
    document.getElementById('signupBtn').addEventListener('click', () => showSection('signupSection'));
    document.getElementById('dashboardBtn').addEventListener('click', () => showSection('dashboardSection'));
    document.getElementById('createPostBtn').addEventListener('click', () => showCreatePost());
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('getStartedBtn').addEventListener('click', () => showSection('signupSection'));
    document.getElementById('backToHomeBtn').addEventListener('click', () => showSection('homeSection'));

    document.getElementById('switchToSignup').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('signupSection');
    });
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('loginSection');
    });

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);
    document.getElementById('cancelEditBtn').addEventListener('click', () => showSection('homeSection'));
    document.getElementById('submitCommentBtn').addEventListener('click', handleCommentSubmit);
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'dashboardSection') {
        loadDashboard();
    }
}

function updateUI() {
    const isLoggedIn = currentUser !== null;
    
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'inline-flex';
    document.getElementById('signupBtn').style.display = isLoggedIn ? 'none' : 'inline-flex';
    document.getElementById('userMenu').style.display = isLoggedIn ? 'flex' : 'none';
    
    if (isLoggedIn) {
        document.getElementById('welcomeText').textContent = `Welcome, ${currentUser.name}!`;
        document.getElementById('commentForm').style.display = 'block';
    } else {
        document.getElementById('commentForm').style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    showLoading();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    setTimeout(() => {
        const user = storage.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            updateUI();
            showSection('homeSection');
            showToast('Login successful!');
            document.getElementById('loginForm').reset();
        } else {
            showToast('Invalid email or password', 'error');
        }
        hideLoading();
    }, 1000);
}

function handleSignup(e) {
    e.preventDefault();
    showLoading();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    setTimeout(() => {
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            hideLoading();
            return;
        }
        
        const existingUser = storage.users.find(u => u.email === email);
        if (existingUser) {
            showToast('User already exists with this email', 'error');
            hideLoading();
            return;
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            joinDate: new Date().toISOString()
        };
        
        storage.users.push(newUser);
        currentUser = newUser;
        updateUI();
        showSection('homeSection');
        showToast('Account created successfully!');
        document.getElementById('signupForm').reset();
        hideLoading();
    }, 1000);
}

function logout() {
    currentUser = null;
    updateUI();
    showSection('homeSection');
    showToast('Logged out successfully');
}

function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts available. Be the first to create one!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const isOwner = currentUser && currentUser.id === post.authorId;
    const postComments = comments.filter(c => c.postId === post.id);
    
    card.innerHTML = `
        <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span>${formatDate(post.timestamp)}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt || post.content.substring(0, 150) + '...'}</p>
        <div class="post-actions">
            <div>
                <small>By ${post.author} • ${postComments.length} comments</small>
            </div>
            <div>
                <button class="btn btn-primary" onclick="viewPost(${post.id})">
                    <i class="fas fa-eye"></i> Read More
                </button>
                ${isOwner ? `
                    <button class="btn btn-secondary" onclick="editPost(${post.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function showCreatePost() {
    editingPostId = null;
    document.getElementById('editorTitle').innerHTML = '<i class="fas fa-plus"></i> Create New Post';
    document.getElementById('postForm').reset();
    showSection('postEditorSection');
}

function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    editingPostId = id;
    document.getElementById('editorTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Post';
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postContent').value = post.content;
    showSection('postEditorSection');
}

function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(p => p.id !== id);
        storage.posts = posts;
        comments = comments.filter(c => c.postId !== id);
        storage.comments = comments;
        loadPosts();
        showToast('Post deleted successfully');
    }
}

function handlePostSubmit(e) {
    e.preventDefault();
    showLoading();
    
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    
    setTimeout(() => {
        if (editingPostId) {
            const postIndex = posts.findIndex(p => p.id === editingPostId);
            if (postIndex !== -1) {
                posts[postIndex] = {
                    ...posts[postIndex],
                    title,
                    category,
                    content,
                    excerpt: content.substring(0, 150) + '...'
                };
                showToast('Post updated successfully!');
            }
        } else {
            const newPost = {
                id: Date.now(),
                title,
                category,
                content,
                author: currentUser.name,
                authorId: currentUser.id,
                timestamp: new Date().toISOString(),
                excerpt: content.substring(0, 150) + '...'
            };
            posts.unshift(newPost);
            storage.posts = posts;
            showToast('Post created successfully!');
        }
        
        loadPosts();
        showSection('homeSection');
        hideLoading();
    }, 1000);
}

function viewPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    currentPostId = id;
    const container = document.getElementById('postDetailContent');
    
    container.innerHTML = `
        <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span>By ${post.author} on ${formatDate(post.timestamp)}</span>
        </div>
        <h1>${post.title}</h1>
        <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
    `;
    
    loadComments(id);
    showSection('postDetailSection');
}

function loadComments(postId) {
    const container = document.getElementById('commentsContainer');
    const postComments = comments.filter(c => c.postId === postId);
    
    if (postComments.length === 0) {
        container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    container.innerHTML = '';
    postComments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        container.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment';
    
    div.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${comment.author}</span>
            <span>${formatDate(comment.timestamp)}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
    `;
    
    return div;
}

function handleCommentSubmit() {
    const content = document.getElementById('commentText').value.trim();
    if (!content) {
        showToast('Please enter a comment', 'error');
        return;
    }
    
    const newComment = {
        id: Date.now(),
        postId: currentPostId,
        author: currentUser.name,
        authorId: currentUser.id,
        content,
        timestamp: new Date().toISOString()
    };
    
    comments.push(newComment);
    storage.comments = comments;
    document.getElementById('commentText').value = '';
    loadComments(currentPostId);
    showToast('Comment added successfully!');
}

function loadDashboard() {
    if (!currentUser) return;
    
    const userPosts = posts.filter(p => p.authorId === currentUser.id);
    const userComments = comments.filter(c => c.authorId === currentUser.id);
    
    document.getElementById('userPostCount').textContent = userPosts.length;
    document.getElementById('userCommentCount').textContent = userComments.length;
    
    const container = document.getElementById('userPostsContainer');
    container.innerHTML = '';
    
    if (userPosts.length === 0) {
        container.innerHTML = '<p>You haven\'t created any posts yet. <a href="#" onclick="showCreatePost()">Create your first post!</a></p>';
        return;
    }
    
    userPosts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

window.viewPost = viewPost;
window.editPost = editPost;
window.deletePost = deletePost;
window.showCreatePost = showCreatePost;