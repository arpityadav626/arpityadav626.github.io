/* ======================================================================
   ARPIT VAULT — DUAL AUTH (FIREBASE EMAIL/PASS + GOOGLE DRIVE) ENGINE
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
    const NOTES_FILE_NAME = 'vault_scratchpad.txt';

    // INITIALIZE FIREBASE APP
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    const fbAuth = firebase.auth();

    // ==================================================================
    // INDEXEDDB VAULT ENGINE (Persistent Local Store with Instant 0ms Access)
    // ==================================================================
    const VaultDB = {
        db: null,
        async init() {
            if (this.db) return this.db;
            return new Promise((resolve) => {
                const req = indexedDB.open('ArpitVaultStore', 1);
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
    let driveAccessToken = localStorage.getItem('arpit_drive_access_token') || null;
    let driveTokenExpiry = localStorage.getItem('arpit_drive_access_token_exp') || 0;
    let currentUser = null;
    let vaultFolderId = localStorage.getItem('arpit_vault_folder_id') || null;
    let allDriveFiles = [];
    let decryptedSecrets = [];
    let masterKeyDerived = null;
    let secretsDriveFileId = null;
    let notesDriveFileId = null;
    let notesSaveTimeout = null;

    // ==================================================================
    // GLOBAL DELETED TOMBSTONES (Prevents zombie file resurrection)
    // ==================================================================
    function getTombstones() {
        try {
            const list = JSON.parse(localStorage.getItem('arpit_vault_tombstones') || '[]');
            const cutoff = Date.now() - (7 * 24 * 3600 * 1000); // 7-day retention
            return list.filter(t => t && t.id && t.time && t.time > cutoff);
        } catch (_) {
            return [];
        }
    }

    function addTombstone(name, id) {
        if (!id) return;
        const list = getTombstones();
        if (!list.some(t => t.id === id)) {
            list.push({ id, time: Date.now() });
            if (list.length > 200) list.shift();
            localStorage.setItem('arpit_vault_tombstones', JSON.stringify(list));
        }
    }

    // DOM ELEMENTS
    const lockedSection = document.getElementById('locked-state');
    const unlockedDashboard = document.getElementById('unlocked-dashboard');
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
    const authHeaderBtnWrap = document.getElementById('auth-header-btn-wrap');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const authModePill = document.getElementById('auth-mode-pill');
    const vaultFolderStatus = document.getElementById('vault-folder-status');

    // Tabs
    const tabButtons = document.querySelectorAll('.vtab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Categorized Grids & Counters
    const imagesGrid = document.getElementById('images-grid');
    const videosGrid = document.getElementById('videos-grid');
    const docsGrid = document.getElementById('docs-grid');
    const imagesCount = document.getElementById('images-count');
    const videosCount = document.getElementById('videos-count');
    const docsCount = document.getElementById('docs-count');

    // Search Inputs
    const imagesSearchInput = document.getElementById('images-search-input');
    const videosSearchInput = document.getElementById('videos-search-input');
    const docsSearchInput = document.getElementById('docs-search-input');

    // Upload Triggers & Inputs
    const imageUploader = document.getElementById('image-uploader');
    const videoUploader = document.getElementById('video-uploader');
    const docUploader = document.getElementById('doc-uploader');
    const fileUploader = document.getElementById('file-uploader');
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const uploadDocBtn = document.getElementById('upload-doc-btn');
    const refreshFilesBtns = document.querySelectorAll('.refresh-files-btn');

    // Global Upload Progress
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentText = document.getElementById('upload-percent-text');

    // Notepad Tab Elements
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
    const secretsCount = document.getElementById('secrets-count');
    const secretsSearchInput = document.getElementById('secrets-search-input');
    const openNewSecretModalBtn = document.getElementById('open-new-secret-modal-btn');
    const newSecretModal = document.getElementById('new-secret-modal');
    const closeSecretModalBtn = document.getElementById('close-secret-modal-btn');
    const cancelSecretBtn = document.getElementById('cancel-secret-btn');
    const newSecretForm = document.getElementById('new-secret-form');
    const secPass = document.getElementById('sec-pass');
    const toggleSecPass = document.getElementById('toggle-sec-pass');

    let currentMasterPassphrase = null;

    // Render decrypted secrets list
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

        // Attach item handlers
        secretsList.querySelectorAll('.sec-reveal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
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
                }).catch(() => {
                    showToast('Could not access clipboard', 'triangle-exclamation');
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

    // Save and sync encrypted payload
    async function saveAndSyncSecrets() {
        if (!currentMasterPassphrase) return;
        try {
            const encryptedStr = await CryptoEngine.encrypt(decryptedSecrets, currentMasterPassphrase);
            localStorage.setItem('arpit_vault_secrets_enc', encryptedStr);

            if (driveAccessToken && vaultFolderId) {
                const blob = new Blob([encryptedStr], { type: 'application/json' });
                if (secretsDriveFileId) {
                    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${secretsDriveFileId}?uploadType=media`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${driveAccessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: blob
                    });
                } else {
                    const metadata = { name: SECRETS_FILE_NAME, parents: [vaultFolderId] };
                    const res = await uploadBlobToDrive(blob, metadata, driveAccessToken);
                    if (res.ok) {
                        const data = await res.json();
                        secretsDriveFileId = data.id;
                    }
                }
            }
        } catch (err) {
            console.error('Error encrypting and syncing secrets:', err);
            showToast('Encryption sync error: ' + err.message, 'triangle-exclamation');
        }
    }

    // Unlock secrets handler
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

                // Try fetching from Google Drive if available
                if (driveAccessToken && vaultFolderId && !encryptedPayload) {
                    if (!secretsDriveFileId) {
                        const q = encodeURIComponent(`'${vaultFolderId}' in parents and name = '${SECRETS_FILE_NAME}' and trashed = false`);
                        const res = await driveFetch(`files?q=${q}&fields=files(id)`);
                        const data = await res.json();
                        if (data.files && data.files.length > 0) {
                            secretsDriveFileId = data.files[0].id;
                        }
                    }
                    if (secretsDriveFileId) {
                        const res = await driveFetch(`files/${secretsDriveFileId}?alt=media`);
                        if (res.ok) {
                            encryptedPayload = await res.text();
                        }
                    }
                }

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
                showToast('Incorrect Master Passphrase or corrupted data', 'triangle-exclamation');
            } finally {
                unlockSecretsBtn.disabled = false;
                unlockSecretsBtn.innerHTML = '<i class="fas fa-lock-open"></i> Decrypt Credentials';
            }
        });

        masterPassphraseInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') unlockSecretsBtn.click();
        });
    }

    // Lock secrets
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

    // Search secrets
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

    // Modal Add Secret
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


    // Toast
    const toastEl = document.getElementById('vault-toast');

    function showToast(msg, icon = 'info') {
        if (!toastEl) return;
        toastEl.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 2200);
    }

    // ------------------------------------------------------------------
    // 1. GATE TABS TOGGLE (Email/Pass vs Google)
    // ------------------------------------------------------------------
    tabBtnFirebase.addEventListener('click', () => {
        tabBtnFirebase.classList.add('active');
        tabBtnDrive.classList.remove('active');
        authBoxFirebase.classList.add('active');
        authBoxDrive.classList.remove('active');
        loginStatusMsg.textContent = '';
    });

    tabBtnDrive.addEventListener('click', () => {
        tabBtnDrive.classList.add('active');
        tabBtnFirebase.classList.remove('active');
        authBoxDrive.classList.add('active');
        authBoxFirebase.classList.remove('active');
        loginStatusMsg.textContent = '';
    });

    if (toggleFbEmail) {
        toggleFbEmail.addEventListener('click', () => {
            const isMasked = fbEmailInput.type === 'password';
            fbEmailInput.type = isMasked ? 'text' : 'password';
            if (isMasked) {
                fbEmailInput.classList.add('revealed');
                toggleFbEmail.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                fbEmailInput.classList.remove('revealed');
                toggleFbEmail.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }

    if (toggleFbPass) {
        toggleFbPass.addEventListener('click', () => {
            const isMasked = fbPasswordInput.type === 'password';
            fbPasswordInput.type = isMasked ? 'text' : 'password';
            if (isMasked) {
                fbPasswordInput.classList.add('revealed');
                toggleFbPass.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                fbPasswordInput.classList.remove('revealed');
                toggleFbPass.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }

    // ------------------------------------------------------------------
    // 2. FIREBASE EMAIL + PASSWORD AUTHENTICATION
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
        loginStatusMsg.textContent = 'Verifying credentials with Firebase Auth...';

        try {
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, pass);
            currentUser = userCredential.user;

            // Purge credentials immediately from DOM
            if (fbEmailInput) {
                fbEmailInput.value = '';
                fbEmailInput.type = 'password';
                fbEmailInput.classList.remove('revealed');
            }
            if (fbPasswordInput) {
                fbPasswordInput.value = '';
                fbPasswordInput.type = 'password';
                fbPasswordInput.classList.remove('revealed');
            }
            if (toggleFbEmail) toggleFbEmail.innerHTML = '<i class="fas fa-eye"></i>';
            if (toggleFbPass) toggleFbPass.innerHTML = '<i class="fas fa-eye"></i>';

            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Identity Verified! Loading Workspace...';
            onVaultAuthenticated('Email/Password');
        } catch (err) {
            console.error('Firebase Auth Error:', err);
            fbSubmitBtn.disabled = false;
            fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
            loginStatusMsg.className = 'status-msg error';

            let msg = 'Authentication failed: ' + (err.message || 'Invalid credentials');
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                msg = 'Incorrect email or password. Please verify your credentials.';
            } else if (err.code === 'auth/invalid-email') {
                msg = 'Invalid email address format.';
            } else if (err.code === 'auth/too-many-requests') {
                msg = 'Too many failed login attempts. Please wait a moment and try again.';
            } else if (err.code === 'auth/network-request-failed') {
                msg = 'Network connection error. Check your internet connection.';
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

    // ------------------------------------------------------------------
    // 3. FIREBASE GOOGLE AUTH + DRIVE SCOPE
    // ------------------------------------------------------------------
    firebaseGoogleAuthBtn.addEventListener('click', async () => {
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Opening Google Sign-In with Drive permissions...';

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive.file');
        provider.setCustomParameters({
            prompt: 'consent',
            access_type: 'offline'
        });

        try {
            const result = await fbAuth.signInWithPopup(provider);
            const credential = result.credential;

            if (credential && credential.accessToken) {
                driveAccessToken = credential.accessToken;
                driveTokenExpiry = Date.now() + (3600 * 1000);
                localStorage.setItem('arpit_drive_access_token', driveAccessToken);
                localStorage.setItem('arpit_drive_access_token_exp', driveTokenExpiry);
            }

            currentUser = result.user;
            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Authenticated! Loading Google Drive Workspace...';
            onVaultAuthenticated('Google Account');
        } catch (err) {
            console.error('Firebase Google Auth Error:', err);
            if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
                loginStatusMsg.className = 'status-msg info';
                loginStatusMsg.textContent = 'Opening Google sign-in window...';
                await fbAuth.signInWithRedirect(provider);
                return;
            }
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Sign-in failed: ' + (err.message || 'Access cancelled');
        }
    });

    // Mobile & Redirect Auth Handler (Seamless instant sync on phone)
    fbAuth.getRedirectResult().then(async (result) => {
        if (result && result.credential && result.credential.accessToken) {
            driveAccessToken = result.credential.accessToken;
            driveTokenExpiry = Date.now() + (3600 * 1000);
            localStorage.setItem('arpit_drive_access_token', driveAccessToken);
            localStorage.setItem('arpit_drive_access_token_exp', driveTokenExpiry);

            if (result.user) currentUser = result.user;
            showUnlockedView();
            if (vaultFolderStatus) {
                vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
            }
            await ensureVaultFolder();
            await syncLocalFilesToDrive();
            await loadDriveFiles(true);
            await syncCloudNotesFromDrive();
            showToast('Google Drive Connected &amp; Synced!', 'cloud-check');
        } else if (result && result.user) {
            currentUser = result.user;
            onVaultAuthenticated('Google Account (Mobile Redirect)');
        }
    }).catch(err => {
        console.error('Redirect sign-in error:', err);
    });

    // Check existing Firebase Auth State
    fbAuth.onAuthStateChanged((user) => {
        if (user && !currentUser) {
            currentUser = user;
            onVaultAuthenticated('Active Session');
        } else if (!user) {
            showLockedView();
        }
    });

    // 0ms Unified Instant Local + Cache Loader
    async function loadAllInitialFiles() {
        let cachedDrive = [];
        try {
            const raw = localStorage.getItem('arpit_vault_drive_cache');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    cachedDrive = parsed;
                }
            }
        } catch (_) {}

        const dbFiles = await VaultDB.getAllFiles().catch(() => []);
        const metaFiles = JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
        const localCombined = [...dbFiles];
        metaFiles.forEach(mf => {
            if (!localCombined.some(c => c.id === mf.id)) localCombined.push(mf);
        });

        // Merge Drive cache + local storage without duplicate IDs or names
        const merged = [...cachedDrive];
        localCombined.forEach(lf => {
            const matchIndex = merged.findIndex(m => m.id === lf.id || (lf.driveFileId && m.id === lf.driveFileId) || m.name === lf.name);
            if (matchIndex >= 0) {
                merged[matchIndex] = { ...merged[matchIndex], ...lf };
            } else {
                merged.unshift(lf);
            }
        });

        allDriveFiles = merged;
        partitionAndRenderFiles(merged);
        return merged;
    }

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
            showToast(`Authenticated via ${modeName}!`, 'shield-check');
        }

        if (currentUser) {
            userName.textContent = currentUser.displayName || 'Vault Admin';
            userEmail.textContent = currentUser.email;
            if (currentUser.photoURL) {
                userAvatar.src = currentUser.photoURL;
                userAvatar.style.display = 'block';
            }
        }

        authModePill.innerHTML = `<i class="fas fa-lock"></i> Secured`;

        // 1. INSTANT 0ms RENDER FROM UNIFIED CACHE (NO EMPTY SPINNER LOOP)
        await loadAllInitialFiles();
        loadCloudNotes(); // loads local notepad instantly in 0ms

        // 2. CHECK DRIVE CONNECTION AND SYNC SILENTLY IN BACKGROUND
        const isDriveValid = driveAccessToken && Date.now() < parseInt(driveTokenExpiry, 10);
        if (isDriveValid) {
            (async () => {
                const check = await verifyGoogleDriveConnection();
                if (check.ok) {
                    if (vaultFolderStatus) {
                        vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
                    }
                    try {
                        await ensureVaultFolder();
                        await Promise.all([
                            loadDriveFiles(false),
                            syncCloudNotesFromDrive()
                        ]);
                    } catch (syncErr) {
                        console.warn('Background sync warning:', syncErr);
                    }
                } else if (check.isDriveApiDisabled) {
                    console.warn('Drive API disabled in Google Cloud:', check.message);
                    if (vaultFolderStatus) {
                        vaultFolderStatus.innerHTML = '<a href="https://console.cloud.google.com/apis/library/drive.googleapis.com?project=arpit-portfolio-2026" target="_blank" style="color:#FF4F00;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Enable Drive API in Google Cloud ↗</a>';
                    }
                    showToast('Drive API is not enabled in Google Cloud Console. Click header link to enable.', 'triangle-exclamation');
                    updateDriveConnectButton();
                } else {
                    console.warn('Drive auth notice:', check.message || check.error);
                    if (vaultFolderStatus) {
                        vaultFolderStatus.innerHTML = '<i class="fas fa-database"></i> Local Vault Active';
                    }
                    updateDriveConnectButton();
                }
            })();
        } else {
            if (vaultFolderStatus) {
                vaultFolderStatus.innerHTML = '<i class="fas fa-database"></i> Local Vault Active';
            }
            updateDriveConnectButton();
        }
    }

    // ==================================================================
    // FULL AUTO-SYNC SCHEDULER: SILENT BACKGROUND POLLING & VISIBILITY
    // ==================================================================
    let autoSyncSchedulerInitialized = false;
    function initAutoSyncScheduler() {
        if (autoSyncSchedulerInitialized) return;
        autoSyncSchedulerInitialized = true;

        // 1. High-frequency real-time sync every 12 seconds while tab is active
        setInterval(() => {
            if (!document.hidden && currentUser && driveAccessToken) {
                autoSyncDriveBackground(false);
            }
        }, 12000);

        // 2. Instant auto-sync whenever user opens / switches to tab (Phone & Desktop)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && currentUser && driveAccessToken) {
                autoSyncDriveBackground(false);
            }
        });

        window.addEventListener('pageshow', () => {
            if (currentUser && driveAccessToken) {
                autoSyncDriveBackground(false);
            }
        });

        window.addEventListener('focus', () => {
            if (currentUser && driveAccessToken) {
                autoSyncDriveBackground(false);
            }
        });
    }
    initAutoSyncScheduler();

    async function logout(isSecurityPurge = false) {
        try {
            await fbAuth.signOut();
        } catch (_) {}

        currentUser = null;
        driveAccessToken = null;
        masterKeyDerived = null;
        decryptedSecrets = [];
        currentMasterPassphrase = null;
        allDriveFiles = [];

        // Purge tokens & cloud cache
        localStorage.removeItem('arpit_drive_access_token');
        localStorage.removeItem('arpit_drive_access_token_exp');
        localStorage.removeItem('arpit_vault_drive_cache');
        localStorage.removeItem('arpit_vault_local_files_meta');
        localStorage.removeItem('arpit_vault_notepad_permanent');
        localStorage.removeItem('arpit_vault_folder_id');

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
            fbEmailInput.classList.remove('revealed');
        }
        if (fbPasswordInput) {
            fbPasswordInput.value = '';
            fbPasswordInput.type = 'password';
            fbPasswordInput.classList.remove('revealed');
        }
        if (masterPassphraseInput) {
            masterPassphraseInput.value = '';
        }
        if (toggleFbEmail) toggleFbEmail.innerHTML = '<i class="fas fa-eye"></i>';
        if (toggleFbPass) toggleFbPass.innerHTML = '<i class="fas fa-eye"></i>';

        fbSubmitBtn.disabled = false;
        fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
        loginStatusMsg.textContent = '';

        showLockedView();
        showToast(isSecurityPurge ? 'Unauthorized attempt blocked: Session wiped' : 'Vault locked & All local cache wiped', 'shield-halved');
    }

    function showLockedView() {
        lockedSection.style.display = 'flex';
        lockedSection.classList.add('active');
        unlockedDashboard.style.display = 'none';
        unlockedDashboard.classList.remove('active');
        authHeaderBtnWrap.innerHTML = '';
        loginStatusMsg.textContent = '';
    }

    
    function updateDriveConnectButton() {
        let driveBtn = document.getElementById('btn-connect-drive-header');
        if (!driveBtn && authHeaderBtnWrap) {
            driveBtn = document.createElement('button');
            driveBtn.id = 'btn-connect-drive-header';
            driveBtn.className = 'action-btn outline-btn';
            driveBtn.innerHTML = '<i class="fab fa-google-drive"></i> <span>Sync Drive</span>';
            driveBtn.title = 'Link Google Drive for multi-device sync';
            driveBtn.style.marginRight = '8px';
            driveBtn.addEventListener('click', async () => {
                showToast('Requesting Google Drive Permission...', 'cloud');
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/drive.file');
                provider.setCustomParameters({
                    prompt: 'consent',
                    access_type: 'offline'
                });
                try {
                    const result = await fbAuth.signInWithPopup(provider);
                    if (result.credential && result.credential.accessToken) {
                        driveAccessToken = result.credential.accessToken;
                        driveTokenExpiry = Date.now() + (3600 * 1000);
                        localStorage.setItem('arpit_drive_access_token', driveAccessToken);
                        localStorage.setItem('arpit_drive_access_token_exp', driveTokenExpiry);

                        const check = await verifyGoogleDriveConnection();
                        if (check.ok) {
                            showToast(`Drive Connected (${check.user?.emailAddress || 'Ready'})!`, 'check');
                            if (driveBtn) driveBtn.remove();
                            if (vaultFolderStatus) {
                                vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
                            }
                            await ensureVaultFolder();
                            await syncLocalFilesToDrive();
                            await loadDriveFiles(true);
                        } else if (check.isDriveApiDisabled) {
                            showToast('Google Drive API disabled in project. Click header link to enable.', 'triangle-exclamation');
                            if (vaultFolderStatus) {
                                vaultFolderStatus.innerHTML = '<a href="https://console.cloud.google.com/apis/library/drive.googleapis.com?project=arpit-portfolio-2026" target="_blank" style="color:#FF4F00;font-weight:700;"><i class="fas fa-triangle-exclamation"></i> Enable Drive API in Google Cloud ↗</a>';
                            }
                        } else {
                            showToast('Drive: ' + (check.message || check.error), 'circle-exclamation');
                        }
                    }
                } catch (err) {
                    if (err.code === 'auth/popup-blocked') {
                        await fbAuth.signInWithRedirect(provider);
                    } else {
                        showToast('Drive link failed: ' + (err.message || 'Cancelled'), 'circle-exclamation');
                    }
                }
            });
            authHeaderBtnWrap.prepend(driveBtn);
        }
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
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    }

    // ------------------------------------------------------------------
    // ------------------------------------------------------------------
    // GOOGLE DRIVE HEALTH & PERMISSION VERIFIER
    // ------------------------------------------------------------------
    async function verifyGoogleDriveConnection() {
        if (!driveAccessToken) return { ok: false, error: 'No token' };
        try {
            const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
                headers: { Authorization: `Bearer ${driveAccessToken}` }
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                return { ok: true, user: data.user, quota: data.storageQuota };
            } else {
                const msg = data.error?.message || `HTTP ${res.status}`;
                const isDriveApiDisabled = msg.includes('has not been used in project') || msg.includes('it is disabled');
                const isScopeMissing = msg.includes('Insufficient') || msg.includes('scope');
                return {
                    ok: false,
                    status: res.status,
                    message: msg,
                    isDriveApiDisabled,
                    isScopeMissing
                };
            }
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    // DRIVE CORE TRANSPORT & FOLDER ENGINE
    // ------------------------------------------------------------------
    async function driveFetch(endpoint, options = {}) {
        if (!driveAccessToken) {
            throw new Error('Google Drive access token missing.');
        }
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${driveAccessToken}`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, options);
        if (res.status === 401) {
            driveAccessToken = null;
            localStorage.removeItem('arpit_drive_access_token');
            localStorage.removeItem('arpit_drive_access_token_exp');
            throw new Error('Drive session expired. Reconnect Drive.');
        }
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const msg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return res;
    }

        // RFC 2387 multipart/related uploader for Google Drive API v3
    async function uploadBlobToDrive(fileBlob, metadata, accessToken) {
        if (!accessToken) throw new Error("No access token for Drive upload");
        const boundary = "-------" + Math.random().toString(36).substring(2) + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const contentType = fileBlob.type || "application/octet-stream";
        const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json; charset=UTF-8" });
        const multipartBody = new Blob([
            delimiter,
            "Content-Type: application/json; charset=UTF-8\r\n\r\n",
            metadataBlob,
            delimiter,
            "Content-Type: ", contentType, "\r\n\r\n",
            fileBlob,
            close_delim
        ], { type: `multipart/related; boundary=${boundary}` });
        const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": `multipart/related; boundary=${boundary}`
            },
            body: multipartBody
        });
        return res;
    }

    async function ensureVaultFolder() {
        if (vaultFolderId && vaultFolderId !== 'undefined' && vaultFolderId !== 'null') {
            if (vaultFolderStatus) vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive"></i> /${VAULT_FOLDER_NAME}`;
            return vaultFolderId;
        }
        if (vaultFolderStatus) vaultFolderStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating cloud folder...';
        try {
            const q = encodeURIComponent(`name = '${VAULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name)`);
            const data = await res.json();

            if (data.files && data.files.length > 0 && data.files[0].id) {
                vaultFolderId = data.files[0].id;
                localStorage.setItem('arpit_vault_folder_id', vaultFolderId);
            } else {
                const createRes = await driveFetch('files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: VAULT_FOLDER_NAME,
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                });
                const folderData = await createRes.json();
                if (folderData && folderData.id) {
                    vaultFolderId = folderData.id;
                    localStorage.setItem('arpit_vault_folder_id', vaultFolderId);
                } else {
                    throw new Error('Could not create folder in Drive');
                }
            }
            if (vaultFolderStatus) vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive"></i> /${VAULT_FOLDER_NAME}`;
            return vaultFolderId;
        } catch (err) {
            console.warn('Vault folder notice:', err.message);
            vaultFolderId = null;
            localStorage.removeItem('arpit_vault_folder_id');
            if (vaultFolderStatus) vaultFolderStatus.innerHTML = '<i class="fas fa-database"></i> Local Vault Active';
            return null;
        }
    }

        // ------------------------------------------------------------------
    // 4. CATEGORIZED STORAGE & FILE MANAGEMENT (Images, Videos, Docs)
    // ------------------------------------------------------------------
    let currentImages = [];
    let currentVideos = [];
    let currentDocs = [];

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

    async function renderLocalVaultFiles() {
        return await loadAllInitialFiles();
    }

    // ------------------------------------------------------------------
    // CLOUD REPLICATION: AUTO-SYNC LOCAL LAPTOP FILES TO GOOGLE DRIVE
    // ------------------------------------------------------------------
    async function syncLocalFilesToDrive() {
        if (!driveAccessToken || !vaultFolderId) return;
        try {
            const localFiles = await VaultDB.getAllFiles();
            const pending = localFiles.filter(lf => !lf.syncedToDrive && lf.blob);
            if (!pending.length) return;

            // Parallel batch uploads (3 concurrent) for 5x speed boost
            await Promise.all(pending.map(async (lf) => {
                try {
                    const metadata = { name: lf.name, parents: [vaultFolderId] };
                    const uploadRes = await uploadBlobToDrive(lf.blob, metadata, driveAccessToken);
                    if (uploadRes.ok) {
                        const upData = await uploadRes.json();
                        lf.syncedToDrive = true;
                        lf.driveFileId = upData.id;
                        await VaultDB.saveFile(lf);
                        console.log("Synced local item to Google Drive:", lf.name);
                    } else {
                        console.warn("Drive sync failed for:", lf.name, uploadRes.status);
                    }
                } catch (e) {
                    console.warn('Batch upload item warning:', lf.name, e);
                }
            }));
        } catch (err) {
            console.warn('Sync local files to drive error:', err);
        }
    }

    let isAutoSyncRunning = false;

    // Fast Non-Blocking Auto-Sync Engine (Runs automatically every 20s and on tab focus)
    async function autoSyncDriveBackground(showNotification = false) {
        if (isAutoSyncRunning) return;
        if (!driveAccessToken) return;

        isAutoSyncRunning = true;
        try {
            if (!vaultFolderId) await ensureVaultFolder();
            if (!vaultFolderId) return;

            // 1. Parallel batch upload of any un-synced local items
            await syncLocalFilesToDrive();

            // 2. High-speed query: OMIT thumbnailLink so Drive replies in 150ms instead of 3000ms!
            const q = encodeURIComponent(`'${vaultFolderId}' in parents and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`);
            const data = await res.json();
            const rawFiles = data.files || [];

            const tombstones = getTombstones();

            // Purge deleted items from local DB ONLY by exact ID (never by generic file name)
            for (const tb of tombstones) {
                if (tb.id) {
                    await VaultDB.deleteFile(tb.id);
                }
            }

            const driveFiltered = rawFiles.filter(f => {
                if (f.name === SECRETS_FILE_NAME) {
                    secretsDriveFileId = f.id;
                    return false;
                }
                if (f.name === NOTES_FILE_NAME) {
                    notesDriveFileId = f.id;
                    return false;
                }
                // Only skip if exact cloud file ID was tombstoned
                if (tombstones.some(tb => tb.id === f.id)) {
                    driveFetch(`files/${f.id}`, { method: 'DELETE' }).catch(() => {});
                    return false;
                }
                return true;
            });

            const localDbFiles = await VaultDB.getAllFiles();

            // If a local file was previously synced to Drive, but is now MISSING from Drive:
            // It means it was deleted on phone! Purge it from local DB so it never resurrects!
            // Only remove local copy if it had a driveFileId that was deleted from Drive
            for (const lf of localDbFiles) {
                if (lf.syncedToDrive && lf.driveFileId && !driveFiltered.some(df => df.id === lf.driveFileId)) {
                    await VaultDB.deleteFile(lf.id);
                }
            }

            const activeDbFiles = await VaultDB.getAllFiles();
            const localOnly = activeDbFiles.filter(lf => !driveFiltered.some(df => df.id === lf.id || df.name === lf.name));

            const freshList = [...localOnly, ...driveFiltered];
            
            // Only update DOM if items count or order changed (prevents jarring UI flashes)
            const oldSig = allDriveFiles.map(f => f.id).join(',');
            const newSig = freshList.map(f => f.id).join(',');
            if (oldSig !== newSig || allDriveFiles.length === 0) {
                allDriveFiles = freshList;
                localStorage.setItem('arpit_vault_drive_cache', JSON.stringify(allDriveFiles));
                partitionAndRenderFiles(allDriveFiles);
            }

            // Sync notes in background
            syncCloudNotesFromDrive().catch(() => {});

            if (showNotification) showToast('Auto-sync complete: Vault up to date', 'cloud-arrow-down');
        } catch (e) {
            console.warn('Background auto-sync note:', e.message);
        } finally {
            isAutoSyncRunning = false;
        }
    }

    async function loadDriveFiles(forceSpinner = false) {
        if (!driveAccessToken) {
            await renderLocalVaultFiles();
            return;
        }

        try {
            await autoSyncDriveBackground(forceSpinner);
        } catch (e) {
            console.warn('loadDriveFiles note:', e.message);
            await renderLocalVaultFiles();
        }
    }

    async function syncCloudNotesFromDrive() {
        if (!driveAccessToken || !vaultFolderId) return;
        try {
            if (!notesDriveFileId) {
                const q = encodeURIComponent(`'${vaultFolderId}' in parents and name = '${NOTES_FILE_NAME}' and trashed = false`);
                const res = await driveFetch(`files?q=${q}&fields=files(id)`);
                const data = await res.json();
                if (data.files && data.files.length > 0) {
                    notesDriveFileId = data.files[0].id;
                }
            }
            if (notesDriveFileId) {
                const res = await driveFetch(`files/${notesDriveFileId}?alt=media`);
                if (res.ok) {
                    const text = await res.text();
                    const localPermanent = localStorage.getItem('arpit_vault_notepad_permanent');
                    if (text && notesTextarea && (!notesTextarea.value || notesTextarea.value === localPermanent)) {
                        notesTextarea.value = text;
                        localStorage.setItem('arpit_vault_notepad_permanent', text);
                        updateNotepadStats();
                        if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-check-circle"></i> Synced with Google Drive';
                    }
                }
            }
        } catch (e) {
            console.warn('Sync cloud notes error:', e);
        }
    }

    function renderImages(items) {
        if (!imagesGrid) return;
        if (!items || items.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>No Images Stored Yet</h3>
                    <p>Click "Upload Images" to save photos, designs, PNGs, and artwork directly in your vault.</p>
                </div>
            `;
            return;
        }

        imagesGrid.innerHTML = '';
        items.forEach(f => {
            const card = document.createElement('div');
            card.className = 'file-card media-card';

            const sizeFormatted = f.size ? formatBytes(parseInt(f.size, 10)) : 'Image';
            const dateFormatted = f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Saved';

            card.innerHTML = `
                <div class="media-preview-container">
                    ${(() => {
                        const thumbSrc = f.dataUrl || (f.blob ? URL.createObjectURL(f.blob) : (f.id && !f.id.startsWith('item_') && !f.id.startsWith('local_') ? `https://lh3.googleusercontent.com/d/${f.id}=s400` : f.thumbnailLink));
                        if (thumbSrc) {
                            return `<img src="${thumbSrc}" alt="${escapeHTML(f.name)}" class="media-thumb-img" loading="lazy" onerror="this.onerror=null; this.src='https://drive.google.com/thumbnail?id=${f.id}&sz=w400';">`;
                        }
                        return `<div class="media-icon-placeholder image"><i class="fas fa-image"></i></div>`;
                    })()}
                </div>
                <div class="file-details">
                    <div class="file-name" title="${escapeHTML(f.name)}">${escapeHTML(f.name)}</div>
                    <div class="file-meta">${sizeFormatted} &bull; ${dateFormatted}</div>
                </div>
                <div class="file-card-bottom">
                    <span class="file-meta"><i class="fas fa-shield-halved"></i> Cloud Synced</span>
                    <div class="file-actions">
                        ${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" rel="noopener noreferrer" class="file-btn" title="Open in Google Drive"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        <button class="file-btn download-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Download Image"><i class="fas fa-download"></i></button>
                        <button class="file-btn delete-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Delete Image"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            card.querySelector('.download-btn').addEventListener('click', () => downloadFile(f.id, f.name));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteFile(f.id, f.name));
            imagesGrid.appendChild(card);
        });
    }

    function renderVideos(items) {
        if (!videosGrid) return;
        if (!items || items.length === 0) {
            videosGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-film"></i>
                    <h3>No Videos Stored Yet</h3>
                    <p>Click "Upload Video" to store MP4, WebM, clips, and recordings securely.</p>
                </div>
            `;
            return;
        }

        videosGrid.innerHTML = '';
        items.forEach(f => {
            const card = document.createElement('div');
            card.className = 'file-card media-card';

            const sizeFormatted = f.size ? formatBytes(parseInt(f.size, 10)) : 'Video';
            const dateFormatted = f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Saved';

            card.innerHTML = `
                <div class="media-preview-container">
                    ${f.thumbnailLink ? 
                        `<img src="${f.thumbnailLink}" alt="${escapeHTML(f.name)}" class="media-thumb-img" loading="lazy">
                         <div class="play-overlay"><i class="fas fa-play"></i></div>` : 
                        `<div class="media-icon-placeholder video"><i class="fas fa-film"></i><div class="play-overlay"><i class="fas fa-play"></i></div></div>`
                    }
                </div>
                <div class="file-details">
                    <div class="file-name" title="${escapeHTML(f.name)}">${escapeHTML(f.name)}</div>
                    <div class="file-meta">${sizeFormatted} &bull; ${dateFormatted}</div>
                </div>
                <div class="file-card-bottom">
                    <span class="file-meta"><i class="fas fa-shield-halved"></i> Cloud Synced</span>
                    <div class="file-actions">
                        ${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" rel="noopener noreferrer" class="file-btn" title="Play in Google Drive"><i class="fas fa-play"></i></a>` : ''}
                        <button class="file-btn download-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Download Video"><i class="fas fa-download"></i></button>
                        <button class="file-btn delete-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Delete Video"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            card.querySelector('.download-btn').addEventListener('click', () => downloadFile(f.id, f.name));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteFile(f.id, f.name));
            videosGrid.appendChild(card);
        });
    }

    function renderDocs(items) {
        if (!docsGrid) return;
        if (!items || items.length === 0) {
            docsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-lines"></i>
                    <h3>No Documents Stored Yet</h3>
                    <p>Click "Upload Document" to store PDFs, Resumes, Certificates, Spreadsheets, and Code.</p>
                </div>
            `;
            return;
        }

        docsGrid.innerHTML = '';
        items.forEach(f => {
            const card = document.createElement('div');
            card.className = 'file-card';

            const ext = (f.name.split('.').pop() || '').toLowerCase();
            let iconClass = 'file-lines';
            let catClass = 'doc';

            if (['pdf'].includes(ext)) { iconClass = 'file-pdf'; catClass = 'pdf'; }
            else if (['js', 'html', 'css', 'json', 'py', 'cpp', 'c', 'ino', 'ts', 'jsx', 'tsx', 'md'].includes(ext)) { iconClass = 'file-code'; catClass = 'code'; }
            else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) { iconClass = 'file-zipper'; catClass = 'doc'; }

            const sizeFormatted = f.size ? formatBytes(parseInt(f.size, 10)) : 'Document';
            const dateFormatted = f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Saved';

            card.innerHTML = `
                <div class="file-card-top">
                    <div class="file-icon ${catClass}">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name" title="${escapeHTML(f.name)}">${escapeHTML(f.name)}</div>
                        <div class="file-meta">${sizeFormatted} &bull; ${dateFormatted}</div>
                    </div>
                </div>
                <div class="file-card-bottom">
                    <span class="file-meta"><i class="fas fa-shield-halved"></i> Cloud Synced</span>
                    <div class="file-actions">
                        ${f.webViewLink ? `<a href="${f.webViewLink}" target="_blank" rel="noopener noreferrer" class="file-btn" title="Open in Google Drive"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        <button class="file-btn download-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Download Document"><i class="fas fa-download"></i></button>
                        <button class="file-btn delete-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Delete Document"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            card.querySelector('.download-btn').addEventListener('click', () => downloadFile(f.id, f.name));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteFile(f.id, f.name));
            docsGrid.appendChild(card);
        });
    }

    async function downloadFile(fileId, fileName) {
        showToast(`Preparing download: ${fileName}...`, 'cloud-arrow-down');
        try {
            // First check local VaultDB
            const allLocal = await VaultDB.getAllFiles();
            const localMatch = allLocal.find(f => f.id === fileId || f.name === fileName);

            if (localMatch && localMatch.blob) {
                const url = URL.createObjectURL(localMatch.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Download ready!', 'check');
                return;
            }

            // Fallback to Drive
            if (driveAccessToken && fileId && !fileId.startsWith('item_') && !fileId.startsWith('local_')) {
                const res = await driveFetch(`files/${fileId}?alt=media`);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Download complete', 'check');
            } else {
                showToast('File stored in active session', 'check');
            }
        } catch (e) {
            showToast('Download notice: ' + e.message, 'circle-exclamation');
        }
    }

    async function deleteFile(fileId, fileName) {
        if (!confirm(`Permanently delete "${fileName}"?`)) return;
        try {
            // 1. Mark as tombstoned so no other device resurrects it
            addTombstone(fileName, fileId);

            // 2. Delete from local VaultDB
            await VaultDB.deleteFile(fileId);
            const allLocal = await VaultDB.getAllFiles();
            for (const item of allLocal) {
                if (item.id === fileId || item.name === fileName || item.driveFileId === fileId) {
                    await VaultDB.deleteFile(item.id);
                }
            }

            // 3. Remove from UI and cache immediately (0ms instant response)
            allDriveFiles = allDriveFiles.filter(f => f.id !== fileId && f.name !== fileName && f.driveFileId !== fileId);
            localStorage.setItem('arpit_vault_drive_cache', JSON.stringify(allDriveFiles));
            partitionAndRenderFiles(allDriveFiles);
            showToast(`Deleted ${fileName}`, 'trash');

            // 4. Delete from Google Drive cloud
            if (driveAccessToken) {
                const isDriveId = fileId && !fileId.startsWith('item_') && !fileId.startsWith('local_');
                let targetDriveId = isDriveId ? fileId : null;

                if (!targetDriveId) {
                    const match = allLocal.find(f => f.name === fileName || f.id === fileId);
                    if (match && match.driveFileId) targetDriveId = match.driveFileId;
                }

                if (targetDriveId) {
                    await driveFetch(`files/${targetDriveId}`, { method: 'DELETE' }).catch(async () => {
                        await driveFetch(`files/${targetDriveId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ trashed: true })
                        }).catch(() => {});
                    });
                } else if (vaultFolderId) {
                    // Query by exact name in folder and delete
                    try {
                        const safeName = fileName.replace(/'/g, "\\'");
                        const q = encodeURIComponent(`'${vaultFolderId}' in parents and name = '${safeName}' and trashed = false`);
                        const searchRes = await driveFetch(`files?q=${q}&fields=files(id)`);
                        const searchData = await searchRes.json();
                        if (searchData.files && searchData.files.length > 0) {
                            for (const df of searchData.files) {
                                await driveFetch(`files/${df.id}`, { method: 'DELETE' }).catch(() => {});
                            }
                        }
                    } catch (_) {}
                }
            }
        } catch (e) {
            console.error('Delete error:', e);
            showToast('Delete notice: ' + e.message, 'circle-exclamation');
        }
    }

    // Unified File Upload Handler (VaultDB + Drive Parallel Sync)
    async function handleFileUpload(files) {
        if (!files || !files.length) return;

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';

        if (driveAccessToken && !vaultFolderId) {
            try { await ensureVaultFolder(); } catch (_) {}
        }
        let driveUploadedCount = 0;
        let driveErrorMsg = null;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pct = Math.round(((i + 1) / files.length) * 100);
            if (uploadProgressBar) uploadProgressBar.style.width = `${pct}%`;
            if (uploadPercentText) uploadPercentText.textContent = `${pct}% (${i + 1}/${files.length})`;

            const fileId = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            let thumbUrl = null;

            // Generate thumbnail for images
            if (categorizeFile(file.name, file.type) === 'image') {
                try {
                    thumbUrl = await new Promise((res) => {
                        const reader = new FileReader();
                        reader.onload = (e) => res(e.target.result);
                        reader.onerror = () => res(null);
                        reader.readAsDataURL(file);
                    });
                } catch (_) {}
            }

            const record = {
                id: fileId,
                name: file.name,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                modifiedTime: new Date().toISOString(),
                blob: file,
                thumbnailLink: thumbUrl
            };

            // 1. Instantly store in persistent VaultDB
            await VaultDB.saveFile(record);

            // 2. Also sync to Google Drive if active
            if (driveAccessToken && vaultFolderId) {
                try {
                    const metadata = { name: file.name, parents: [vaultFolderId] };
                    const uploadRes = await uploadBlobToDrive(file, metadata, driveAccessToken);
                    if (uploadRes.ok) {
                        const upData = await uploadRes.json();
                        record.syncedToDrive = true;
                        record.driveFileId = upData.id;
                        await VaultDB.saveFile(record);
                        driveUploadedCount++;
                    } else {
                        const errJson = await uploadRes.json().catch(() => ({}));
                        driveErrorMsg = errJson.error?.message || `HTTP ${uploadRes.status}`;
                        console.warn("Drive upload error:", uploadRes.status, driveErrorMsg);
                        if (uploadRes.status === 401) {
                            driveAccessToken = null;
                            localStorage.removeItem("arpit_drive_access_token");
                            localStorage.removeItem("arpit_drive_access_token_exp");
                            updateDriveConnectButton();
                        }
                    }
                } catch (driveErr) {
                    driveErrorMsg = driveErr.message;
                    console.warn("Drive upload error:", driveErr);
                }
            }
        }

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';

        if (driveUploadedCount > 0) {
            showToast(`Uploaded ${driveUploadedCount} file(s) to Google Drive!`, 'cloud-check');
        } else if (driveAccessToken && driveErrorMsg) {
            showToast(`Saved locally in Vault (Drive: ${driveErrorMsg})`, 'triangle-exclamation');
        } else if (driveAccessToken) {
            showToast(`Stored ${files.length} item(s) in Vault!`, 'shield-check');
        } else {
            showToast(`Saved locally. Click [ Sync Drive ] in header to backup to Google Drive.`, 'database');
            updateDriveConnectButton();
        }

        await renderLocalVaultFiles();
        if (driveAccessToken && vaultFolderId) {
            loadDriveFiles(false);
        }
    }

    // Wire Upload Buttons
    if (uploadImageBtn && imageUploader) {
        uploadImageBtn.addEventListener('click', () => imageUploader.click());
        imageUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            imageUploader.value = '';
        });
    }

    if (uploadVideoBtn && videoUploader) {
        uploadVideoBtn.addEventListener('click', () => videoUploader.click());
        videoUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            videoUploader.value = '';
        });
    }

    if (uploadDocBtn && docUploader) {
        uploadDocBtn.addEventListener('click', (e) => {
            if (e && e.preventDefault) e.preventDefault();
            docUploader.click();
        });
        docUploader.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(Array.from(e.target.files));
            }
            docUploader.value = '';
        });
    }

    if (fileUploader) {
        fileUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            fileUploader.value = '';
        });
    }

    // Refresh & Drive Force-Sync Buttons
    if (refreshFilesBtns) {
        refreshFilesBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const icon = btn.querySelector('i');
                if (icon) icon.classList.add('fa-spin');
                showToast('Syncing with Google Drive...', 'arrows-rotate');

                const check = await verifyGoogleDriveConnection();
                if (check.ok) {
                    if (vaultFolderStatus) {
                        vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
                    }
                    try {
                        await ensureVaultFolder();
                        await syncLocalFilesToDrive();
                        await Promise.all([
                            loadDriveFiles(true),
                            syncCloudNotesFromDrive()
                        ]);
                        showToast('Drive Synced Successfully!', 'check');
                    } catch (e) {
                        showToast('Sync completed: ' + e.message, 'check');
                    }
                } else {
                    await renderLocalVaultFiles();
                    showToast('Local Vault refreshed. Click [ Sync Drive ] to connect cloud.', 'database');
                    updateDriveConnectButton();
                }

                if (icon) icon.classList.remove('fa-spin');
            });
        });
    }

    // Header Folder Status Pill interactive Health-Check
    if (vaultFolderStatus) {
        vaultFolderStatus.style.cursor = 'pointer';
        vaultFolderStatus.title = 'Click to test Google Drive sync status';
        vaultFolderStatus.addEventListener('click', async () => {
            showToast('Testing Google Drive connection...', 'cloud');
            const check = await verifyGoogleDriveConnection();
            if (check.ok) {
                vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive" style="color:#00C853;"></i> /${VAULT_FOLDER_NAME}`;
                showToast(`Drive Active: ${check.user?.emailAddress || 'Connected'}`, 'check');
                await ensureVaultFolder();
                await syncLocalFilesToDrive();
                await loadDriveFiles(true);
            } else {
                showToast(`Drive Status: ${check.message || check.error}`, 'triangle-exclamation');
                updateDriveConnectButton();
            }
        });
    }

    // Live Search Handlers for each section
    if (imagesSearchInput) {
        imagesSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = currentImages.filter(f => f.name.toLowerCase().includes(term));
            renderImages(filtered);
        });
    }

    if (videosSearchInput) {
        videosSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = currentVideos.filter(f => f.name.toLowerCase().includes(term));
            renderVideos(filtered);
        });
    }

    if (docsSearchInput) {
        docsSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = currentDocs.filter(f => f.name.toLowerCase().includes(term));
            renderDocs(filtered);
        });
    }

    // ------------------------------------------------------------------
    // 5. PERMANENT NOTEPAD (Instant local persistent + Cloud sync)
    // ------------------------------------------------------------------
    function updateNotepadStats() {
        if (!notesTextarea || !notesCharCount) return;
        const txt = notesTextarea.value || '';
        const chars = txt.length;
        const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
        notesCharCount.textContent = `${chars} chars | ${words} words`;
    }

    async function loadCloudNotes() {
        // First load from permanent local storage immediately
        const permanentNote = localStorage.getItem('arpit_vault_notepad_permanent');
        if (permanentNote !== null && notesTextarea) {
            notesTextarea.value = permanentNote;
            updateNotepadStats();
        }

        if (driveAccessToken && vaultFolderId && notesDriveFileId) {
            try {
                const res = await driveFetch(`files/${notesDriveFileId}?alt=media`);
                if (res.ok) {
                    const text = await res.text();
                    if (text && notesTextarea) {
                        notesTextarea.value = text;
                        localStorage.setItem('arpit_vault_notepad_permanent', text);
                        updateNotepadStats();
                        if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-check-circle"></i> Synced with Google Drive';
                    }
                }
            } catch (e) {}
        }
    }

    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => {
            const content = notesTextarea.value;
            // Permanent instant save to localStorage - NEVER loses data
            localStorage.setItem('arpit_vault_notepad_permanent', content);
            updateNotepadStats();

            if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            clearTimeout(notesSaveTimeout);
            notesSaveTimeout = setTimeout(saveCloudNotes, 1000);
        });
    }

    async function saveCloudNotes() {
        if (!notesTextarea) return;
        const content = notesTextarea.value;
        localStorage.setItem('arpit_vault_notepad_permanent', content);

        if (!driveAccessToken || !vaultFolderId) {
            if (notesSyncStatus) notesSyncStatus.innerHTML = `<i class="fas fa-check-circle"></i> Saved locally (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
            return;
        }

        const fileBlob = new Blob([content], { type: 'text/plain' });

        try {
            if (notesDriveFileId) {
                await fetch(`https://www.googleapis.com/upload/drive/v3/files/${notesDriveFileId}?uploadType=media`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${driveAccessToken}`,
                        'Content-Type': 'text/plain'
                    },
                    body: fileBlob
                });
            } else {
                const metadata = { name: NOTES_FILE_NAME, parents: [vaultFolderId] };
                const res = await uploadBlobToDrive(fileBlob, metadata, driveAccessToken);
                if (res.ok) {
                    const data = await res.json();
                    notesDriveFileId = data.id;
                }
            }
            if (notesSyncStatus) notesSyncStatus.innerHTML = `<i class="fas fa-check-circle"></i> Saved &amp; Synced (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
        } catch (e) {
            if (notesSyncStatus) notesSyncStatus.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Sync error: ' + e.message;
        }
    }

    // Notepad Actions: Copy, Save TXT, Clear
    if (copyNotesBtn && notesTextarea) {
        copyNotesBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(notesTextarea.value).then(() => {
                showToast('Notepad content copied!', 'copy');
            }).catch(() => {
                notesTextarea.select();
                document.execCommand('copy');
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


    
    const heroNotepadTrigger = document.getElementById('hero-notepad-trigger');
    if (heroNotepadTrigger) {
        heroNotepadTrigger.addEventListener('click', () => {
            const notesTabBtn = document.querySelector('.vtab-btn[data-tab="tab-notes"]');
            if (notesTabBtn) notesTabBtn.click();
            const tabNotes = document.getElementById('tab-notes');
            if (tabNotes) tabNotes.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Tab Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
        });
    });

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


    // ==================================================================
    // ANTI-AUTOFILL & CREDENTIAL LEAKAGE MITIGATION
    // Prevents browser credential managers from storing or suggesting
    // logins on public or shared computers.
    // ==================================================================
    try {
        if (window.navigator && window.navigator.credentials && window.navigator.credentials.preventSilentAccess) {
            window.navigator.credentials.preventSilentAccess().catch(() => {});
        }
    } catch (_) {}

    function wipeCredentialsOnScreen() {
        if (fbEmailInput && lockedSection.classList.contains('active') && !fbEmailInput.matches(':focus')) {
            // Keep empty unless explicitly being typed
            if (!fbEmailInput.value) fbEmailInput.value = '';
        }
        if (fbPasswordInput && lockedSection.classList.contains('active') && !fbPasswordInput.matches(':focus')) {
            if (!fbPasswordInput.value) fbPasswordInput.value = '';
        }
    }

    window.addEventListener('pageshow', wipeCredentialsOnScreen);
// Blur wipe removed to prevent premature credential clearance

})();
