const socialConfig = {
    google: {
        clientId: '123456789-example.apps.googleusercontent.com', // Replace with your Google Client ID
        scope: 'email profile'
    },
    microsoft: {
        clientId: '12345678-1234-1234-1234-123456789012', // Replace with your Microsoft Client ID
        authority: 'https://login.microsoftonline.com/common'
    },
    facebook: {
        appId: '123456789012345', // Replace with your Facebook App ID
        version: 'v12.0'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const welcomeText = document.getElementById('welcomeText');
    const moralText = document.getElementById('moralText');
    const introOverlay = document.getElementById('introOverlay');
    const authContainer = document.getElementById('authContainer');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const profileModal = document.getElementById('profileModal');
    const profilePreview = document.getElementById('profilePreview');
    const profileInput = document.getElementById('profileInput');
    const skipProfileBtn = document.getElementById('skipProfile');
    const saveProfileBtn = document.getElementById('saveProfile');

    // User data storage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Function to create typing animation
    function typeText(element, text, speed = 100) {
        element.style.opacity = '1';
        let index = 0;
        
        return new Promise(resolve => {
            const interval = setInterval(() => {
                element.textContent = text.substring(0, index);
                index++;
                
                if (index > text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    }

    // Function to fade out element
    function fadeOut(element, duration = 1000) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    // Show auth container
    function showAuthContainer() {
        authContainer.style.opacity = '0';
        authContainer.style.display = 'flex';
        setTimeout(() => {
            authContainer.style.transition = 'opacity 1s ease-in';
            authContainer.style.opacity = '1';
        }, 100);
    }

    // Animation sequence
    async function startIntroSequence() {
        welcomeText.textContent = '';
        moralText.textContent = '';
        
        await typeText(welcomeText, 'WELCOME', 150);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(welcomeText);
        await typeText(moralText, 'We are forging...', 100);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(introOverlay);
        
        introOverlay.style.display = 'none';
        showAuthContainer();
    }

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.querySelector(`#${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    // Handle sign up
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            profilePicture: null
        };

        // Check if user already exists
        if (users.some(user => user.email === userData.email)) {
            alert('Email already registered');
            return;
        }

        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Show profile picture modal
        profileModal.style.display = 'flex';
    });

    // Handle sign in
    document.getElementById('signinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    });

    // Profile picture handling
    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreview.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
                currentUser.profilePicture = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    skipProfileBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    saveProfileBtn.addEventListener('click', () => {
        // Update user in users array
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        window.location.href = 'index.html';
    });

    // Social Login Configuration
    const socialConfig = {
        google: {
            clientId: '123456789-example.apps.googleusercontent.com', // Replace with your Google Client ID
            scope: 'email profile'
        },
        microsoft: {
            clientId: '12345678-1234-1234-1234-123456789012', // Replace with your Microsoft Client ID
            authority: 'https://login.microsoftonline.com/common'
        },
        facebook: {
            appId: '123456789012345', // Replace with your Facebook App ID
            version: 'v12.0'
        }
    };

    // Initialize social login handlers
    if (typeof google !== 'undefined' && google.accounts) {
        const googleClient = google.accounts.oauth2.initTokenClient({
            client_id: socialConfig.google.clientId,
            scope: socialConfig.google.scope,
            callback: handleGoogleResponse
        });

        document.getElementById('googleLogin')?.addEventListener('click', () => {
            googleClient.requestAccessToken();
        });
    }

    if (typeof msal !== 'undefined') {
        const msalInstance = new msal.PublicClientApplication({
            auth: {
                clientId: socialConfig.microsoft.clientId,
                authority: socialConfig.microsoft.authority
            }
        });

        document.getElementById('microsoftLogin')?.addEventListener('click', async () => {
            try {
                const response = await msalInstance.loginPopup({
                    scopes: ["user.read"]
                });
                handleMicrosoftResponse(response);
            } catch (error) {
                console.error('Microsoft login error:', error);
            }
        });
    }

    if (typeof FB !== 'undefined') {
        FB.init({
            appId: socialConfig.facebook.appId,
            cookie: true,
            xfbml: true,
            version: socialConfig.facebook.version
        });

        document.getElementById('facebookLogin')?.addEventListener('click', () => {
            FB.login(handleFacebookResponse, {scope: 'public_profile,email'});
        });
    }

    // Social login response handlers
    async function handleGoogleResponse(response) {
        try {
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
            }).then(res => res.json());

            const userData = {
                name: userInfo.name,
                email: userInfo.email,
                profilePicture: userInfo.picture,
                provider: 'google'
            };

            handleSocialLogin(userData);
        } catch (error) {
            console.error('Google user info error:', error);
            alert('Failed to get Google user info. Please try again.');
        }
    }

    function handleMicrosoftResponse(response) {
        const graphConfig = {
            graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
        };

        fetch(graphConfig.graphMeEndpoint, {
            headers: {
                Authorization: `Bearer ${response.accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const userData = {
                name: data.displayName,
                email: data.userPrincipalName,
                profilePicture: null,
                provider: 'microsoft'
            };
            handleSocialLogin(userData);
        })
        .catch(error => {
            console.error('Microsoft Graph API error:', error);
            alert('Failed to get Microsoft user info. Please try again.');
        });
    }

    function handleFacebookResponse(response) {
        if (response.status === 'connected') {
            FB.api('/me', {fields: 'name,email,picture'}, function(data) {
                const userData = {
                    name: data.name,
                    email: data.email,
                    profilePicture: data.picture?.data?.url,
                    provider: 'facebook'
                };
                handleSocialLogin(userData);
            });
        } else {
            console.error('Facebook login failed:', response);
            alert('Facebook login failed. Please try again.');
        }
    }

    function handleSocialLogin(userData) {
        if (!userData.email) {
            alert('Could not get email from social login. Please try again or use email signup.');
            return;
        }

        // Save user data
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let existingUser = users.find(u => u.email === userData.email);
        
        if (!existingUser) {
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
        }

        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = 'index.html';
    }

    // Start the sequence
    startIntroSequence();
});document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const welcomeText = document.getElementById('welcomeText');
    const moralText = document.getElementById('moralText');
    const introOverlay = document.getElementById('introOverlay');
    const authContainer = document.getElementById('authContainer');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const profileModal = document.getElementById('profileModal');
    const profilePreview = document.getElementById('profilePreview');
    const profileInput = document.getElementById('profileInput');
    const skipProfileBtn = document.getElementById('skipProfile');
    const saveProfileBtn = document.getElementById('saveProfile');
    const googleLogin = document.getElementById('googleLogin');
    const microsoftLogin = document.getElementById('microsoftLogin');
    const facebookLogin = document.getElementById('facebookLogin');

    // User data storage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Function to create typing animation
    function typeText(element, text, speed = 100) {
        element.style.opacity = '1';
        let index = 0;
        
        return new Promise(resolve => {
            const interval = setInterval(() => {
                element.textContent = text.substring(0, index);
                index++;
                
                if (index > text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });
    }

    // Function to fade out element
    function fadeOut(element, duration = 1000) {
        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    // Show auth container
    function showAuthContainer() {
        authContainer.style.opacity = '0';
        authContainer.style.display = 'flex';
        setTimeout(() => {
            authContainer.style.transition = 'opacity 1s ease-in';
            authContainer.style.opacity = '1';
        }, 100);
    }

    // Animation sequence
    async function startIntroSequence() {
        welcomeText.textContent = '';
        moralText.textContent = '';
        
        await typeText(welcomeText, 'WELCOME', 150);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(welcomeText);
        await typeText(moralText, 'We are forging...', 100);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fadeOut(introOverlay);
        
        introOverlay.style.display = 'none';
        showAuthContainer();
    }

    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            document.querySelector(`#${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    // Handle sign up
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            profilePicture: null
        };

        // Check if user already exists
        if (users.some(user => user.email === userData.email)) {
            alert('Email already registered');
            return;
        }

        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Show profile picture modal
        profileModal.style.display = 'flex';
    });

    // Handle sign in
    document.getElementById('signinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    });

    // Profile picture handling
    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreview.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
                currentUser.profilePicture = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    skipProfileBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    saveProfileBtn.addEventListener('click', () => {
        // Update user in users array
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        window.location.href = 'index.html';
    });

    // Initialize social login SDKs
    // Google
    const googleClient = google.accounts.oauth2.initTokenClient({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        scope: 'email profile',
        callback: handleGoogleResponse
    });

    // Microsoft
    const msalConfig = {
        auth: {
            clientId: "YOUR_MICROSOFT_CLIENT_ID",
            authority: "https://login.microsoftonline.com/common"
        }
    };
    const msalInstance = new msal.PublicClientApplication(msalConfig);

    // Facebook
    FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        cookie: true,
        xfbml: true,
        version: 'v12.0'
    });

    // Social login button handlers
    googleLogin.addEventListener('click', () => {
        googleClient.requestAccessToken();
    });

    microsoftLogin.addEventListener('click', async () => {
        try {
            const response = await msalInstance.loginPopup({
                scopes: ["user.read"]
            });
            handleMicrosoftResponse(response);
        } catch (error) {
            console.error('Microsoft login error:', error);
        }
    });

    facebookLogin.addEventListener('click', () => {
        FB.login(handleFacebookResponse, {scope: 'public_profile,email'});
    });

    // Social login response handlers
    async function handleGoogleResponse(response) {
        try {
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
            }).then(res => res.json());

            const userData = {
                name: userInfo.name,
                email: userInfo.email,
                profilePicture: userInfo.picture,
                provider: 'google'
            };

            handleSocialLogin(userData);
        } catch (error) {
            console.error('Google user info error:', error);
        }
    }

    function handleMicrosoftResponse(response) {
        const graphConfig = {
            graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
        };

        fetch(graphConfig.graphMeEndpoint, {
            headers: {
                Authorization: `Bearer ${response.accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const userData = {
                name: data.displayName,
                email: data.userPrincipalName,
                profilePicture: null, // Microsoft Graph API requires additional permissions for photo
                provider: 'microsoft'
            };
            handleSocialLogin(userData);
        })
        .catch(error => console.error('Microsoft Graph API error:', error));
    }

    function handleFacebookResponse(response) {
        if (response.status === 'connected') {
            FB.api('/me', {fields: 'name,email,picture'}, function(data) {
                const userData = {
                    name: data.name,
                    email: data.email,
                    profilePicture: data.picture?.data?.url,
                    provider: 'facebook'
                };
                handleSocialLogin(userData);
            });
        }
    }

    function handleSocialLogin(userData) {
        // Save user data
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let existingUser = users.find(u => u.email === userData.email);
        
        if (!existingUser) {
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
        }

        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = 'index.html';
    }

    // Start the sequence
    startIntroSequence();
});
