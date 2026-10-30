/* ======================================================================
   ARPIT VAULT — DEDICATED AUTHENTICATION GATEWAY
   ====================================================================== */

(function () {
    'use strict';

    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyAMMoUSW6BUvpNf0m9d8eHd3yT3MtNoV1w",
        authDomain: "arpit-portfolio-2026.firebaseapp.com",
        projectId: "arpit-portfolio-2026",
        storageBucket: "arpit-portfolio-2026.firebasestorage.app",
        messagingSenderId: "126845421146",
        appId: "1:126845421146:web:20c4cd6a1e1ea0adaf3a63"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    const fbAuth = firebase.auth();

    // DOM Elements
    const tabBtnFirebase = document.getElementById('tab-btn-firebase');
    const tabBtnDrive = document.getElementById('tab-btn-drive');
    const authBoxFirebase = document.getElementById('auth-box-firebase');
    const authBoxDrive = document.getElementById('auth-box-drive');
    const firebaseLoginForm = document.getElementById('firebase-login-form');
    const fbEmailInput = document.getElementById('fb-email');
    const toggleFbEmail = document.getElementById('toggle-fb-email');
    const fbPasswordInput = document.getElementById('fb-password');
    const toggleFbPass = document.getElementById('toggle-fb-pass');
    const fbSubmitBtn = document.getElementById('fb-submit-btn');
    const firebaseGoogleAuthBtn = document.getElementById('firebase-google-auth-btn');
    const loginStatusMsg = document.getElementById('login-status-msg');
    const toastEl = document.getElementById('vault-toast');

    function showToast(msg, icon = 'info') {
        if (!toastEl) return;
        toastEl.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 2500);
    }

    // Tab Switcher
    if (tabBtnFirebase && tabBtnDrive) {
        tabBtnFirebase.addEventListener('click', () => {
            tabBtnFirebase.classList.add('active');
            tabBtnDrive.classList.remove('active');
            authBoxFirebase.classList.add('active');
            authBoxDrive.classList.remove('active');
            if (loginStatusMsg) loginStatusMsg.textContent = '';
        });

        tabBtnDrive.addEventListener('click', () => {
            tabBtnDrive.classList.add('active');
            tabBtnFirebase.classList.remove('active');
            authBoxDrive.classList.add('active');
            authBoxFirebase.classList.remove('active');
            if (loginStatusMsg) loginStatusMsg.textContent = '';
        });
    }

    // Password Visibility Toggles
    if (toggleFbEmail && fbEmailInput) {
        toggleFbEmail.addEventListener('click', () => {
            const isPassword = fbEmailInput.type === 'password';
            fbEmailInput.type = isPassword ? 'text' : 'password';
            toggleFbEmail.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    if (toggleFbPass && fbPasswordInput) {
        toggleFbPass.addEventListener('click', () => {
            const isPassword = fbPasswordInput.type === 'password';
            fbPasswordInput.type = isPassword ? 'text' : 'password';
            toggleFbPass.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    // Auto-redirect if already signed in
    fbAuth.onAuthStateChanged((user) => {
        if (user) {
            window.location.replace('index.html');
        }
    });

    // Handle Mobile OAuth Redirect Result
    fbAuth.getRedirectResult().then((result) => {
        if (result && result.credential && result.credential.accessToken) {
            localStorage.setItem('arpit_drive_access_token', result.credential.accessToken);
            localStorage.setItem('arpit_drive_access_token_exp', Date.now() + (3600 * 1000));
        }
        if (result && result.user) {
            window.location.replace('index.html');
        }
    }).catch(err => {
        console.error('Redirect sign-in error:', err);
    });

    // 1. Firebase Email & Password Form Submit
    if (firebaseLoginForm) {
        firebaseLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = (fbEmailInput?.value || '').trim();
            const pass = (fbPasswordInput?.value || '').trim();

            if (!email || !pass) {
                if (loginStatusMsg) {
                    loginStatusMsg.className = 'status-msg error';
                    loginStatusMsg.textContent = 'Please enter admin identifier and master password.';
                }
                return;
            }

            if (fbSubmitBtn) {
                fbSubmitBtn.disabled = true;
                fbSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            }
            if (loginStatusMsg) {
                loginStatusMsg.className = 'status-msg info';
                loginStatusMsg.textContent = 'Verifying administrative credentials...';
            }

            try {
                await fbAuth.signInWithEmailAndPassword(email, pass);
                if (loginStatusMsg) {
                    loginStatusMsg.className = 'status-msg success';
                    loginStatusMsg.textContent = 'Access granted! Opening workspace...';
                }
                window.location.replace('index.html');
            } catch (err) {
                console.error('Auth error:', err);
                if (fbSubmitBtn) {
                    fbSubmitBtn.disabled = false;
                    fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
                }
                if (loginStatusMsg) {
                    loginStatusMsg.className = 'status-msg error';
                    loginStatusMsg.textContent = err.message || 'Authentication failed. Check credentials.';
                }
            }
        });
    }

    // 2. Google Direct OAuth Sign-In
    if (firebaseGoogleAuthBtn) {
        firebaseGoogleAuthBtn.addEventListener('click', async () => {
            if (loginStatusMsg) {
                loginStatusMsg.className = 'status-msg info';
                loginStatusMsg.textContent = 'Opening Google Sign-In with Drive permissions...';
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/drive.file');
            provider.setCustomParameters({
                prompt: 'consent',
                access_type: 'offline'
            });

            try {
                const result = await fbAuth.signInWithPopup(provider);
                if (result.credential && result.credential.accessToken) {
                    localStorage.setItem('arpit_drive_access_token', result.credential.accessToken);
                    localStorage.setItem('arpit_drive_access_token_exp', Date.now() + (3600 * 1000));
                }
                if (loginStatusMsg) {
                    loginStatusMsg.className = 'status-msg success';
                    loginStatusMsg.textContent = 'Authenticated! Opening workspace...';
                }
                window.location.replace('index.html');
            } catch (err) {
                console.error('Google Auth Error:', err);
                if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
                    if (loginStatusMsg) {
                        loginStatusMsg.className = 'status-msg info';
                        loginStatusMsg.textContent = 'Redirecting to Google sign-in window...';
                    }
                    await fbAuth.signInWithRedirect(provider);
                    return;
                }
                if (loginStatusMsg) {
                    loginStatusMsg.className = 'status-msg error';
                    loginStatusMsg.textContent = 'Sign-in cancelled or failed: ' + (err.message || 'Access denied');
                }
            }
        });
    }
})();
