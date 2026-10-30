/* ======================================================================
   ARPIT VAULT — GOOGLE DRIVE & CLIENT-SIDE AES-256 VAULT ENGINE
   ====================================================================== */

(function () {
    'use strict';

    // CONFIGURATION
    const CLIENT_ID = '162159968578-oh5f0jh1rot9e9b4n59uj8lt05tdgbro.apps.googleusercontent.com';
    const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    const VAULT_FOLDER_NAME = 'Arpit_Dev_Vault';
    const SECRETS_FILE_NAME = 'vault_secrets.enc';
    const NOTES_FILE_NAME = 'vault_scratchpad.txt';

    // APP STATE
    let tokenClient = null;
    let accessToken = localStorage.getItem('arpit_vault_token') || null;
    let tokenExpiry = localStorage.getItem('arpit_vault_token_exp') || 0;
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
    const googleLoginBtn = document.getElementById('google-login-btn');
    const authHeaderBtnWrap = document.getElementById('auth-header-btn-wrap');
    const loginStatusMsg = document.getElementById('login-status-msg');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const vaultFolderStatus = document.getElementById('vault-folder-status');

    // Tabs
    const tabButtons = document.querySelectorAll('.vtab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Files Tab
    const filesGrid = document.getElementById('files-grid');
    const fileUploader = document.getElementById('file-uploader');
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

    // ------------------------------------------------------------------
    // 1. NOTIFICATION TOAST HELPER
    // ------------------------------------------------------------------
    function showToast(msg, icon = 'info') {
        if (!toastEl) return;
        toastEl.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
        toastEl.classList.add('active');
        setTimeout(() => toastEl.classList.remove('active'), 3500);
    }

    // ------------------------------------------------------------------
    // 2. GOOGLE OAUTH 2.0 TOKEN CLIENT SETUP
    // ------------------------------------------------------------------
    function initGoogleAuth() {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            setTimeout(initGoogleAuth, 300);
            return;
        }

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
                if (response.error) {
                    console.error('Google Auth Error:', response);
                    loginStatusMsg.className = 'status-msg error';
                    loginStatusMsg.textContent = 'Auth failed: ' + (response.error_description || response.error);
                    return;
                }

                accessToken = response.access_token;
                const expiresInMs = (parseInt(response.expires_in, 10) || 3600) * 1000;
                tokenExpiry = Date.now() + expiresInMs;

                localStorage.setItem('arpit_vault_token', accessToken);
                localStorage.setItem('arpit_vault_token_exp', tokenExpiry);

                loginStatusMsg.className = 'status-msg info';
                loginStatusMsg.textContent = 'Token acquired! Loading Drive environment...';

                onAuthenticated();
            }
        });

        // Check if existing valid token in localStorage
        if (accessToken && Date.now() < parseInt(tokenExpiry, 10)) {
            onAuthenticated();
        } else {
            showLockedView();
        }
    }

    googleLoginBtn.addEventListener('click', () => {
        if (!tokenClient) {
            showToast('Google API client is initializing. Please wait 2 seconds...', 'spinner fa-spin');
            return;
        }
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Opening Google Authorization dialog...';
        tokenClient.requestAccessToken({ prompt: 'consent' });
    });

    function logout() {
        accessToken = null;
        currentUser = null;
        masterKeyDerived = null;
        decryptedSecrets = [];
        localStorage.removeItem('arpit_vault_token');
        localStorage.removeItem('arpit_vault_token_exp');
        showLockedView();
        showToast('Vault locked & Session closed', 'shield-halved');
    }

    function showLockedView() {
        lockedSection.classList.add('active');
        unlockedDashboard.classList.remove('active');
        authHeaderBtnWrap.innerHTML = '';
        loginStatusMsg.textContent = '';
    }

    function showUnlockedView() {
        lockedSection.classList.remove('active');
        unlockedDashboard.classList.add('active');

        authHeaderBtnWrap.innerHTML = `
            <button class="action-btn outline-btn" id="logout-btn" title="Lock &amp; Sign Out">
                <i class="fas fa-arrow-right-from-bracket"></i> <span>Lock Vault</span>
            </button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
    }

    // ------------------------------------------------------------------
    // 3. POST-AUTH INITIALIZATION
    // ------------------------------------------------------------------
    async function onAuthenticated() {
        showUnlockedView();
        showToast('Google Drive Connected Successfully!', 'check-circle');

        // Fetch User Profile
        try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userRes.ok) {
                currentUser = await userRes.json();
                userName.textContent = currentUser.name || 'Arpit Yadav';
                userEmail.textContent = currentUser.email || '';
                if (currentUser.picture) {
                    userAvatar.src = currentUser.picture;
                    userAvatar.style.display = 'block';
                }
            }
        } catch (e) {
            console.warn('Could not fetch userinfo:', e);
        }

        // Initialize dedicated Vault folder in Drive
        await ensureVaultFolder();

        // Load files
        await loadDriveFiles();

        // Load Scratchpad
        await loadCloudNotes();
    }

    // ------------------------------------------------------------------
    // 4. GOOGLE DRIVE API INTEGRATION
    // ------------------------------------------------------------------
    async function driveFetch(endpoint, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, options);
        if (res.status === 401) {
            // Token expired
            logout();
            throw new Error('Session expired. Please sign in again.');
        }
        return res;
    }

    async function ensureVaultFolder() {
        vaultFolderStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating folder...';
        try {
            // Check if folder exists
            const q = encodeURIComponent(`name = '${VAULT_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name)`);
            const data = await res.json();

            if (data.files && data.files.length > 0) {
                vaultFolderId = data.files[0].id;
            } else {
                // Create dedicated folder
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
            vaultFolderStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Folder Sync Error';
        }
    }

    async function loadDriveFiles() {
        if (!vaultFolderId) return;
        filesGrid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Syncing files from Google Drive...</div>';

        try {
            const q = encodeURIComponent(`'${vaultFolderId}' in parents and trashed = false`);
            const res = await driveFetch(`files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)&orderBy=modifiedTime desc`);
            const data = await res.json();
            const rawFiles = data.files || [];

            // Filter out system files like secrets and scratchpad
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
            filesGrid.innerHTML = `<div class="empty-state"><i class="fas fa-circle-exclamation"></i><p>Failed to sync files: ${err.message}</p></div>`;
        }
    }

    function renderFiles(files) {
        if (!files || files.length === 0) {
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Your Drive Vault is Ready</h3>
                    <p>Upload PDFs, Resumes, Certificates, and Images to store them directly in your Google Drive.</p>
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

            const sizeFormatted = f.size ? formatBytes(parseInt(f.size, 10)) : 'File';
            const dateFormatted = new Date(f.modifiedTime).toLocaleDateString();

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
                    <span class="file-meta"><i class="fab fa-google-drive"></i> Synced</span>
                    <div class="file-actions">
                        <a href="${f.webViewLink}" target="_blank" rel="noopener noreferrer" class="file-btn" title="Open in Google Drive">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button class="file-btn download-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Direct Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="file-btn delete-btn" data-id="${f.id}" data-name="${escapeHTML(f.name)}" title="Move to Trash">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            // Download handler
            card.querySelector('.download-btn').addEventListener('click', () => downloadFile(f.id, f.name));

            // Delete handler
            card.querySelector('.delete-btn').addEventListener('click', () => deleteFile(f.id, f.name));

            filesGrid.appendChild(card);
        });
    }

    async function downloadFile(fileId, fileName) {
        showToast(`Preparing download: ${fileName}...`, 'cloud-arrow-down');
        try {
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
        } catch (e) {
            showToast('Download failed: ' + e.message, 'circle-exclamation');
        }
    }

    async function deleteFile(fileId, fileName) {
        if (!confirm(`Move "${fileName}" to Google Drive Trash?`)) return;
        try {
            await driveFetch(`files/${fileId}`, { method: 'DELETE' });
            showToast(`Deleted ${fileName}`, 'trash');
            await loadDriveFiles();
        } catch (e) {
            showToast('Delete failed: ' + e.message, 'circle-exclamation');
        }
    }

    // File Upload Handler (Multipart Upload to Drive)
    fileUploader.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !vaultFolderId) return;

        uploadProgressContainer.style.display = 'block';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pct = Math.round(((i + 1) / files.length) * 100);
            uploadProgressBar.style.width = `${pct}%`;
            uploadPercentText.textContent = `${pct}% (${i + 1}/${files.length})`;

            try {
                const metadata = {
                    name: file.name,
                    parents: [vaultFolderId]
                };

                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', file);

                await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    body: form
                });
            } catch (err) {
                console.error(`Error uploading ${file.name}:`, err);
            }
        }

        uploadProgressContainer.style.display = 'none';
        fileUploader.value = '';
        showToast(`Uploaded ${files.length} file(s) to Google Drive!`, 'cloud-check');
        await loadDriveFiles();
    });

    refreshFilesBtn.addEventListener('click', loadDriveFiles);

    // Search Files Filter
    fileSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            renderFiles(allDriveFiles);
            return;
        }
        const filtered = allDriveFiles.filter(f => f.name.toLowerCase().includes(term));
        renderFiles(filtered);
    });

    // ------------------------------------------------------------------
    // 5. CLIENT-SIDE AES-GCM ENCRYPTED SECRETS VAULT
    // ------------------------------------------------------------------
    // Web Crypto API helpers
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

        // Concatenate IV + Encrypted Data and encode as base64
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

    // Unlock Master Passphrase
    unlockSecretsBtn.addEventListener('click', async () => {
        const pass = masterPassphraseInput.value.trim();
        if (!pass) {
            showToast('Please enter a Master Passphrase', 'key');
            return;
        }

        try {
            // Fixed salt for local user master key derivation
            const salt = new TextEncoder().encode('arpit_yadav_vault_salt_v1');
            masterKeyDerived = await deriveKey(pass, salt);

            // Fetch secrets file from Drive if exists
            let rawCipher = null;
            if (secretsDriveFileId) {
                const res = await driveFetch(`files/${secretsDriveFileId}?alt=media`);
                if (res.ok) {
                    rawCipher = await res.text();
                }
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
                // New empty store
                decryptedSecrets = [];
            }

            secretsUnlockCard.style.display = 'none';
            secretsManagerWrap.style.display = 'block';
            masterPassphraseInput.value = '';
            renderSecrets(decryptedSecrets);
            secretsCount.textContent = decryptedSecrets.length;
            showToast('Secrets Vault Decrypted & Unlocked', 'unlock');
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

            // Reveal/Hide Toggle
            const toggleBtn = div.querySelector('.toggle-view-btn');
            const passSpan = div.querySelector(`#pass-val-${index}`);
            let revealed = false;
            toggleBtn.addEventListener('click', () => {
                revealed = !revealed;
                passSpan.innerHTML = revealed ? `<strong>${escapeHTML(item.secret)}</strong>` : maskedPass;
                toggleBtn.innerHTML = revealed ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            });

            // 1-Click Copy with auto-clear indication
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

            // Delete Secret
            div.querySelector('.delete-secret-btn').addEventListener('click', async () => {
                if (!confirm(`Delete credential "${item.title}"?`)) return;
                decryptedSecrets.splice(index, 1);
                await syncSecretsToDrive();
                renderSecrets(decryptedSecrets);
                secretsCount.textContent = decryptedSecrets.length;
            });

            secretsList.appendChild(div);
        });
    }

    async function syncSecretsToDrive() {
        if (!masterKeyDerived || !vaultFolderId) return;
        showToast('Encrypting & Syncing to Drive...', 'spinner fa-spin');

        try {
            const plain = JSON.stringify(decryptedSecrets);
            const cipher = await encryptData(plain, masterKeyDerived);

            const fileContent = new Blob([cipher], { type: 'text/plain' });

            if (secretsDriveFileId) {
                // Update existing
                await fetch(`https://www.googleapis.com/upload/drive/v3/files/${secretsDriveFileId}?uploadType=media`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'text/plain'
                    },
                    body: fileContent
                });
            } else {
                // Create new
                const metadata = {
                    name: SECRETS_FILE_NAME,
                    parents: [vaultFolderId]
                };
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', fileContent);

                const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    body: form
                });
                const data = await res.json();
                secretsDriveFileId = data.id;
            }
            showToast('Encrypted secrets stored safely in Drive!', 'shield-check');
        } catch (err) {
            console.error('Sync secrets error:', err);
            showToast('Sync error: ' + err.message, 'circle-exclamation');
        }
    }

    // Modal Events
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

        await syncSecretsToDrive();
        renderSecrets(decryptedSecrets);
        secretsCount.textContent = decryptedSecrets.length;
        closeSecretModal();
    });

    // Search Secrets Filter
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
    // 6. CLOUD SCRATCHPAD / QUICK NOTES
    // ------------------------------------------------------------------
    async function loadCloudNotes() {
        if (!vaultFolderId) return;
        try {
            if (notesDriveFileId) {
                const res = await driveFetch(`files/${notesDriveFileId}?alt=media`);
                if (res.ok) {
                    const text = await res.text();
                    notesTextarea.value = text;
                    notesSyncStatus.textContent = 'Synced with Google Drive';
                }
            }
        } catch (e) {
            console.warn('Could not load scratchpad notes:', e);
        }
    }

    notesTextarea.addEventListener('input', () => {
        notesSyncStatus.textContent = 'Saving changes...';
        clearTimeout(notesSaveTimeout);
        notesSaveTimeout = setTimeout(saveCloudNotes, 1200);
    });

    async function saveCloudNotes() {
        if (!vaultFolderId) return;
        const content = notesTextarea.value;
        const fileBlob = new Blob([content], { type: 'text/plain' });

        try {
            if (notesDriveFileId) {
                await fetch(`https://www.googleapis.com/upload/drive/v3/files/${notesDriveFileId}?uploadType=media`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'text/plain'
                    },
                    body: fileBlob
                });
            } else {
                const metadata = {
                    name: NOTES_FILE_NAME,
                    parents: [vaultFolderId]
                };
                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', fileBlob);

                const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    body: form
                });
                const data = await res.json();
                notesDriveFileId = data.id;
            }
            notesSyncStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
        } catch (e) {
            notesSyncStatus.textContent = 'Sync error: ' + e.message;
        }
    }

    // ------------------------------------------------------------------
    // 7. UTILS & TAB NAVIGATION
    // ------------------------------------------------------------------
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

    // Start Auth Loop
    initGoogleAuth();
})();
