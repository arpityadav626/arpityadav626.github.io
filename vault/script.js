/* ======================================================================
   ARPIT VAULT — HEADLESS GOOGLE DRIVE DIRECT RELAY ENGINE
   Connected to Arpit_Dev_Vault &middot; Direct ID/Password Sync
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

    const VAULT_FOLDER_NAME = 'Arpit_Dev_Vault';
    const SECRETS_FILE_NAME = 'vault_secrets.enc';

    // INITIALIZE FIREBASE APP
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    const fbAuth = firebase.auth();
    // STRICT ZERO-RESIDUAL SECURITY: In-Memory Only persistence
    // Ensures refresh, tab close, or new session ALWAYS starts strictly locked!
    try {
        fbAuth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(() => {});
        fbAuth.signOut().catch(() => {});
    } catch (_) {}

    // SAFE STORAGE (In-memory safe across Incognito, private tabs, quota limits)
    const SafeStorage = {
        mem: {},
        getItem(key) {
            try {
                return (typeof window !== 'undefined' && window.sessionStorage) ? window.sessionStorage.getItem(key) : (this.mem[key] || null);
            } catch (e) {
                return this.mem[key] || null;
            }
        },
        setItem(key, val) {
            try {
                if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.setItem(key, val);
            } catch (e) {}
            this.mem[key] = val;
        },
        removeItem(key) {
            try {
                if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.removeItem(key);
            } catch (e) {}
            delete this.mem[key];
        }
    };

    // ZERO-LEAK INACTIVITY & BACKGROUND AUTO-LOCK MANAGER
    const AutoLockManager = {
        idleLimitSeconds: 180,       // 3 minutes idle auto-lock
        backgroundLimitSeconds: 60,  // 60 seconds background tab auto-lock
        secondsRemaining: 180,
        timerInterval: null,
        backgroundTimestamp: null,
        hasWarned: false,

        init() {
            const resetActivity = () => this.recordActivity();
            ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
                window.addEventListener(evt, resetActivity, { passive: true });
            });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.backgroundTimestamp = Date.now();
                } else {
                    if (this.backgroundTimestamp && currentUser) {
                        const secondsAway = Math.floor((Date.now() - this.backgroundTimestamp) / 1000);
                        if (secondsAway >= this.backgroundLimitSeconds) {
                            this.triggerLock(`Security Auto-Lock: Tab was inactive in background for ${secondsAway}s.`);
                            return;
                        }
                    }
                    this.backgroundTimestamp = null;
                }
            });

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && currentUser) {
                    this.triggerLock('Emergency Panic Lock engaged (ESC key).');
                }
            });
        },

        start() {
            this.stop();
            this.secondsRemaining = this.idleLimitSeconds;
            this.hasWarned = false;
            this.updateUI();

            this.timerInterval = setInterval(() => {
                if (!currentUser) {
                    this.stop();
                    return;
                }
                this.secondsRemaining--;
                this.updateUI();

                if (this.secondsRemaining === 30 && !this.hasWarned) {
                    this.hasWarned = true;
                    showToast('Inactivity Notice: Vault will lock in 30 seconds!', 'clock');
                }

                if (this.secondsRemaining <= 0) {
                    this.triggerLock('Vault automatically locked after 3 minutes of inactivity.');
                }
            }, 1000);
        },

        recordActivity() {
            if (!currentUser) return;
            this.secondsRemaining = this.idleLimitSeconds;
            if (this.hasWarned) {
                this.hasWarned = false;
            }
            this.updateUI();
        },

        updateUI() {
            const countdownEl = document.getElementById('idle-countdown');
            const pillEl = document.getElementById('idle-timer-pill');
            if (!countdownEl || !pillEl) return;

            if (currentUser) {
                pillEl.style.display = 'inline-flex';
                const mins = Math.floor(this.secondsRemaining / 60);
                const secs = this.secondsRemaining % 60;
                countdownEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                if (this.secondsRemaining <= 30) {
                    pillEl.style.color = '#FF3B30';
                    pillEl.style.borderColor = 'rgba(255,59,48,0.4)';
                } else {
                    pillEl.style.color = 'var(--text-muted)';
                    pillEl.style.borderColor = 'var(--border-subtle)';
                }
            } else {
                pillEl.style.display = 'none';
            }
        },

        triggerLock(reason = 'Vault locked automatically.') {
            this.stop();
            showToast(reason, 'shield-halved');
            logout(false);
        },

        stop() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            this.secondsRemaining = this.idleLimitSeconds;
            this.updateUI();
        }
    };

    // ==================================================================
    // ADMIN IDENTITY VERIFICATION & WHITELIST (STRICT SECURITY)
    // ==================================================================
    const AUTHORIZED_ADMIN_EMAILS = [
        'arpityadav6794@gmail.com'
    ];

    function isAuthorizedAdmin(email) {
        if (!email) return false;
        return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
    }

    // ==================================================================
    // GOOGLE DRIVE CLOUD RELAY (HEADLESS - ZERO GMAIL LOGIN POPUP)
    // ==================================================================
    const DRIVE_RELAY = {
        url: 'https://script.google.com/macros/s/AKfycbw8FH54QwdoLJMf-3yZbSz3KlRbkXFwi9zd-ZIjfqbOBTE4tqr2ygRG5yQjXd105peYeA/exec',
        secret: 'ArpitVault@2026',

        async listFiles() {
            const res = await fetch(`${this.url}?action=list&secret=${encodeURIComponent(this.secret)}`, {
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow'
            });
            return await res.json();
        },

        async downloadBlob(id) {
            const res = await fetch(`${this.url}?action=download_blob&id=${id}&secret=${encodeURIComponent(this.secret)}`, {
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow'
            });
            return await res.json();
        },

        async uploadFile(file, customName = null) {
            const fileName = customName || file.name;
            const mimeType = file.type || 'application/octet-stream';

            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result;
                    const b64 = result.split(',')[1];
                    resolve(b64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const payload = {
                action: 'upload',
                secret: this.secret,
                name: fileName,
                mimeType: mimeType,
                base64: base64
            };

            const res = await fetch(this.url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        },

        async deleteFile(id) {
            const payload = {
                action: 'delete',
                secret: this.secret,
                id: id
            };
            const res = await fetch(this.url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        },

        async saveNotes(content) {
            const payload = {
                action: 'save_notes',
                secret: this.secret,
                content: content
            };
            const res = await fetch(this.url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        }
    };

    // DIRECT BLOB DOWNLOAD (100% immune to Google accounts or Incognito cookie blocks)
    async function downloadFileDirect(id, name, mimeType) {
        showToast(`Preparing download: ${name}...`, 'cloud-arrow-down');
        try {
            const data = await DRIVE_RELAY.downloadBlob(id);
            if (data && data.base64) {
                const byteChars = atob(data.base64);
                const byteNumbers = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([byteNumbers], { type: data.mimeType || mimeType || 'application/octet-stream' });
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = data.name || name || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                showToast(`Downloaded ${name}!`, 'circle-check');
                return;
            }
        } catch (e) {
            console.warn('Direct blob fetch failed, falling back to public link:', e);
        }
        window.open(`https://drive.google.com/uc?id=${id}&export=download`, '_blank');
        showToast(`Download link triggered`, 'circle-check');
    }

    // ==================================================================
    // CLIENT-SIDE AES-GCM (PBKDF2 100k) ZERO-KNOWLEDGE CRYPTO ENGINE
    // ==================================================================
    const CryptoEngine = {
        async deriveKey(passphrase, salt) {
            const enc = new TextEncoder();
            const baseKey = await crypto.subtle.importKey(
                'raw',
                enc.encode(passphrase),
                'PBKDF2',
                false,
                ['deriveKey']
            );
            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                baseKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        },

        async encrypt(plainObj, passphrase) {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await this.deriveKey(passphrase, salt);
            const data = new TextEncoder().encode(JSON.stringify(plainObj));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            return JSON.stringify({
                salt: Array.from(salt),
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted)),
                v: 1
            });
        },

        async decrypt(packedString, passphrase) {
            const packed = JSON.parse(packedString);
            const salt = new Uint8Array(packed.salt);
            const iv = new Uint8Array(packed.iv);
            const encrypted = new Uint8Array(packed.data);
            const key = await this.deriveKey(passphrase, salt);
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            return JSON.parse(new TextDecoder().decode(decrypted));
        }
    };

    // APP STATE
    let currentUser = null;
    let allDriveFiles = [];
    let currentImages = [];
    let currentVideos = [];
    let currentDocs = [];
    let decryptedSecrets = [];
    let currentMasterPassphrase = null;
    let notesSaveTimeout = null;
    let isFetchingFiles = false;

    // DOM ELEMENTS (EXACT MATCH WITH VAULT/INDEX.HTML)
    const lockedSection = document.getElementById('locked-state');
    const unlockedDashboard = document.getElementById('unlocked-dashboard');
    const firebaseLoginForm = document.getElementById('firebase-login-form');
    const fbEmailInput = document.getElementById('fb-email');
    const fbPasswordInput = document.getElementById('fb-password');
    const fbSubmitBtn = document.getElementById('fb-submit-btn');
    const loginStatusMsg = document.getElementById('login-status-msg');
    const authHeaderBtnWrap = document.getElementById('auth-header-btn-wrap');
    const userName = document.getElementById('user-name');
    const authModePill = document.getElementById('auth-mode-pill');
    const vaultFolderStatus = document.getElementById('vault-folder-status');

    // UI Stats Counters
    const imagesCount = document.getElementById('images-count');
    const videosCount = document.getElementById('videos-count');
    const docsCount = document.getElementById('docs-count');
    const secretsCount = document.getElementById('secrets-count');

    // Grid Containers (MATCHING EXACT HTML IDs: images-grid, videos-grid, docs-grid)
    const imagesGrid = document.getElementById('images-grid');
    const videosGrid = document.getElementById('videos-grid');
    const documentsGrid = document.getElementById('docs-grid');

    // Search Inputs
    const imagesSearchInput = document.getElementById('images-search-input');
    const videosSearchInput = document.getElementById('videos-search-input');
    const docsSearchInput = document.getElementById('docs-search-input');

    // Upload Triggers
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const uploadDocBtn = document.getElementById('upload-doc-btn');
    const imageUploader = document.getElementById('image-uploader');
    const videoUploader = document.getElementById('video-uploader');
    const docUploader = document.getElementById('doc-uploader');
    const fileUploader = document.getElementById('file-uploader');

    // Upload Progress
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentText = document.getElementById('upload-percent-text');
    const uploadStatusText = document.getElementById('upload-status-text');

    // Navigation Tabs
    const tabButtons = document.querySelectorAll('.vtab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Preview Modal
    const previewModal = document.getElementById('preview-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalDownloadBtn = document.getElementById('modal-download-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const closePreviewModalBtn = document.getElementById('close-preview-modal-btn');

    // Notepad Tab
    const notesTextarea = document.getElementById('vault-notes-textarea');
    const notesSyncStatus = document.getElementById('notes-sync-status');
    const notesCharCount = document.getElementById('notes-char-count');
    const copyNotesBtn = document.getElementById('copy-notes-btn');
    const downloadNotesBtn = document.getElementById('download-notes-btn');
    const clearNotesBtn = document.getElementById('clear-notes-btn');

    // Secrets Tab
    const secretsUnlockCard = document.getElementById('secrets-unlock-card');
    const secretsManagerWrap = document.getElementById('secrets-manager-wrap');
    const masterPassphraseInput = document.getElementById('master-passphrase-input');
    const unlockSecretsBtn = document.getElementById('unlock-secrets-btn');
    const lockSecretsBtn = document.getElementById('lock-secrets-btn');
    const secretsList = document.getElementById('secrets-list');
    const secretsSearchInput = document.getElementById('secrets-search-input');
    const openNewSecretModalBtn = document.getElementById('open-new-secret-modal-btn');
    const newSecretModal = document.getElementById('new-secret-modal');
    const closeSecretModalBtn = document.getElementById('close-secret-modal-btn');
    const cancelSecretBtn = document.getElementById('cancel-secret-btn');
    const newSecretForm = document.getElementById('new-secret-form');
    const secPass = document.getElementById('sec-pass');
    const toggleSecPass = document.getElementById('toggle-sec-pass');

    // Toast Notification
    const toastEl = document.getElementById('vault-toast');

    function showToast(msg, icon = 'info') {
        if (!toastEl) return;
        toastEl.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 2500);
    }

    // ------------------------------------------------------------------
    // AUTHENTICATION FLOW (FIREBASE EMAIL & MASTER PASSWORD)
    // ------------------------------------------------------------------
    let isExplicitLogin = false;

    async function handleFirebaseLogin(e) {
        if (e && e.preventDefault) e.preventDefault();

        const email = (fbEmailInput.value || '').trim();
        const pass = fbPasswordInput.value || '';

        if (!email || !pass) {
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Please enter both Email and Master Password.';
            return;
        }

        fbSubmitBtn.disabled = true;
        fbSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Verifying credentials...';

        try {
            isExplicitLogin = true;
            await fbAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, pass);
            currentUser = userCredential.user;

            if (fbEmailInput) fbEmailInput.value = '';
            if (fbPasswordInput) fbPasswordInput.value = '';

            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Identity Verified! Loading Cloud Workspace...';
            await onVaultAuthenticated('Master ID/Password');
        } catch (err) {
            isExplicitLogin = false;
            console.error('Firebase Auth Error:', err);
            fbSubmitBtn.disabled = false;
            fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
            loginStatusMsg.className = 'status-msg error';

            let msg = 'Authentication failed: ' + (err.message || 'Invalid credentials');
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                msg = 'Incorrect Email or Master Password.';
            } else if (err.code === 'auth/too-many-requests') {
                msg = 'Too many failed login attempts. Please wait a moment.';
            }
            loginStatusMsg.textContent = msg;
        }
    }

    if (firebaseLoginForm) {
        firebaseLoginForm.addEventListener('submit', handleFirebaseLogin);
    }
    if (fbSubmitBtn) {
        fbSubmitBtn.addEventListener('click', handleFirebaseLogin);
    }
    if (fbEmailInput) {
        fbEmailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleFirebaseLogin(e);
        });
    }
    if (fbPasswordInput) {
        fbPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleFirebaseLogin(e);
        });
    }

    // AUTH STATE LISTENER: ZERO AUTO-LOGIN (Forces Locked State on Every Refresh/Load)
    fbAuth.onAuthStateChanged((user) => {
        if (!isExplicitLogin) {
            // Unsolicited auth state (from cache/refresh) - immediately purge and lock
            if (user) {
                fbAuth.signOut().catch(() => {});
            }
            currentUser = null;
            showLockedView();
            return;
        }

        if (user && !currentUser) {
            currentUser = user;
            onVaultAuthenticated('Master ID/Password');
        } else if (!user) {
            isExplicitLogin = false;
            showLockedView();
        }
    });

    // INSTANT PURGE ON TAB CLOSE OR REFRESH
    const purgeSessionState = () => {
        isExplicitLogin = false;
        currentUser = null;
        try { fbAuth.signOut().catch(() => {}); } catch (_) {}
        SafeStorage.removeItem('arpit_vault_drive_cache');
        SafeStorage.removeItem('arpit_vault_notepad_permanent');
        SafeStorage.removeItem('arpit_vault_secrets_enc');
    };

    window.addEventListener('beforeunload', purgeSessionState);
    window.addEventListener('pagehide', purgeSessionState);

    async function onVaultAuthenticated(modeName) {
        if (!currentUser || !isAuthorizedAdmin(currentUser.email)) {
            console.warn('Unauthorized identity rejected:', currentUser ? currentUser.email : 'null');
            await logout(true);
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Access Denied: Registered admin identity required.';
            showToast('Access Denied: Unauthorized Identity', 'shield-xmark');
            return;
        }

        showUnlockedView();
        AutoLockManager.start();
        if (modeName !== 'Active Session') {
            showToast(`Vault Unlocked via ${modeName}!`, 'shield-check');
        }

        if (currentUser && userName) {
            userName.textContent = currentUser.displayName || 'Arpit Yadav';
        }

        if (authModePill) {
            authModePill.innerHTML = `<i class="fas fa-cloud-check" style="color:#00C853;"></i> Live Cloud Synced`;
        }
        if (vaultFolderStatus) {
            vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
        }

        // 1. Instant Cache Load
        loadFromCache();
        // 2. Fresh Live Load from Google Drive Relay
        loadDriveFiles(false);
    }

    function showLockedView() {
        AutoLockManager.stop();
        lockedSection.style.display = 'flex';
        lockedSection.classList.add('active');
        unlockedDashboard.style.display = 'none';
        unlockedDashboard.classList.remove('active');
        authHeaderBtnWrap.innerHTML = '';
        loginStatusMsg.textContent = '';
    }

    function showUnlockedView() {
        lockedSection.style.display = 'none';
        lockedSection.classList.remove('active');
        unlockedDashboard.style.display = 'block';
        unlockedDashboard.classList.add('active');

        authHeaderBtnWrap.innerHTML = `
            <button class="action-btn outline-btn" id="logout-btn" title="Lock &amp; Sign Out">
                <i class="fas fa-arrow-right-from-bracket"></i> <span>Lock Vault</span>
            </button>
        `;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => logout(false));
    }

    async function logout(isSecurityPurge = false) {
        try {
            await fbAuth.signOut();
        } catch (_) {}

        isExplicitLogin = false;
        currentUser = null;
        decryptedSecrets = [];
        currentMasterPassphrase = null;
        allDriveFiles = [];
        AutoLockManager.stop();

        SafeStorage.removeItem('arpit_vault_drive_cache');
        SafeStorage.removeItem('arpit_vault_notepad_permanent');

        if (imagesGrid) imagesGrid.innerHTML = '';
        if (videosGrid) videosGrid.innerHTML = '';
        if (documentsGrid) documentsGrid.innerHTML = '';
        if (notesTextarea) notesTextarea.value = '';
        if (secretsList) secretsList.innerHTML = '';
        if (secretsManagerWrap) secretsManagerWrap.style.display = 'none';
        if (secretsUnlockCard) secretsUnlockCard.style.display = 'block';

        if (fbEmailInput) fbEmailInput.value = '';
        if (fbPasswordInput) fbPasswordInput.value = '';
        if (masterPassphraseInput) masterPassphraseInput.value = '';

        fbSubmitBtn.disabled = false;
        fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
        loginStatusMsg.textContent = '';

        showLockedView();
        showToast(isSecurityPurge ? 'Unauthorized attempt blocked: Session wiped' : 'Vault locked &amp; cache wiped', 'shield-halved');
    }

    // ------------------------------------------------------------------
    // FILE MANAGEMENT & GOOGLE DRIVE CLOUD SYNC
    // ------------------------------------------------------------------
    function categorizeFile(filename = '', mimeType = '') {
        const safeName = (filename || '').toLowerCase();
        const ext = (safeName.split('.').pop() || '').toLowerCase();
        const mime = (mimeType || '').toLowerCase();

        const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico', 'tiff', 'heic', 'avif'];
        const videoExts = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'm4v', '3gp', 'ogv'];

        if (imageExts.includes(ext) || mime.startsWith('image/')) return 'image';
        if (videoExts.includes(ext) || mime.startsWith('video/')) return 'video';
        return 'doc';
    }

    function partitionAndRenderFiles(files) {
        currentImages = files.filter(f => categorizeFile(f.name, f.mimeType) === 'image');
        currentVideos = files.filter(f => categorizeFile(f.name, f.mimeType) === 'video');
        currentDocs = files.filter(f => categorizeFile(f.name, f.mimeType) === 'doc');

        if (imagesCount) imagesCount.textContent = currentImages.length;
        if (videosCount) videosCount.textContent = currentVideos.length;
        if (docsCount) docsCount.textContent = currentDocs.length;

        renderImages(currentImages);
        renderVideos(currentVideos);
        renderDocs(currentDocs);
    }

    function loadFromCache() {
        try {
            const raw = SafeStorage.getItem('arpit_vault_drive_cache');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    allDriveFiles = parsed;
                    partitionAndRenderFiles(allDriveFiles);
                }
            }
        } catch (_) {}
    }

    async function loadDriveFiles(showToastNotice = false) {
        if (isFetchingFiles) return;
        isFetchingFiles = true;

        try {
            const data = await DRIVE_RELAY.listFiles();
            if (data && (data.success || Array.isArray(data.files) || data.files)) {
                const freshFiles = Array.isArray(data.files) ? data.files : [];
                allDriveFiles = freshFiles;
                SafeStorage.setItem('arpit_vault_drive_cache', JSON.stringify(freshFiles));
                partitionAndRenderFiles(freshFiles);

                if (data.notes && notesTextarea) {
                    const localNotes = SafeStorage.getItem('arpit_vault_notepad_permanent');
                    if (!notesTextarea.value || notesTextarea.value === localNotes) {
                        notesTextarea.value = data.notes;
                        SafeStorage.setItem('arpit_vault_notepad_permanent', data.notes);
                        updateNotepadStats();
                        if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-check-circle" style="color:#00C853;"></i> Synced with Google Drive';
                    }
                }

                if (showToastNotice) {
                    showToast(`Synced ${freshFiles.length} item(s) from Google Drive`, 'cloud-arrow-down');
                }
            } else if (data && data.error) {
                console.warn('Drive Relay Error:', data.error);
            }
        } catch (err) {
            console.warn('Sync error:', err);
        } finally {
            isFetchingFiles = false;
        }
    }

    // Auto-sync every 15 seconds & on tab focus
    setInterval(() => {
        if (currentUser && unlockedDashboard && unlockedDashboard.classList.contains('active')) {
            loadDriveFiles(false);
        }
    }, 15000);

    window.addEventListener('focus', () => {
        if (currentUser && unlockedDashboard && unlockedDashboard.classList.contains('active')) {
            loadDriveFiles(false);
        }
    });

    // Refresh Buttons Handler
    document.querySelectorAll('.refresh-files-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.querySelector('i')?.classList.add('fa-spin');
            showToast('Syncing with Google Drive...', 'rotate');
            loadDriveFiles(true).then(() => {
                setTimeout(() => btn.querySelector('i')?.classList.remove('fa-spin'), 600);
            });
        });
    });

    // ------------------------------------------------------------------
    // FILE UPLOAD (DIRECT CLOUD SYNC VIA GOOGLE APPS SCRIPT RELAY)
    // ------------------------------------------------------------------
    async function handleFileUpload(files) {
        if (!files || !files.length) return;

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';
        if (uploadStatusText) uploadStatusText.textContent = 'Uploading to Google Drive...';
        let uploadedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pct = Math.round(((i + 1) / files.length) * 100);
            if (uploadProgressBar) uploadProgressBar.style.width = `${pct}%`;
            if (uploadPercentText) uploadPercentText.textContent = `${pct}% (${i + 1}/${files.length})`;

            try {
                showToast(`Uploading "${file.name}" to Google Drive...`, 'cloud-arrow-up');
                const res = await DRIVE_RELAY.uploadFile(file);
                if (res && res.success) {
                    uploadedCount++;
                    allDriveFiles.unshift({
                        id: res.id,
                        name: res.name || file.name,
                        size: res.size || file.size,
                        mimeType: res.mimeType || file.type,
                        modifiedTime: new Date().toISOString(),
                        webViewLink: res.webViewLink || `https://drive.google.com/file/d/${res.id}/view`
                    });
                    partitionAndRenderFiles(allDriveFiles);
                } else {
                    showToast(`Upload error: ${res?.error || 'Failed'}`, 'triangle-exclamation');
                }
            } catch (err) {
                console.error('Upload failed for:', file.name, err);
                showToast(`Upload failed: ${err.message}`, 'triangle-exclamation');
            }
        }

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';

        if (uploadedCount > 0) {
            showToast(`Uploaded ${uploadedCount} file(s) to Google Drive!`, 'cloud-check');
            setTimeout(() => loadDriveFiles(false), 800);
        }
    }

    if (uploadImageBtn && imageUploader) {
        uploadImageBtn.addEventListener('click', () => imageUploader.click());
        imageUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    if (uploadVideoBtn && videoUploader) {
        uploadVideoBtn.addEventListener('click', () => videoUploader.click());
        videoUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    if (uploadDocBtn && docUploader) {
        uploadDocBtn.addEventListener('click', () => docUploader.click());
        docUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    // ------------------------------------------------------------------
    // RENDER FUNCTIONS (USING STYLE.CSS .file-card AND .media-card)
    // ------------------------------------------------------------------
    function renderImages(items) {
        if (!imagesGrid) return;
        if (!items || items.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>Images Storage</h3>
                    <p>No photos yet. Click "Upload Images" to save photos, PNGs, and artwork.</p>
                </div>
            `;
            return;
        }

        imagesGrid.innerHTML = items.map(img => {
            const viewUrl = img.webViewLink || `https://drive.google.com/file/d/${img.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${img.id}&export=download`;
            const cdnThumb = `https://lh3.googleusercontent.com/d/${img.id}`;

            return `
                <div class="file-card media-card" data-id="${img.id}">
                    <div class="media-preview-container">
                        <img src="${cdnThumb}" alt="${escapeHTML(img.name)}" class="media-thumb-img" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\"fas fa-image media-icon-placeholder image\\"></i>';">
                    </div>
                    <div class="file-details">
                        <div class="file-name" title="${escapeHTML(img.name)}">${escapeHTML(img.name)}</div>
                        <div class="file-meta">${formatBytes(img.size)} &middot; ${new Date(img.modifiedTime).toLocaleDateString()}</div>
                    </div>
                    <div class="file-card-bottom">
                        <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);"><i class="fab fa-google-drive" style="color:#00C853;"></i> Synced</span>
                        <div class="file-actions">
                            <button type="button" class="file-btn view-btn" data-id="${img.id}" data-name="${escapeHTML(img.name)}" data-url="${viewUrl}" title="Preview"><i class="fas fa-eye"></i></button>
                            <button type="button" class="file-btn download-btn" data-id="${img.id}" data-name="${escapeHTML(img.name)}" data-mime="${escapeHTML(img.mimeType || '')}" title="Direct Download"><i class="fas fa-arrow-down-to-line"></i></button>
                            <button type="button" class="file-btn del-btn" data-id="${img.id}" data-name="${escapeHTML(img.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachCardHandlers(imagesGrid);
    }

    function renderVideos(items) {
        if (!videosGrid) return;
        if (!items || items.length === 0) {
            videosGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>Videos Locker</h3>
                    <p>No recordings yet. Click "Upload Video" to store MP4 and clips.</p>
                </div>
            `;
            return;
        }

        videosGrid.innerHTML = items.map(vid => {
            const viewUrl = vid.webViewLink || `https://drive.google.com/file/d/${vid.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${vid.id}&export=download`;

            return `
                <div class="file-card media-card" data-id="${vid.id}">
                    <div class="media-preview-container">
                        <i class="fas fa-play-circle media-icon-placeholder video"></i>
                        <div class="play-overlay"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="file-details">
                        <div class="file-name" title="${escapeHTML(vid.name)}">${escapeHTML(vid.name)}</div>
                        <div class="file-meta">${formatBytes(vid.size)} &middot; ${new Date(vid.modifiedTime).toLocaleDateString()}</div>
                    </div>
                    <div class="file-card-bottom">
                        <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);"><i class="fab fa-google-drive" style="color:#00C853;"></i> Synced</span>
                        <div class="file-actions">
                            <a href="${viewUrl}" target="_blank" class="file-btn" title="Play Video in Drive"><i class="fas fa-play"></i></a>
                            <button type="button" class="file-btn download-btn" data-id="${vid.id}" data-name="${escapeHTML(vid.name)}" data-mime="${escapeHTML(vid.mimeType || '')}" title="Direct Download"><i class="fas fa-arrow-down-to-line"></i></button>
                            <button type="button" class="file-btn del-btn" data-id="${vid.id}" data-name="${escapeHTML(vid.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachCardHandlers(videosGrid);
    }

    function renderDocs(items) {
        if (!documentsGrid) return;
        if (!items || items.length === 0) {
            documentsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-lines"></i>
                    <h3>Documents Vault</h3>
                    <p>No documents yet. Store PDFs, Resumes, and Code here.</p>
                </div>
            `;
            return;
        }

        documentsGrid.innerHTML = items.map(doc => {
            const viewUrl = doc.webViewLink || `https://drive.google.com/file/d/${doc.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${doc.id}&export=download`;
            const isPdf = (doc.name || '').toLowerCase().endsWith('.pdf');

            return `
                <div class="file-card" data-id="${doc.id}">
                    <div class="file-card-top">
                        <div class="file-icon ${isPdf ? 'pdf' : 'doc'}">
                            <i class="${isPdf ? 'fas fa-file-pdf' : 'fas fa-file-lines'}"></i>
                        </div>
                        <div class="file-details">
                            <div class="file-name" title="${escapeHTML(doc.name)}">${escapeHTML(doc.name)}</div>
                            <div class="file-meta">${formatBytes(doc.size)} &middot; ${new Date(doc.modifiedTime).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="file-card-bottom">
                        <span style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted);"><i class="fab fa-google-drive" style="color:#00C853;"></i> Synced</span>
                        <div class="file-actions">
                            <button type="button" class="file-btn view-btn" data-id="${doc.id}" data-name="${escapeHTML(doc.name)}" data-url="${viewUrl}" title="Preview Document"><i class="fas fa-eye"></i></button>
                            <a href="${viewUrl}" target="_blank" class="file-btn" title="Open in Google Drive"><i class="fas fa-arrow-up-right-from-square"></i></a>
                            <button type="button" class="file-btn download-btn" data-id="${doc.id}" data-name="${escapeHTML(doc.name)}" data-mime="${escapeHTML(doc.mimeType || '')}" title="Direct Download"><i class="fas fa-arrow-down-to-line"></i></button>
                            <button type="button" class="file-btn del-btn" data-id="${doc.id}" data-name="${escapeHTML(doc.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachCardHandlers(documentsGrid);
    }

    function attachCardHandlers(container) {
        container.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const mime = btn.getAttribute('data-mime');
                downloadFileDirect(id, name, mime);
            });
        });

        container.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Delete "${name}" from your Google Drive?`)) {
                    btn.disabled = true;
                    showToast(`Deleting ${name}...`, 'trash');
                    try {
                        const res = await DRIVE_RELAY.deleteFile(id);
                        if (res && res.success) {
                            allDriveFiles = allDriveFiles.filter(f => f.id !== id);
                            SafeStorage.setItem('arpit_vault_drive_cache', JSON.stringify(allDriveFiles));
                            partitionAndRenderFiles(allDriveFiles);
                            showToast(`Moved "${name}" to Google Drive trash`, 'trash');
                        } else {
                            showToast('Delete error: ' + (res?.error || 'Failed'), 'triangle-exclamation');
                        }
                    } catch (err) {
                        showToast('Delete error: ' + err.message, 'triangle-exclamation');
                    }
                }
            });
        });

        container.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const url = btn.getAttribute('data-url');
                openPreviewModal(name, url, id);
            });
        });
    }

    function openPreviewModal(title, url, id) {
        if (!previewModal) return;
        if (modalTitle) modalTitle.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853; margin-right:6px;"></i> ${escapeHTML(title)}`;
        if (modalBody) {
            modalBody.innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`;
        }
        if (modalDownloadBtn) {
            modalDownloadBtn.href = `https://drive.google.com/uc?id=${id}&export=download`;
            modalDownloadBtn.download = title;
            modalDownloadBtn.onclick = (e) => {
                e.preventDefault();
                downloadFileDirect(id, title);
            };
        }
        previewModal.style.display = 'flex';
        previewModal.setAttribute('aria-hidden', 'false');
    }

    function closePreview() {
        if (!previewModal) return;
        previewModal.style.display = 'none';
        previewModal.setAttribute('aria-hidden', 'true');
        if (modalBody) modalBody.innerHTML = '';
    }

    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreview);
    if (closePreviewModalBtn) closePreviewModalBtn.addEventListener('click', closePreview);

    // Live Search Handlers
    if (imagesSearchInput) {
        imagesSearchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            const filtered = q ? currentImages.filter(f => f.name.toLowerCase().includes(q)) : currentImages;
            renderImages(filtered);
        });
    }

    if (videosSearchInput) {
        videosSearchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            const filtered = q ? currentVideos.filter(f => f.name.toLowerCase().includes(q)) : currentVideos;
            renderVideos(filtered);
        });
    }

    if (docsSearchInput) {
        docsSearchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            const filtered = q ? currentDocs.filter(f => f.name.toLowerCase().includes(q)) : currentDocs;
            renderDocs(filtered);
        });
    }

    // ------------------------------------------------------------------
    // NOTEPAD ENGINE (AUTO-SYNC TO CLOUD)
    // ------------------------------------------------------------------
    function updateNotepadStats() {
        if (!notesTextarea) return;
        const val = notesTextarea.value || '';
        if (notesCharCount) notesCharCount.textContent = val.length;
    }

    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => {
            updateNotepadStats();
            if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            clearTimeout(notesSaveTimeout);
            notesSaveTimeout = setTimeout(saveCloudNotes, 1200);
        });
    }

    async function saveCloudNotes() {
        if (!notesTextarea) return;
        const content = notesTextarea.value;
        SafeStorage.setItem('arpit_vault_notepad_permanent', content);

        try {
            const res = await DRIVE_RELAY.saveNotes(content);
            if (res && res.success) {
                if (notesSyncStatus) notesSyncStatus.innerHTML = `<i class="fas fa-check-circle" style="color:#00C853;"></i> Synced with Google Drive (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
            } else {
                if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-circle-exclamation"></i> Save failed';
            }
        } catch (e) {
            if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Network error';
        }
    }

    if (copyNotesBtn && notesTextarea) {
        copyNotesBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(notesTextarea.value).then(() => {
                showToast('Notepad content copied!', 'copy');
            });
        });
    }

    if (downloadNotesBtn && notesTextarea) {
        downloadNotesBtn.addEventListener('click', () => {
            const blob = new Blob([notesTextarea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arpit_vault_notes_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Saved notes to .txt file', 'download');
        });
    }

    if (clearNotesBtn && notesTextarea) {
        clearNotesBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your notepad?')) {
                notesTextarea.value = '';
                SafeStorage.removeItem('arpit_vault_notepad_permanent');
                updateNotepadStats();
                saveCloudNotes();
                showToast('Notepad cleared', 'trash');
            }
        });
    }

    // Tab Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(target);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // ------------------------------------------------------------------
    // SECRETS TAB (CLIENT-SIDE AES-GCM ZERO KNOWLEDGE)
    // ------------------------------------------------------------------
    function renderSecrets(items) {
        if (!secretsList) return;
        const list = items || decryptedSecrets || [];
        if (secretsCount) secretsCount.textContent = list.length;
        if (list.length === 0) {
            secretsList.innerHTML = '<div class="empty-state" style="padding:28px 16px;"><i class="fas fa-key"></i><h3>No Stored Credentials</h3><p>Click "Store New Credential" to save passwords, API keys, or tokens encrypted with AES-GCM.</p></div>';
            return;
        }

        secretsList.innerHTML = list.map((sec, idx) => {
            const catBadge = (sec.cat || 'other').toUpperCase();
            return `
                <div class="secret-item" data-idx="${idx}">
                    <div class="secret-info">
                        <span class="secret-badge">${escapeHTML(catBadge)}</span>
                        <div class="secret-meta">
                            <h4>${escapeHTML(sec.title)}</h4>
                            <span>${escapeHTML(sec.user || 'No username')}</span>
                            ${sec.notes ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${escapeHTML(sec.notes)}</div>` : ''}
                        </div>
                    </div>
                    <div class="secret-actions">
                        <span class="secret-val-display" id="sec-val-${idx}">••••••••</span>
                        <button type="button" class="copy-btn sec-reveal-btn" data-idx="${idx}" title="Reveal / Hide"><i class="fas fa-eye"></i></button>
                        <button type="button" class="copy-btn sec-copy-btn" data-idx="${idx}" title="Copy Secret"><i class="fas fa-copy"></i> Copy</button>
                        <button type="button" class="copy-btn sec-delete-btn" data-idx="${idx}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        secretsList.querySelectorAll('.sec-reveal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const display = document.getElementById(`sec-val-${idx}`);
                const item = decryptedSecrets[idx];
                if (!display || !item) return;
                if (display.textContent === '••••••••') {
                    display.textContent = item.pass;
                    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    display.textContent = '••••••••';
                    btn.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });

        secretsList.querySelectorAll('.sec-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const item = decryptedSecrets[idx];
                if (!item || !item.pass) return;
                navigator.clipboard.writeText(item.pass).then(() => {
                    showToast('Secret copied to clipboard!', 'copy');
                });
            });
        });

        secretsList.querySelectorAll('.sec-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const item = decryptedSecrets[idx];
                if (!item) return;
                if (confirm(`Delete credential "${item.title}"?`)) {
                    decryptedSecrets.splice(idx, 1);
                    await saveAndSyncSecrets();
                    renderSecrets(decryptedSecrets);
                    showToast('Credential removed', 'trash');
                }
            });
        });
    }

    async function saveAndSyncSecrets() {
        if (!currentMasterPassphrase) return;
        try {
            const encryptedStr = await CryptoEngine.encrypt(decryptedSecrets, currentMasterPassphrase);
            SafeStorage.setItem('arpit_vault_secrets_enc', encryptedStr);
            const blob = new Blob([encryptedStr], { type: 'application/json' });
            await DRIVE_RELAY.uploadFile(blob, SECRETS_FILE_NAME);
        } catch (err) {
            console.error('Error encrypting and syncing secrets:', err);
        }
    }

    if (unlockSecretsBtn && masterPassphraseInput) {
        unlockSecretsBtn.addEventListener('click', async () => {
            const passphrase = (masterPassphraseInput.value || '').trim();
            if (!passphrase) {
                showToast('Please enter your Master Passphrase', 'key');
                return;
            }

            unlockSecretsBtn.disabled = true;
            unlockSecretsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';

            try {
                let encryptedPayload = SafeStorage.getItem('arpit_vault_secrets_enc');

                if (encryptedPayload) {
                    const decrypted = await CryptoEngine.decrypt(encryptedPayload, passphrase);
                    decryptedSecrets = Array.isArray(decrypted) ? decrypted : [];
                } else {
                    decryptedSecrets = [];
                }

                currentMasterPassphrase = passphrase;
                masterPassphraseInput.value = '';
                secretsUnlockCard.style.display = 'none';
                secretsManagerWrap.style.display = 'block';
                renderSecrets(decryptedSecrets);
                showToast('Secrets Decrypted Successfully!', 'lock-open');
            } catch (err) {
                console.error('Decryption failed:', err);
                showToast('Incorrect Master Passphrase', 'triangle-exclamation');
            } finally {
                unlockSecretsBtn.disabled = false;
                unlockSecretsBtn.innerHTML = '<i class="fas fa-lock-open"></i> Decrypt Credentials';
            }
        });

        masterPassphraseInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') unlockSecretsBtn.click();
        });
    }

    if (lockSecretsBtn) {
        lockSecretsBtn.addEventListener('click', () => {
            currentMasterPassphrase = null;
            decryptedSecrets = [];
            if (secretsList) secretsList.innerHTML = '';
            if (secretsCount) secretsCount.textContent = '0';
            secretsManagerWrap.style.display = 'none';
            secretsUnlockCard.style.display = 'block';
            showToast('Credentials locked from memory', 'shield-halved');
        });
    }

    if (secretsSearchInput) {
        secretsSearchInput.addEventListener('input', (e) => {
            const query = (e.target.value || '').toLowerCase().trim();
            if (!query) {
                renderSecrets(decryptedSecrets);
                return;
            }
            const filtered = decryptedSecrets.filter(s => 
                (s.title && s.title.toLowerCase().includes(query)) ||
                (s.user && s.user.toLowerCase().includes(query)) ||
                (s.notes && s.notes.toLowerCase().includes(query)) ||
                (s.cat && s.cat.toLowerCase().includes(query))
            );
            renderSecrets(filtered);
        });
    }

    if (openNewSecretModalBtn && newSecretModal) {
        openNewSecretModalBtn.addEventListener('click', () => {
            newSecretModal.style.display = 'flex';
            newSecretModal.setAttribute('aria-hidden', 'false');
            const titleInput = document.getElementById('sec-title');
            if (titleInput) titleInput.focus();
        });
    }

    function closeSecretModal() {
        if (!newSecretModal) return;
        newSecretModal.style.display = 'none';
        newSecretModal.setAttribute('aria-hidden', 'true');
        if (newSecretForm) newSecretForm.reset();
        if (secPass) secPass.type = 'password';
    }

    if (closeSecretModalBtn) closeSecretModalBtn.addEventListener('click', closeSecretModal);
    if (cancelSecretBtn) cancelSecretBtn.addEventListener('click', closeSecretModal);

    if (toggleSecPass && secPass) {
        toggleSecPass.addEventListener('click', () => {
            const isPassword = secPass.type === 'password';
            secPass.type = isPassword ? 'text' : 'password';
            toggleSecPass.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    if (newSecretForm) {
        newSecretForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = (document.getElementById('sec-title').value || '').trim();
            const user = (document.getElementById('sec-user').value || '').trim();
            const pass = (document.getElementById('sec-pass').value || '').trim();
            const cat = (document.getElementById('sec-cat').value || 'other').trim();
            const notes = (document.getElementById('sec-notes').value || '').trim();

            if (!title || !pass) {
                showToast('Title and Secret are required', 'triangle-exclamation');
                return;
            }

            decryptedSecrets.push({
                title,
                user,
                pass,
                cat,
                notes,
                date: new Date().toISOString()
            });

            await saveAndSyncSecrets();
            renderSecrets(decryptedSecrets);
            closeSecretModal();
            showToast('Credential Encrypted &amp; Saved!', 'shield-check');
        });
    }

    function formatBytes(bytes, decimals = 1) {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    // Initialize Auto-Lock Inactivity Listeners
    AutoLockManager.init();

})();
