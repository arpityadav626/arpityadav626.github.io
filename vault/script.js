/* ======================================================================
   ARPIT VAULT — HEADLESS GOOGLE DRIVE DIRECT RELAY ENGINE
   Zero Gmail Popups &middot; Master ID/Password Direct Cloud Sync
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
        url: 'https://script.google.com/macros/s/AKfycbz4xJVbny6Lv6u__Z9U60HcslR24-DJR8wjacinVFhTXJM2nE_mxmdSZSfw4MROk0s/exec',
        secret: 'ArpitVault@2026',

        async listFiles() {
            const res = await fetch(`${this.url}?action=list&secret=${encodeURIComponent(this.secret)}`);
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
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        }
    };

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

    // ==================================================================
    // INDEXEDDB VAULT ENGINE (Fast Local Cache with Instant 0ms Access)
    // ==================================================================
    const VaultDB = {
        db: null,
        async init() {
            if (this.db) return this.db;
            return new Promise((resolve) => {
                const req = indexedDB.open('ArpitVaultStore', 2);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('vault_files')) {
                        db.createObjectStore('vault_files', { keyPath: 'id' });
                    }
                };
                req.onsuccess = (e) => {
                    this.db = e.target.result;
                    resolve(this.db);
                };
                req.onerror = () => resolve(null);
            });
        },
        async getAllFiles() {
            const db = await this.init();
            if (!db) return [];
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction('vault_files', 'readonly');
                    const store = tx.objectStore('vault_files');
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                } catch (_) {
                    resolve([]);
                }
            });
        },
        async saveFile(record) {
            const db = await this.init();
            if (!db) return false;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction('vault_files', 'readwrite');
                    const store = tx.objectStore('vault_files');
                    store.put(record);
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (_) {
                    resolve(false);
                }
            });
        },
        async deleteFile(id) {
            const db = await this.init();
            if (!db) return false;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction('vault_files', 'readwrite');
                    const store = tx.objectStore('vault_files');
                    store.delete(id);
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (_) {
                    resolve(false);
                }
            });
        },
        async clearAll() {
            const db = await this.init();
            if (!db) return false;
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction('vault_files', 'readwrite');
                    const store = tx.objectStore('vault_files');
                    store.clear();
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (_) {
                    resolve(false);
                }
            });
        }
    };

    // APP STATE
    let currentUser = null;
    let allDriveFiles = [];
    let decryptedSecrets = [];
    let currentMasterPassphrase = null;
    let notesSaveTimeout = null;

    // DOM ELEMENTS
    const lockedSection = document.getElementById('locked-state');
    const unlockedDashboard = document.getElementById('unlocked-dashboard');
    const firebaseLoginForm = document.getElementById('firebase-login-form');
    const fbEmailInput = document.getElementById('fb-email');
    const toggleFbEmail = document.getElementById('toggle-fb-email');
    const fbPasswordInput = document.getElementById('fb-password');
    const toggleFbPass = document.getElementById('toggle-fb-pass');
    const fbSubmitBtn = document.getElementById('fb-submit-btn');
    const loginStatusMsg = document.getElementById('login-status-msg');
    const authHeaderBtnWrap = document.getElementById('auth-header-btn-wrap');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const authModePill = document.getElementById('auth-mode-pill');
    const vaultFolderStatus = document.getElementById('vault-folder-status');

    // UI Stats
    const imagesCount = document.getElementById('images-count');
    const videosCount = document.getElementById('videos-count');
    const docsCount = document.getElementById('docs-count');
    const storageUsageText = document.getElementById('storage-usage-text');

    // Grid Containers
    const imagesGrid = document.getElementById('grid-images');
    const videosGrid = document.getElementById('grid-videos');
    const documentsGrid = document.getElementById('grid-documents');

    // Upload Triggers
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const uploadDocBtn = document.getElementById('upload-doc-btn');
    const imageUploader = document.getElementById('image-uploader');
    const videoUploader = document.getElementById('video-uploader');
    const docUploader = document.getElementById('doc-uploader');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentText = document.getElementById('upload-percent-text');

    // Global Dropzone
    const globalDropzone = document.getElementById('global-dropzone');
    const tabButtons = document.querySelectorAll('.vtab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Preview Modal
    const previewModal = document.getElementById('preview-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalDownloadBtn = document.getElementById('modal-download-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');

    // Notepad Tab
    const notesTextarea = document.getElementById('vault-notes-textarea');
    const notesSyncStatus = document.getElementById('notes-sync-status');
    const notesCharCount = document.getElementById('notes-char-count');
    const notesWordCount = document.getElementById('notes-word-count');
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
    const secretsCount = document.getElementById('secrets-count');
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

    // Toggle Eye Handlers for inputs
    if (toggleFbEmail && fbEmailInput) {
        toggleFbEmail.addEventListener('click', () => {
            const isMasked = fbEmailInput.type === 'password';
            fbEmailInput.type = isMasked ? 'text' : 'password';
            toggleFbEmail.innerHTML = isMasked ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    if (toggleFbPass && fbPasswordInput) {
        toggleFbPass.addEventListener('click', () => {
            const isMasked = fbPasswordInput.type === 'password';
            fbPasswordInput.type = isMasked ? 'text' : 'password';
            toggleFbPass.innerHTML = isMasked ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    // ------------------------------------------------------------------
    // AUTHENTICATION FLOW (FIREBASE EMAIL & MASTER PASSWORD)
    // ------------------------------------------------------------------
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
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, pass);
            currentUser = userCredential.user;

            // Purge credentials immediately from DOM
            if (fbEmailInput) {
                fbEmailInput.value = '';
                fbEmailInput.type = 'password';
            }
            if (fbPasswordInput) {
                fbPasswordInput.value = '';
                fbPasswordInput.type = 'password';
            }

            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Identity Verified! Loading Cloud Workspace...';
            await onVaultAuthenticated('Master ID/Password');
        } catch (err) {
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

    // Check existing Firebase Auth State
    fbAuth.onAuthStateChanged((user) => {
        if (user && !currentUser) {
            currentUser = user;
            onVaultAuthenticated('Active Session');
        } else if (!user) {
            showLockedView();
        }
    });

    async function onVaultAuthenticated(modeName) {
        if (!currentUser || !isAuthorizedAdmin(currentUser.email)) {
            console.warn('Unauthorized identity rejected:', currentUser ? currentUser.email : 'null');
            await logout(true);
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Access Denied: This vault is private. Registered admin identity required.';
            showToast('Access Denied: Unauthorized Identity', 'shield-xmark');
            return;
        }

        showUnlockedView();
        if (modeName !== 'Active Session') {
            showToast(`Vault Unlocked via ${modeName}!`, 'shield-check');
        }

        if (currentUser) {
            userName.textContent = currentUser.displayName || 'Arpit Yadav';
            userEmail.textContent = currentUser.email;
        }

        authModePill.innerHTML = `<i class="fas fa-cloud-check" style="color:#00C853;"></i> Live Cloud Synced`;
        if (vaultFolderStatus) {
            vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
        }

        // Load cached files instantly, then fetch live from Google Drive
        await loadAllInitialFiles();
        loadDriveFiles(false);
    }

    function showLockedView() {
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

        currentUser = null;
        decryptedSecrets = [];
        currentMasterPassphrase = null;
        allDriveFiles = [];

        // Purge tokens & cloud cache
        localStorage.removeItem('arpit_vault_drive_cache');
        localStorage.removeItem('arpit_vault_notepad_permanent');

        // Purge IndexedDB cache
        try {
            await VaultDB.clearAll();
        } catch (_) {}

        // Empty DOM grids so zero sensitive content exists in memory
        if (imagesGrid) imagesGrid.innerHTML = '';
        if (videosGrid) videosGrid.innerHTML = '';
        if (documentsGrid) documentsGrid.innerHTML = '';
        if (notesTextarea) notesTextarea.value = '';
        if (secretsList) secretsList.innerHTML = '';
        if (secretsManagerWrap) secretsManagerWrap.style.display = 'none';
        if (secretsUnlockCard) secretsUnlockCard.style.display = 'block';

        if (fbEmailInput) {
            fbEmailInput.value = '';
            fbEmailInput.type = 'password';
        }
        if (fbPasswordInput) {
            fbPasswordInput.value = '';
            fbPasswordInput.type = 'password';
        }
        if (masterPassphraseInput) {
            masterPassphraseInput.value = '';
        }

        fbSubmitBtn.disabled = false;
        fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
        loginStatusMsg.textContent = '';

        showLockedView();
        showToast(isSecurityPurge ? 'Unauthorized attempt blocked: Session wiped' : 'Vault locked & All local cache wiped', 'shield-halved');
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
        const images = files.filter(f => categorizeFile(f.name, f.mimeType) === 'image');
        const videos = files.filter(f => categorizeFile(f.name, f.mimeType) === 'video');
        const docs = files.filter(f => categorizeFile(f.name, f.mimeType) === 'doc');

        if (imagesCount) imagesCount.textContent = images.length;
        if (videosCount) videosCount.textContent = videos.length;
        if (docsCount) docsCount.textContent = docs.length;

        // Calculate total size
        const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
        if (storageUsageText) storageUsageText.textContent = `${formatBytes(totalBytes)} Cloud Stored`;

        renderImages(images);
        renderVideos(videos);
        renderDocs(docs);
    }

    async function loadAllInitialFiles() {
        try {
            const raw = localStorage.getItem('arpit_vault_drive_cache');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    allDriveFiles = parsed;
                    partitionAndRenderFiles(allDriveFiles);
                }
            }
        } catch (_) {}

        const dbFiles = await VaultDB.getAllFiles().catch(() => []);
        if (dbFiles.length > 0 && allDriveFiles.length === 0) {
            allDriveFiles = dbFiles;
            partitionAndRenderFiles(allDriveFiles);
        }
    }

    let isFetchingFiles = false;

    async function loadDriveFiles(showToastNotice = false) {
        if (isFetchingFiles) return;
        isFetchingFiles = true;

        try {
            const data = await DRIVE_RELAY.listFiles();
            if (data && data.success) {
                const freshFiles = data.files || [];
                allDriveFiles = freshFiles;
                localStorage.setItem('arpit_vault_drive_cache', JSON.stringify(freshFiles));
                partitionAndRenderFiles(freshFiles);

                // Update notes if fetched
                if (data.notes && notesTextarea && (!notesTextarea.value || notesTextarea.value === localStorage.getItem('arpit_vault_notepad_permanent'))) {
                    notesTextarea.value = data.notes;
                    localStorage.setItem('arpit_vault_notepad_permanent', data.notes);
                    updateNotepadStats();
                    if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-check-circle"></i> Synced with Google Drive';
                }

                if (showToastNotice) {
                    showToast(`Synced ${freshFiles.length} file(s) from Google Drive`, 'cloud-arrow-down');
                }
            } else if (data && data.error) {
                console.warn('Drive Relay Error:', data.error);
            }
        } catch (err) {
            console.warn('Background sync network error:', err);
        } finally {
            isFetchingFiles = false;
        }
    }

    // Auto-sync every 20 seconds and on tab focus
    setInterval(() => {
        if (currentUser && unlockedDashboard.classList.contains('active')) {
            loadDriveFiles(false);
        }
    }, 20000);

    window.addEventListener('focus', () => {
        if (currentUser && unlockedDashboard.classList.contains('active')) {
            loadDriveFiles(false);
        }
    });

    // ------------------------------------------------------------------
    // FILE UPLOAD (DIRECT CLOUD SYNC)
    // ------------------------------------------------------------------
    async function handleFileUpload(files) {
        if (!files || !files.length) return;

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';
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
                    // Add directly to local list for instant feedback
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
            // Refresh from cloud
            setTimeout(() => loadDriveFiles(false), 800);
        }
    }

    // Attach File Upload Listeners
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

    // Drag and Drop
    if (globalDropzone) {
        ['dragenter', 'dragover'].forEach(evt => {
            globalDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                globalDropzone.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            globalDropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                globalDropzone.classList.remove('drag-active');
            });
        });

        globalDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                handleFileUpload(Array.from(e.dataTransfer.files));
            }
        });
    }

    // ------------------------------------------------------------------
    // RENDER FUNCTIONS (IMAGES, VIDEOS, DOCUMENTS)
    // ------------------------------------------------------------------
    function renderImages(items) {
        if (!imagesGrid) return;
        if (!items || items.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>No Images Stored Yet</h3>
                    <p>Click "Upload Images" to save photos, PNGs, and artwork directly in your vault.</p>
                </div>
            `;
            return;
        }

        imagesGrid.innerHTML = items.map(img => {
            const viewUrl = img.webViewLink || `https://drive.google.com/file/d/${img.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${img.id}&export=download`;
            const thumbUrl = `https://drive.google.com/thumbnail?id=${img.id}&sz=w600`;

            return `
                <div class="vault-card image-card" data-id="${img.id}">
                    <div class="card-media-wrap">
                        <img src="${thumbUrl}" alt="${escapeHTML(img.name)}" loading="lazy" onerror="this.src='../assets/portfolio-preview.png'">
                        <div class="card-overlay">
                            <button class="action-btn-circle view-btn" data-id="${img.id}" data-name="${escapeHTML(img.name)}" data-url="${viewUrl}" title="Preview"><i class="fas fa-eye"></i></button>
                            <a href="${downloadUrl}" download="${escapeHTML(img.name)}" target="_blank" class="action-btn-circle" title="Download"><i class="fas fa-arrow-down-to-line"></i></a>
                            <button class="action-btn-circle del-btn" data-id="${img.id}" data-name="${escapeHTML(img.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                    <div class="card-details">
                        <span class="card-title" title="${escapeHTML(img.name)}">${escapeHTML(img.name)}</span>
                        <div class="card-meta">
                            <span>${formatBytes(img.size)}</span>
                            <span>${new Date(img.modifiedTime).toLocaleDateString()}</span>
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
                    <h3>No Videos Stored Yet</h3>
                    <p>Upload demo screencasts, mp4 recordings, and presentation clips.</p>
                </div>
            `;
            return;
        }

        videosGrid.innerHTML = items.map(vid => {
            const viewUrl = vid.webViewLink || `https://drive.google.com/file/d/${vid.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${vid.id}&export=download`;

            return `
                <div class="vault-card video-card" data-id="${vid.id}">
                    <div class="card-media-wrap video-placeholder">
                        <i class="fas fa-play-circle" style="font-size:42px; color:var(--brand-accent, #FF4F00);"></i>
                        <div class="card-overlay">
                            <a href="${viewUrl}" target="_blank" class="action-btn-circle" title="Play Video"><i class="fas fa-play"></i></a>
                            <a href="${downloadUrl}" target="_blank" class="action-btn-circle" title="Download"><i class="fas fa-arrow-down-to-line"></i></a>
                            <button class="action-btn-circle del-btn" data-id="${vid.id}" data-name="${escapeHTML(vid.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                    <div class="card-details">
                        <span class="card-title" title="${escapeHTML(vid.name)}">${escapeHTML(vid.name)}</span>
                        <div class="card-meta">
                            <span>${formatBytes(vid.size)}</span>
                            <span>${new Date(vid.modifiedTime).toLocaleDateString()}</span>
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
                    <h3>No Documents Stored Yet</h3>
                    <p>Click "Upload Documents" to store PDFs, reports, resumes, or code archives.</p>
                </div>
            `;
            return;
        }

        documentsGrid.innerHTML = items.map(doc => {
            const viewUrl = doc.webViewLink || `https://drive.google.com/file/d/${doc.id}/view`;
            const downloadUrl = `https://drive.google.com/uc?id=${doc.id}&export=download`;

            return `
                <div class="vault-card doc-card" data-id="${doc.id}">
                    <div class="card-media-wrap doc-placeholder">
                        <i class="fas fa-file-pdf" style="font-size:38px; color:#FF3B30;"></i>
                        <div class="card-overlay">
                            <a href="${viewUrl}" target="_blank" class="action-btn-circle" title="Open in Google Drive"><i class="fas fa-arrow-up-right-from-square"></i></a>
                            <a href="${downloadUrl}" target="_blank" class="action-btn-circle" title="Download"><i class="fas fa-arrow-down-to-line"></i></a>
                            <button class="action-btn-circle del-btn" data-id="${doc.id}" data-name="${escapeHTML(doc.name)}" title="Delete" style="color:#FF3B30;"><i class="fas fa-trash-can"></i></button>
                        </div>
                    </div>
                    <div class="card-details">
                        <span class="card-title" title="${escapeHTML(doc.name)}">${escapeHTML(doc.name)}</span>
                        <div class="card-meta">
                            <span>${formatBytes(doc.size)}</span>
                            <span>${new Date(doc.modifiedTime).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachCardHandlers(documentsGrid);
    }

    function attachCardHandlers(container) {
        container.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Delete "${name}" from your cloud vault?`)) {
                    btn.disabled = true;
                    showToast(`Deleting ${name}...`, 'trash');
                    try {
                        const res = await DRIVE_RELAY.deleteFile(id);
                        if (res && res.success) {
                            allDriveFiles = allDriveFiles.filter(f => f.id !== id);
                            localStorage.setItem('arpit_vault_drive_cache', JSON.stringify(allDriveFiles));
                            partitionAndRenderFiles(allDriveFiles);
                            showToast(`Removed "${name}" from Google Drive`, 'trash');
                        } else {
                            showToast('Could not delete: ' + (res?.error || 'Error'), 'triangle-exclamation');
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
        modalTitle.textContent = title;
        modalBody.innerHTML = `<iframe src="https://drive.google.com/file/d/${id}/preview" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`;
        if (modalDownloadBtn) {
            modalDownloadBtn.href = `https://drive.google.com/uc?id=${id}&export=download`;
            modalDownloadBtn.download = title;
        }
        previewModal.style.display = 'flex';
    }

    if (closePreviewBtn && previewModal) {
        closePreviewBtn.addEventListener('click', () => {
            previewModal.style.display = 'none';
            modalBody.innerHTML = '';
        });
    }

    // ------------------------------------------------------------------
    // NOTEPAD ENGINE (AUTO-SYNC TO CLOUD)
    // ------------------------------------------------------------------
    function updateNotepadStats() {
        if (!notesTextarea) return;
        const val = notesTextarea.value || '';
        if (notesCharCount) notesCharCount.textContent = val.length;
        if (notesWordCount) {
            const words = val.trim() ? val.trim().split(/\s+/).length : 0;
            notesWordCount.textContent = words;
        }
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
        localStorage.setItem('arpit_vault_notepad_permanent', content);

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
                localStorage.removeItem('arpit_vault_notepad_permanent');
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
            localStorage.setItem('arpit_vault_secrets_enc', encryptedStr);
            // Save to drive relay
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
                let encryptedPayload = localStorage.getItem('arpit_vault_secrets_enc');

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

})();
