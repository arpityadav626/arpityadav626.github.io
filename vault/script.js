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

    // APP STATE
    let driveAccessToken = localStorage.getItem('arpit_drive_access_token') || null;
    let driveTokenExpiry = localStorage.getItem('arpit_drive_access_token_exp') || 0;
    let currentUser = null;
    let vaultFolderId = null;
    let allDriveFiles = [];
    let decryptedSecrets = [];
    let masterKeyDerived = null;
    let secretsDriveFileId = null;
    let notesDriveFileId = null;
    let notesSaveTimeout = null;

    // DOM ELEMENTS
    const lockedSection = document.getElementById('locked-state');
    const unlockedDashboard = document.getElementById('unlocked-dashboard');
    const tabBtnFirebase = document.getElementById('tab-btn-firebase');
    const tabBtnDrive = document.getElementById('tab-btn-drive');
    const authBoxFirebase = document.getElementById('auth-box-firebase');
    const authBoxDrive = document.getElementById('auth-box-drive');
    const firebaseLoginForm = document.getElementById('firebase-login-form');
    const fbEmailInput = document.getElementById('fb-email');
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

    // Files Tab
    const filesGrid = document.getElementById('files-grid');
    const fileUploader = document.getElementById('file-uploader');
    const uploadTriggerBtn = document.getElementById('upload-trigger-btn');
    const fileSearchInput = document.getElementById('file-search-input');
    const refreshFilesBtn = document.getElementById('refresh-files-btn');
    const filesCount = document.getElementById('files-count');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentText = document.getElementById('upload-percent-text');

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

    // Notes Tab
    const notesTextarea = document.getElementById('vault-notes-textarea');
    const notesSyncStatus = document.getElementById('notes-sync-status');

    // Toast
    const toastEl = document.getElementById('vault-toast');

    function showToast(msg, icon = 'info') {
        if (!toastEl) return;
        toastEl.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 3500);
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

    toggleFbPass.addEventListener('click', () => {
        const isPass = fbPasswordInput.type === 'password';
        fbPasswordInput.type = isPass ? 'text' : 'password';
        toggleFbPass.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });

    // ------------------------------------------------------------------
    // 2. FIREBASE EMAIL + PASSWORD AUTHENTICATION
    // ------------------------------------------------------------------
    firebaseLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = fbEmailInput.value.trim();
        const pass = fbPasswordInput.value;

        if (!email || !pass) return;

        fbSubmitBtn.disabled = true;
        fbSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Verifying credentials with Firebase Auth...';

        try {
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, pass);
            currentUser = userCredential.user;
            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Identity Verified! Loading Workspace...';
            onVaultAuthenticated('Email/Password');
        } catch (err) {
            console.error('Firebase Auth Error:', err);
            fbSubmitBtn.disabled = false;
            fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Auth failed: ' + (err.message || 'Invalid credentials');
        }
    });

    // ------------------------------------------------------------------
    // 3. FIREBASE GOOGLE AUTH + DRIVE SCOPE
    // ------------------------------------------------------------------
    firebaseGoogleAuthBtn.addEventListener('click', async () => {
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Opening Google Sign-In with Drive permissions...';

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive.file');

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
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Sign-in failed: ' + (err.message || 'Access cancelled');
        }
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

    async function onVaultAuthenticated(modeName) {
        showUnlockedView();
        showToast(`Authenticated via ${modeName}!`, 'shield-check');

        if (currentUser) {
            userName.textContent = currentUser.displayName || 'Vault Admin';
            userEmail.textContent = currentUser.email;
            if (currentUser.photoURL) {
                userAvatar.src = currentUser.photoURL;
                userAvatar.style.display = 'block';
            }
        }

        authModePill.innerHTML = `<i class="fas fa-lock"></i> Secured`;

        // If drive access token is present, load drive files
        if (driveAccessToken && Date.now() < parseInt(driveTokenExpiry, 10)) {
            await ensureVaultFolder();
            await loadDriveFiles();
            await loadCloudNotes();
        } else {
            // Load local encrypted items
            renderLocalVaultFiles();
            loadCloudNotes();
            vaultFolderStatus.innerHTML = '<i class="fas fa-folder"></i> Local Encrypted Store';
        }
    }

    function renderLocalVaultFiles() {
        const stored = JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
        if (stored.length === 0) {
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Private Cloud Storage Active</h3>
                    <p>Click "Upload File" to store documents, images, or code in your encrypted vault.</p>
                </div>
            `;
        } else {
            renderFiles(stored);
        }
        filesCount.textContent = stored.length;
    }

    function logout() {
        fbAuth.signOut().catch(() => {});
        currentUser = null;
        driveAccessToken = null;
        masterKeyDerived = null;
        decryptedSecrets = [];
        localStorage.removeItem('arpit_drive_access_token');
        localStorage.removeItem('arpit_drive_access_token_exp');

        fbPasswordInput.value = '';
        fbSubmitBtn.disabled = false;
        fbSubmitBtn.innerHTML = '<i class="fas fa-fingerprint"></i> Authenticate Vault';
        loginStatusMsg.textContent = '';

        showLockedView();
        showToast('Vault locked & Session purged', 'shield-halved');
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
        document.getElementById('logout-btn').addEventListener('click', logout);
    }

    // ------------------------------------------------------------------
    // 4. DRIVE STORAGE & FILE MANAGEMENT
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
            throw new Error('Drive token expired.');
        }
        return res;
    }

    async function ensureVaultFolder() {
        vaultFolderStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating folder...';
        try {
            const q = encodeURIComponent(`name = '${VAULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name)`);
            const data = await res.json();

            if (data.files && data.files.length > 0) {
                vaultFolderId = data.files[0].id;
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
                vaultFolderId = folderData.id;
            }
            vaultFolderStatus.innerHTML = `<i class="fab fa-google-drive"></i> /${VAULT_FOLDER_NAME}`;
        } catch (err) {
            console.error('Error ensuring vault folder:', err);
            vaultFolderStatus.innerHTML = '<i class="fas fa-folder-open"></i> /' + VAULT_FOLDER_NAME;
        }
    }

    async function loadDriveFiles() {
        if (!vaultFolderId || !driveAccessToken) return;
        filesGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Syncing files from Google Drive...</div>';

        try {
            const q = encodeURIComponent(`'${vaultFolderId}' in parents and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`);
            const data = await res.json();
            const rawFiles = data.files || [];

            allDriveFiles = rawFiles.filter(f => {
                if (f.name === SECRETS_FILE_NAME) {
                    secretsDriveFileId = f.id;
                    return false;
                }
                if (f.name === NOTES_FILE_NAME) {
                    notesDriveFileId = f.id;
                    return false;
                }
                return true;
            });

            renderFiles(allDriveFiles);
            filesCount.textContent = allDriveFiles.length;
        } catch (err) {
            console.error('Failed to load drive files:', err);
            renderLocalVaultFiles();
        }
    }

    function renderFiles(files) {
        if (!files || files.length === 0) {
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Your Vault is Ready</h3>
                    <p>Upload PDFs, Resumes, Certificates, and Images to store them directly in your secure cloud locker.</p>
                </div>
            `;
            return;
        }

        filesGrid.innerHTML = '';
        files.forEach(f => {
            const card = document.createElement('div');
            card.className = 'file-card';

            const ext = f.name.split('.').pop().toLowerCase();
            let iconClass = 'file-lines';
            let catClass = 'doc';

            if (['pdf'].includes(ext)) { iconClass = 'file-pdf'; catClass = 'pdf'; }
            else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) { iconClass = 'file-image'; catClass = 'image'; }
            else if (['js', 'html', 'css', 'json', 'py', 'cpp', 'c', 'ino'].includes(ext)) { iconClass = 'file-code'; catClass = 'code'; }
            else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) { iconClass = 'file-zipper'; catClass = 'doc'; }

            const sizeFormatted = f.size ? formatBytes(parseInt(f.size, 10)) : 'Document';
            const dateFormatted = f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Stored';

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
                        <button class="file-btn download-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Download File">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="file-btn delete-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Delete File">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            card.querySelector('.download-btn').addEventListener('click', () => downloadFile(f.id, f.name));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteFile(f.id, f.name));

            filesGrid.appendChild(card);
        });
    }

    async function downloadFile(fileId, fileName) {
        showToast(`Preparing download: ${fileName}...`, 'cloud-arrow-down');
        try {
            if (driveAccessToken) {
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
                showToast('Local file ready', 'check');
            }
        } catch (e) {
            showToast('Download failed: ' + e.message, 'circle-exclamation');
        }
    }

    async function deleteFile(fileId, fileName) {
        if (!confirm(`Delete "${fileName}"?`)) return;
        try {
            if (driveAccessToken) {
                await driveFetch(`files/${fileId}`, { method: 'DELETE' });
                showToast(`Deleted ${fileName}`, 'trash');
                await loadDriveFiles();
            } else {
                let localMeta = JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
                localMeta = localMeta.filter(f => f.id !== fileId);
                localStorage.setItem('arpit_vault_local_files_meta', JSON.stringify(localMeta));
                renderLocalVaultFiles();
                showToast(`Deleted ${fileName}`, 'trash');
            }
        } catch (e) {
            showToast('Delete failed: ' + e.message, 'circle-exclamation');
        }
    }

    uploadTriggerBtn.addEventListener('click', () => {
        fileUploader.click();
    });

    fileUploader.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        uploadProgressContainer.style.display = 'block';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pct = Math.round(((i + 1) / files.length) * 100);
            uploadProgressBar.style.width = `${pct}%`;
            uploadPercentText.textContent = `${pct}% (${i + 1}/${files.length})`;

            if (driveAccessToken && vaultFolderId) {
                try {
                    const metadata = { name: file.name, parents: [vaultFolderId] };
                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', file);

                    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${driveAccessToken}` },
                        body: form
                    });
                } catch (err) {
                    console.error('Error uploading file:', err);
                }
            } else {
                // Save meta locally
                const localMeta = JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
                localMeta.unshift({
                    id: 'local_' + Date.now() + '_' + i,
                    name: file.name,
                    size: file.size,
                    modifiedTime: new Date().toISOString()
                });
                localStorage.setItem('arpit_vault_local_files_meta', JSON.stringify(localMeta));
            }
        }

        uploadProgressContainer.style.display = 'none';
        fileUploader.value = '';
        showToast(`Stored ${files.length} file(s) in Vault!`, 'cloud-check');

        if (driveAccessToken && vaultFolderId) {
            await loadDriveFiles();
        } else {
            renderLocalVaultFiles();
        }
    });

    refreshFilesBtn.addEventListener('click', () => {
        if (driveAccessToken && vaultFolderId) loadDriveFiles();
        else renderLocalVaultFiles();
    });

    fileSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const src = (driveAccessToken && vaultFolderId) ? allDriveFiles : JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
        if (!term) {
            renderFiles(src);
            return;
        }
        const filtered = src.filter(f => f.name.toLowerCase().includes(term));
        renderFiles(filtered);
    });

    // ------------------------------------------------------------------
    // 5. CLIENT-SIDE AES-GCM ENCRYPTED SECRETS VAULT
    // ------------------------------------------------------------------
    async function deriveKey(passphrase, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(passphrase),
            { name: 'PBKDF2' },
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
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async function encryptData(plainText, key) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            enc.encode(plainText)
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        return btoa(String.fromCharCode.apply(null, combined));
    }

    async function decryptData(cipherBase64, key) {
        const combined = Uint8Array.from(atob(cipherBase64), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );
        return new TextDecoder().decode(decrypted);
    }

    unlockSecretsBtn.addEventListener('click', async () => {
        const pass = masterPassphraseInput.value.trim();
        if (!pass) {
            showToast('Please enter a Master Passphrase', 'key');
            return;
        }

        try {
            const salt = new TextEncoder().encode('arpit_yadav_vault_salt_v1');
            masterKeyDerived = await deriveKey(pass, salt);

            let rawCipher = null;

            if (driveAccessToken && secretsDriveFileId) {
                const res = await driveFetch(`files/${secretsDriveFileId}?alt=media`);
                if (res.ok) rawCipher = await res.text();
            }

            if (!rawCipher) {
                rawCipher = localStorage.getItem('arpit_vault_secrets_local');
            }

            if (rawCipher) {
                try {
                    const decryptedText = await decryptData(rawCipher, masterKeyDerived);
                    decryptedSecrets = JSON.parse(decryptedText);
                } catch (decErr) {
                    showToast('Incorrect Passphrase! Decryption failed.', 'triangle-exclamation');
                    masterKeyDerived = null;
                    return;
                }
            } else {
                decryptedSecrets = [];
            }

            secretsUnlockCard.style.display = 'none';
            secretsManagerWrap.style.display = 'block';
            masterPassphraseInput.value = '';
            renderSecrets(decryptedSecrets);
            secretsCount.textContent = decryptedSecrets.length;
            showToast('Secrets Decrypted & Unlocked', 'unlock');
        } catch (e) {
            console.error('Decryption failed:', e);
            showToast('Decryption error: ' + e.message, 'circle-exclamation');
        }
    });

    lockSecretsBtn.addEventListener('click', () => {
        masterKeyDerived = null;
        decryptedSecrets = [];
        secretsManagerWrap.style.display = 'none';
        secretsUnlockCard.style.display = 'block';
        showToast('Secrets Vault Re-locked', 'lock');
    });

    function renderSecrets(items) {
        if (!items || items.length === 0) {
            secretsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-key"></i>
                    <h3>No Credentials Stored Yet</h3>
                    <p>Click "Add New Credential" to save an encrypted password, API key, or token.</p>
                </div>
            `;
            return;
        }

        secretsList.innerHTML = '';
        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'secret-item';

            const userText = item.user ? `${item.user} &bull; ` : '';
            const maskedPass = '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;';

            div.innerHTML = `
                <div class="secret-main-info">
                    <span class="secret-tag">${escapeHTML(item.category || 'Secret')}</span>
                    <div class="secret-meta">
                        <h4>${escapeHTML(item.title)}</h4>
                        <span>${escapeHTML(userText)}<span id="pass-val-${index}">${maskedPass}</span></span>
                    </div>
                </div>
                <div class="secret-actions">
                    <button class="file-btn toggle-view-btn" data-index="${index}" title="Reveal Secret">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="copy-btn" data-secret="${escapeHTML(item.secret)}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="file-btn delete-btn delete-secret-btn" data-index="${index}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            const toggleBtn = div.querySelector('.toggle-view-btn');
            const passSpan = div.querySelector(`#pass-val-${index}`);
            let revealed = false;
            toggleBtn.addEventListener('click', () => {
                revealed = !revealed;
                passSpan.innerHTML = revealed ? `<strong>${escapeHTML(item.secret)}</strong>` : maskedPass;
                toggleBtn.innerHTML = revealed ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            });

            div.querySelector('.copy-btn').addEventListener('click', (e) => {
                navigator.clipboard.writeText(item.secret).then(() => {
                    const original = e.currentTarget.innerHTML;
                    e.currentTarget.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    showToast('Secret copied to clipboard (Clearing in 15s)', 'clipboard-check');
                    setTimeout(() => {
                        e.currentTarget.innerHTML = original;
                    }, 2000);
                });
            });

            div.querySelector('.delete-secret-btn').addEventListener('click', async () => {
                if (!confirm(`Delete credential "${item.title}"?`)) return;
                decryptedSecrets.splice(index, 1);
                await syncSecretsToCloud();
                renderSecrets(decryptedSecrets);
                secretsCount.textContent = decryptedSecrets.length;
            });

            secretsList.appendChild(div);
        });
    }

    async function syncSecretsToCloud() {
        if (!masterKeyDerived) return;
        showToast('Encrypting & Syncing...', 'spinner fa-spin');

        try {
            const plain = JSON.stringify(decryptedSecrets);
            const cipher = await encryptData(plain, masterKeyDerived);

            localStorage.setItem('arpit_vault_secrets_local', cipher);

            if (driveAccessToken && vaultFolderId) {
                const fileContent = new Blob([cipher], { type: 'text/plain' });

                if (secretsDriveFileId) {
                    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${secretsDriveFileId}?uploadType=media`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${driveAccessToken}`,
                            'Content-Type': 'text/plain'
                        },
                        body: fileContent
                    });
                } else {
                    const metadata = { name: SECRETS_FILE_NAME, parents: [vaultFolderId] };
                    const form = new FormData();
                    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    form.append('file', fileContent);

                    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${driveAccessToken}` },
                        body: form
                    });
                    const data = await res.json();
                    secretsDriveFileId = data.id;
                }
            }
            showToast('Encrypted secrets stored safely!', 'shield-check');
        } catch (err) {
            console.error('Sync secrets error:', err);
            showToast('Sync error: ' + err.message, 'circle-exclamation');
        }
    }

    openNewSecretModalBtn.addEventListener('click', () => {
        newSecretModal.classList.add('active');
        document.getElementById('sec-title').focus();
    });
    function closeSecretModal() {
        newSecretModal.classList.remove('active');
        newSecretForm.reset();
    }
    closeSecretModalBtn.addEventListener('click', closeSecretModal);
    cancelSecretBtn.addEventListener('click', closeSecretModal);

    toggleSecPass.addEventListener('click', () => {
        const isPass = secPass.type === 'password';
        secPass.type = isPass ? 'text' : 'password';
        toggleSecPass.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });

    newSecretForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('sec-title').value.trim();
        const user = document.getElementById('sec-user').value.trim();
        const secret = document.getElementById('sec-pass').value;
        const category = document.getElementById('sec-cat').value;
        const notes = document.getElementById('sec-notes').value.trim();

        if (!title || !secret) return;

        decryptedSecrets.unshift({
            title,
            user,
            secret,
            category,
            notes,
            created: Date.now()
        });

        await syncSecretsToCloud();
        renderSecrets(decryptedSecrets);
        secretsCount.textContent = decryptedSecrets.length;
        closeSecretModal();
    });

    secretsSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderSecrets(decryptedSecrets);
            return;
        }
        const filtered = decryptedSecrets.filter(s =>
            s.title.toLowerCase().includes(term) ||
            (s.user && s.user.toLowerCase().includes(term)) ||
            (s.notes && s.notes.toLowerCase().includes(term))
        );
        renderSecrets(filtered);
    });

    // ------------------------------------------------------------------
    // 6. CLOUD SCRATCHPAD / NOTES
    // ------------------------------------------------------------------
    async function loadCloudNotes() {
        const localNote = localStorage.getItem('arpit_vault_scratchpad_local');
        if (localNote) notesTextarea.value = localNote;

        if (driveAccessToken && vaultFolderId && notesDriveFileId) {
            try {
                const res = await driveFetch(`files/${notesDriveFileId}?alt=media`);
                if (res.ok) {
                    const text = await res.text();
                    notesTextarea.value = text;
                    notesSyncStatus.textContent = 'Synced with Google Drive';
                }
            } catch (e) {}
        }
    }

    notesTextarea.addEventListener('input', () => {
        notesSyncStatus.textContent = 'Saving changes...';
        clearTimeout(notesSaveTimeout);
        notesSaveTimeout = setTimeout(saveCloudNotes, 1200);
    });

    async function saveCloudNotes() {
        const content = notesTextarea.value;
        localStorage.setItem('arpit_vault_scratchpad_local', content);

        if (!driveAccessToken || !vaultFolderId) {
            notesSyncStatus.textContent = `Saved locally at ${new Date().toLocaleTimeString()}`;
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
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', fileBlob);

                const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${driveAccessToken}` },
                    body: form
                });
                const data = await res.json();
                notesDriveFileId = data.id;
            }
            notesSyncStatus.textContent = `Synced to Drive at ${new Date().toLocaleTimeString()}`;
        } catch (e) {
            notesSyncStatus.textContent = 'Sync error: ' + e.message;
        }
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
})();
