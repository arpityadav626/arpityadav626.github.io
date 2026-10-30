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

        // ------------------------------------------------------------------
    // 4. CATEGORIZED STORAGE & FILE MANAGEMENT (Images, Videos, Docs)
    // ------------------------------------------------------------------
    let currentImages = [];
    let currentVideos = [];
    let currentDocs = [];

    function categorizeFile(filename, mimeType = '') {
        const ext = (filename.split('.').pop() || '').toLowerCase();
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

    function renderLocalVaultFiles() {
        const stored = JSON.parse(localStorage.getItem('arpit_vault_local_files_meta') || '[]');
        partitionAndRenderFiles(stored);
    }

    async function loadDriveFiles() {
        if (!vaultFolderId || !driveAccessToken) return;

        if (imagesGrid) imagesGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Syncing images...</div>';
        if (videosGrid) videosGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Syncing videos...</div>';
        if (docsGrid) docsGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Syncing documents...</div>';

        try {
            const q = encodeURIComponent(`'${vaultFolderId}' in parents and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,thumbnailLink)&orderBy=modifiedTime desc`);
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

            partitionAndRenderFiles(allDriveFiles);
        } catch (err) {
            console.error('Failed to load drive files:', err);
            renderLocalVaultFiles();
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
                    ${f.thumbnailLink ? 
                        `<img src="${f.thumbnailLink}" alt="${escapeHTML(f.name)}" class="media-thumb-img" loading="lazy">` : 
                        `<div class="media-icon-placeholder image"><i class="fas fa-image"></i></div>`
                    }
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

    // Unified File Upload Handler
    async function handleFileUpload(files) {
        if (!files || !files.length) return;

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pct = Math.round(((i + 1) / files.length) * 100);
            if (uploadProgressBar) uploadProgressBar.style.width = `${pct}%`;
            if (uploadPercentText) uploadPercentText.textContent = `${pct}% (${i + 1}/${files.length})`;

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
                    mimeType: file.type,
                    modifiedTime: new Date().toISOString()
                });
                localStorage.setItem('arpit_vault_local_files_meta', JSON.stringify(localMeta));
            }
        }

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
        showToast(`Stored ${files.length} item(s) in Vault!`, 'cloud-arrow-up');

        if (driveAccessToken && vaultFolderId) {
            await loadDriveFiles();
        } else {
            renderLocalVaultFiles();
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
        uploadDocBtn.addEventListener('click', () => docUploader.click());
        docUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            docUploader.value = '';
        });
    }

    if (fileUploader) {
        fileUploader.addEventListener('change', (e) => {
            handleFileUpload(Array.from(e.target.files));
            fileUploader.value = '';
        });
    }

    // Refresh Buttons
    if (refreshFilesBtns) {
        refreshFilesBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (driveAccessToken && vaultFolderId) loadDriveFiles();
                else renderLocalVaultFiles();
            });
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
