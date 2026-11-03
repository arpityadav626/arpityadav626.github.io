/* ======================================================================
   ARPIT VAULT — ZERO-KNOWLEDGE HARDENED CLIENT ENGINE (v2.0)
   Features:
   - Zero Static Secrets (All interactions require fresh Firebase JWT)
   - Zero-Trust Backend (POST-only relay, server verifies token with Google)
   - Client-Side Zero-Knowledge Crypto (PBKDF2 600,000 + AES-256-GCM)
   - Client-Side File Encryption (Payload, filename, mimeType encrypted before upload)
   - Encrypted Notepad (E2E AES-GCM; no plaintext notes on cloud)
   - Strict In-Memory Session (No decrypted data in storage; instant wipe on lock)
   - XSS Hardened DOM (Safe DOM APIs, zero user-input innerHTML)
   - 3-Minute Auto-Lock + Tab Visibility/Blur Lock + Exponential Passphrase Cooldown
   ====================================================================== */

(function () {
    'use strict';

    // ------------------------------------------------------------------
    // PRODUCTION LOG SANITIZER (Prevents accidental token/key/data leaks)
    // ------------------------------------------------------------------
    const Log = {
        info(...args) {
            // Suppress verbose debug info in production
        },
        warn(...args) {
            console.warn('[Vault Security]', ...args);
        },
        error(...args) {
            console.error('[Vault Error]', args[0] || 'An unexpected operation error occurred.');
        }
    };

    // ------------------------------------------------------------------
    // CONSTANTS & CONFIGURATION
    // ------------------------------------------------------------------
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyAMMoUSW6BUvpNf0m9d8eHd3yT3MtNoV1w",
        authDomain: "arpit-portfolio-2026.firebaseapp.com",
        projectId: "arpit-portfolio-2026",
        storageBucket: "arpit-portfolio-2026.firebasestorage.app",
        messagingSenderId: "126845421146",
        appId: "1:126845421146:web:20c4cd6a1e1ea0adaf3a63"
    };

    const SECRETS_FILE_NAME = 'vault_secrets.enc';
    const NOTEPAD_FILE_NAME = 'vault_notepad.enc';
    const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB Apps Script payload limit

    // Hardened Apps Script Deployment URL (POST Only)
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGBYXCYuZZzjyPu3kEhqkiAy_xQRKq4mP-6gmI05P8rDx87deHWPJertXKjTo7_34yjQ/exec';

    // INITIALIZE FIREBASE APP
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    const fbAuth = firebase.auth();

    // STRICT IN-MEMORY ONLY PERSISTENCE (Tab close/refresh forces locked state)
    try {
        fbAuth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(() => {});
        fbAuth.signOut().catch(() => {});
    } catch (_) {}

    // PURGE ANY LEGACY LOCAL STORAGE OR SESSION STORAGE ON BOOT
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem('arpit_vault_secrets_cache');
            window.sessionStorage.removeItem('arpit_vault_secrets_enc');
            window.sessionStorage.removeItem('arpit_vault_notepad_permanent');
            window.sessionStorage.removeItem('arpit_vault_drive_cache');
        }
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem('arpit_vault_secrets_cache');
            window.localStorage.removeItem('arpit_vault_notepad_permanent');
            window.localStorage.removeItem('arpit_vault_drive_cache');
        }
    } catch (_) {}

    // ------------------------------------------------------------------
    // IN-MEMORY ACTIVE SESSION STATE (WIPED IMMEDIATELY ON LOCK)
    // ------------------------------------------------------------------
    let currentUser = null;
    let currentMasterPassphrase = null;
    let decryptedSecrets = [];
    let decryptedNotesText = '';
    let decryptedFilesMap = new Map(); // id -> decrypted file metadata & blob
    let allCloudFiles = [];
    let activeObjectUrls = []; // Track created blob URLs for automatic revoking
    let isFetchingFiles = false;
    let isExplicitLogin = false;
    let failedPassphraseAttempts = 0;
    let passphraseCooldownActive = false;
    let notesSaveTimeout = null;

    // ------------------------------------------------------------------
    // SAFE OBJECT URL MANAGER
    // ------------------------------------------------------------------
    function createSafeObjectURL(blob) {
        const url = URL.createObjectURL(blob);
        activeObjectUrls.push(url);
        return url;
    }

    function revokeAllObjectURLs() {
        while (activeObjectUrls.length > 0) {
            const url = activeObjectUrls.pop();
            try {
                URL.revokeObjectURL(url);
            } catch (_) {}
        }
    }

    // ------------------------------------------------------------------
    // AUTO-LOCK MANAGER (3 Min Inactivity + Tab Hidden / Blur Protection)
    // ------------------------------------------------------------------
    const AutoLockManager = {
        timer: null,
        idleLimitSeconds: 180, // 3 Minutes
        secondsRemaining: 180,
        intervalId: null,

        start() {
            this.stop();
            this.secondsRemaining = this.idleLimitSeconds;
            this.updateUI();

            this.intervalId = setInterval(() => {
                this.secondsRemaining--;
                this.updateUI();
                if (this.secondsRemaining <= 0) {
                    this.triggerLock('Inactivity Timeout (3 mins)');
                }
            }, 1000);
        },

        stop() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        reset() {
            if (!currentUser) return;
            this.secondsRemaining = this.idleLimitSeconds;
            this.updateUI();
        },

        updateUI() {
            const countdownEl = document.getElementById('idle-countdown');
            const pillEl = document.getElementById('idle-timer-pill');
            if (!countdownEl || !pillEl) return;

            if (!currentUser) {
                pillEl.style.display = 'none';
                return;
            }

            pillEl.style.display = 'inline-flex';
            const mins = Math.floor(this.secondsRemaining / 60);
            const secs = this.secondsRemaining % 60;
            countdownEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        },

        triggerLock(reason = 'Session Locked') {
            Log.info('Vault auto-locking:', reason);
            lockVault(reason);
        },

        init() {
            const events = ['pointermove', 'keydown', 'scroll', 'touchstart', 'click'];
            events.forEach(evt => {
                window.addEventListener(evt, () => this.reset(), { passive: true });
            });

            // Instant lock on tab hidden or window blur
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && currentUser) {
                    this.triggerLock('Tab switched/hidden');
                }
            });

            window.addEventListener('blur', () => {
                if (currentUser) {
                    this.triggerLock('Window blur/focus lost');
                }
            });

            window.addEventListener('beforeunload', () => {
                purgeAllSessionMemory();
            });
        }
    };

    // ------------------------------------------------------------------
    // HARDENED CRYPTO ENGINE (PBKDF2 600,000 + AES-GCM 256-BIT)
    // ------------------------------------------------------------------
    const CryptoEngine = {
        async deriveKey(passphrase, salt, iterations = 600000) {
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
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                baseKey,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        },

        async encrypt(plainObj, passphrase) {
            const salt = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes
            const iv = crypto.getRandomValues(new Uint8Array(12));   // 12 bytes
            const iterations = 600000;
            const key = await this.deriveKey(passphrase, salt, iterations);
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
                iter: iterations,
                v: 2
            });
        },

        async decrypt(packedString, passphrase) {
            const packed = JSON.parse(packedString);
            const salt = new Uint8Array(packed.salt);
            const iv = new Uint8Array(packed.iv);
            const encrypted = new Uint8Array(packed.data);
            const iterations = packed.iter || 100000; // Backward compatible with v1 (100k)
            const key = await this.deriveKey(passphrase, salt, iterations);
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );
            return JSON.parse(new TextDecoder().decode(decrypted));
        }
    };

    // ------------------------------------------------------------------
    // PASSPHRASE STRENGTH & EXPONENTIAL COOLDOWN VALIDATOR
    // ------------------------------------------------------------------
    function evaluatePassphrase(pass) {
        if (!pass) return { score: 0, label: 'Empty', valid: false };
        if (pass.length < 12) return { score: 1, label: 'Too Short (Min 12 Chars)', valid: false };

        let score = 0;
        if (pass.length >= 12) score++;
        if (pass.length >= 16) score++;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        let label = 'Weak';
        let color = '#FF5252';
        let width = '25%';

        if (score >= 4) {
            label = 'Strong / Bank-Grade';
            color = '#00C853';
            width = '100%';
        } else if (score >= 3) {
            label = 'Medium (Acceptable)';
            color = '#FFB300';
            width = '65%';
        } else {
            label = 'Weak (Add symbols/numbers)';
            color = '#FF5252';
            width = '35%';
        }

        return { score, label, color, width, valid: pass.length >= 12 && score >= 2 };
    }

    function applyExponentialCooldown() {
        failedPassphraseAttempts++;
        const cooldownSeconds = Math.min(60, Math.pow(2, failedPassphraseAttempts - 1)); // 1, 2, 4, 8, 16, 32, 60s
        passphraseCooldownActive = true;

        const unlockBtn = document.getElementById('unlock-secrets-btn');
        const noticeEl = document.getElementById('passphrase-cooldown-notice');
        if (unlockBtn) unlockBtn.disabled = true;

        let rem = cooldownSeconds;
        if (noticeEl) {
            noticeEl.style.display = 'block';
            noticeEl.textContent = `Security Cooldown: Too many incorrect attempts. Please wait ${rem}s...`;
        }

        const interval = setInterval(() => {
            rem--;
            if (noticeEl) {
                noticeEl.textContent = `Security Cooldown: Too many incorrect attempts. Please wait ${rem}s...`;
            }
            if (rem <= 0) {
                clearInterval(interval);
                passphraseCooldownActive = false;
                if (unlockBtn) unlockBtn.disabled = false;
                if (noticeEl) noticeEl.style.display = 'none';
            }
        }, 1000);
    }

    // ------------------------------------------------------------------
    // POST-ONLY ZERO-TRUST DRIVE RELAY (All calls require fresh Firebase token)
    // ------------------------------------------------------------------
    const DRIVE_RELAY = {
        url: APPS_SCRIPT_URL,

        async getIdToken() {
            if (!currentUser || typeof currentUser.getIdToken !== 'function') {
                throw new Error('Unauthenticated: Active Firebase session required.');
            }
            return await currentUser.getIdToken(false);
        },

        async postAction(action, extraPayload = {}) {
            const idToken = await this.getIdToken();
            const body = JSON.stringify({
                action: action,
                idToken: idToken,
                ...extraPayload
            });

            const res = await fetch(this.url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: body
            });

            if (!res.ok) {
                throw new Error(`Cloud Relay HTTP Error: ${res.status}`);
            }

            const data = await res.json();
            if (data && data.error) {
                throw new Error(data.error);
            }
            return data;
        },

        async listFiles() {
            return await this.postAction('list');
        },

        async downloadBlob(id) {
            return await this.postAction('download_blob', { id: id });
        },

        async uploadEncryptedBlob(blobString, randomFileName) {
            const base64 = btoa(unescape(encodeURIComponent(blobString)));
            return await this.postAction('upload', {
                name: randomFileName,
                mimeType: 'application/octet-stream',
                base64: base64
            });
        },

        async deleteFile(id) {
            return await this.postAction('delete', { id: id });
        }
    };

    // ------------------------------------------------------------------
    // PURGE AND WIPE ALL SESSION MEMORY
    // ------------------------------------------------------------------
    function purgeAllSessionMemory() {
        currentUser = null;
        currentMasterPassphrase = null;
        decryptedSecrets = [];
        decryptedNotesText = '';
        decryptedFilesMap.clear();
        allCloudFiles = [];
        isExplicitLogin = false;

        revokeAllObjectURLs();

        const notesTextarea = document.getElementById('vault-notes-textarea');
        if (notesTextarea) notesTextarea.value = '';

        const masterPassInput = document.getElementById('master-passphrase-input');
        if (masterPassInput) masterPassInput.value = '';

        // Safe DOM replacement
        const clearTargets = ['secrets-list', 'images-grid', 'videos-grid', 'docs-grid'];
        clearTargets.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.replaceChildren();
        });
    }

    async function lockVault(reasonNotice = null) {
        AutoLockManager.stop();
        purgeAllSessionMemory();

        try {
            await fbAuth.signOut();
        } catch (_) {}

        showLockedView();
        if (reasonNotice) {
            showToast(reasonNotice, 'shield-halved');
        }
    }

    // ------------------------------------------------------------------
    // SAFE DOM BUILDER (Guarantees zero XSS injection via innerHTML)
    // ------------------------------------------------------------------
    function safeEl(tag, options = {}, children = []) {
        const el = document.createElement(tag);
        if (options.className) el.className = options.className;
        if (options.id) el.id = options.id;
        if (options.text) el.textContent = options.text;
        if (options.attrs) {
            for (const [k, v] of Object.entries(options.attrs)) {
                el.setAttribute(k, v);
            }
        }
        if (options.events) {
            for (const [evt, handler] of Object.entries(options.events)) {
                el.addEventListener(evt, handler);
            }
        }
        children.forEach(child => {
            if (child) el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return el;
    }

    function formatBytes(bytes, decimals = 1) {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // ------------------------------------------------------------------
    // UI TOAST NOTIFICATION
    // ------------------------------------------------------------------
    function showToast(message, iconClass = 'info-circle') {
        const toast = document.getElementById('vault-toast');
        if (!toast) return;

        toast.replaceChildren();
        const icon = safeEl('i', { className: `fas fa-${iconClass}` });
        const text = safeEl('span', { text: ` ${message}` });
        toast.appendChild(icon);
        toast.appendChild(text);

        toast.className = 'vault-toast show';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.className = 'vault-toast';
        }, 3200);
    }

    // ------------------------------------------------------------------
    // DOM ELEMENTS CACHE
    // ------------------------------------------------------------------
    const lockedSection = document.getElementById('locked-state');
    const unlockedDashboard = document.getElementById('unlocked-dashboard');
    const firebaseLoginForm = document.getElementById('firebase-login-form');
    const fbEmailInput = document.getElementById('fb-email');
    const fbPasswordInput = document.getElementById('fb-password');
    const fbSubmitBtn = document.getElementById('fb-submit-btn');
    const loginStatusMsg = document.getElementById('login-status-msg');
    const authHeaderBtnWrap = document.getElementById('auth-header-btn-wrap');
    const userNameEl = document.getElementById('user-name');

    // Dashboard Tabs
    const tabButtons = document.querySelectorAll('.vtab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // File Grids
    const imagesGrid = document.getElementById('images-grid');
    const videosGrid = document.getElementById('videos-grid');
    const docsGrid = document.getElementById('docs-grid');

    // Counters
    const imagesCount = document.getElementById('images-count');
    const videosCount = document.getElementById('videos-count');
    const docsCount = document.getElementById('docs-count');
    const secretsCount = document.getElementById('secrets-count');

    // Upload Triggers
    const imageUploader = document.getElementById('image-uploader');
    const videoUploader = document.getElementById('video-uploader');
    const docUploader = document.getElementById('doc-uploader');
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const uploadDocBtn = document.getElementById('upload-doc-btn');
    const uploadProgressContainer = document.getElementById('upload-progress-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadPercentText = document.getElementById('upload-percent-text');
    const uploadStatusText = document.getElementById('upload-status-text');

    // Notepad
    const notesTextarea = document.getElementById('vault-notes-textarea');
    const notesSyncStatus = document.getElementById('notes-sync-status');
    const notesCharCount = document.getElementById('notes-char-count');
    const copyNotesBtn = document.getElementById('copy-notes-btn');
    const downloadNotesBtn = document.getElementById('download-notes-btn');
    const clearNotesBtn = document.getElementById('clear-notes-btn');

    // Secrets Manager
    const masterPassphraseInput = document.getElementById('master-passphrase-input');
    const unlockSecretsBtn = document.getElementById('unlock-secrets-btn');
    const lockSecretsBtn = document.getElementById('lock-secrets-btn');
    const secretsUnlockCard = document.getElementById('secrets-unlock-card');
    const secretsManagerWrap = document.getElementById('secrets-manager-wrap');
    const secretsList = document.getElementById('secrets-list');
    const secretsSearchInput = document.getElementById('secrets-search-input');
    const openNewSecretModalBtn = document.getElementById('open-new-secret-modal-btn');
    const newSecretModal = document.getElementById('new-secret-modal');
    const newSecretForm = document.getElementById('new-secret-form');
    const closeSecretModalBtn = document.getElementById('close-secret-modal-btn');
    const cancelSecretBtn = document.getElementById('cancel-secret-btn');
    const toggleSecPass = document.getElementById('toggle-sec-pass');
    const secPass = document.getElementById('sec-pass');

    // Preview Modal
    const previewModal = document.getElementById('preview-modal');
    const previewModalTitle = document.getElementById('modal-title');
    const previewModalBody = document.getElementById('modal-body');
    const previewModalDownloadBtn = document.getElementById('modal-download-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const closePreviewModalBtn = document.getElementById('close-preview-modal-btn');

    // Strength Meter UI Elements
    const strengthContainer = document.getElementById('passphrase-strength-container');
    const strengthLabel = document.getElementById('strength-label');
    const strengthBar = document.getElementById('strength-bar');
    const ruleHint = document.getElementById('passphrase-rule-hint');

    // ------------------------------------------------------------------
    // PASSPHRASE INPUT LIVE STRENGTH METER LISTENER
    // ------------------------------------------------------------------
    if (masterPassphraseInput && strengthContainer) {
        masterPassphraseInput.addEventListener('input', () => {
            const val = masterPassphraseInput.value || '';
            if (!val) {
                strengthContainer.style.display = 'none';
                return;
            }
            strengthContainer.style.display = 'block';
            const evalResult = evaluatePassphrase(val);
            if (strengthLabel) {
                strengthLabel.textContent = evalResult.label;
                strengthLabel.style.color = evalResult.color;
            }
            if (strengthBar) {
                strengthBar.style.width = evalResult.width;
                strengthBar.style.background = evalResult.color;
            }
            if (ruleHint) {
                ruleHint.textContent = evalResult.valid
                    ? '✓ Strong passphrase: Meets security requirements.'
                    : 'Required: Minimum 12 characters + mixed uppercase, digits or symbols.';
                ruleHint.style.color = evalResult.valid ? '#00C853' : '#FF5252';
            }
        });
    }

    // ------------------------------------------------------------------
    // AUTHENTICATION LOGIC (STRICT ZERO-AUTO-LOGIN & EXPLICIT SUBMIT)
    // ------------------------------------------------------------------
    async function handleFirebaseLogin(e) {
        if (e) e.preventDefault();
        const email = (fbEmailInput.value || '').trim();
        const pass = (fbPasswordInput.value || '').trim();

        if (!email || !pass) {
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Please provide admin identifier and password.';
            return;
        }

        fbSubmitBtn.disabled = true;
        fbSubmitBtn.textContent = 'Verifying Session...';
        loginStatusMsg.className = 'status-msg info';
        loginStatusMsg.textContent = 'Verifying admin identity with Google...';

        try {
            isExplicitLogin = true;
            await fbAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, pass);
            currentUser = userCredential.user;

            fbEmailInput.value = '';
            fbPasswordInput.value = '';

            loginStatusMsg.className = 'status-msg success';
            loginStatusMsg.textContent = 'Identity Verified! Initializing encrypted vault...';

            onVaultAuthenticated();
        } catch (err) {
            isExplicitLogin = false;
            fbSubmitBtn.disabled = false;
            fbSubmitBtn.textContent = 'Authenticate Session';
            loginStatusMsg.className = 'status-msg error';
            loginStatusMsg.textContent = 'Authentication Failed: Incorrect admin credentials.';
            Log.error('Authentication attempt failed.');
        }
    }

    if (firebaseLoginForm) firebaseLoginForm.addEventListener('submit', handleFirebaseLogin);
    if (fbSubmitBtn) fbSubmitBtn.addEventListener('click', handleFirebaseLogin);

    fbAuth.onAuthStateChanged((user) => {
        if (!isExplicitLogin) {
            if (user) fbAuth.signOut().catch(() => {});
            purgeAllSessionMemory();
            showLockedView();
            return;
        }

        if (user && !currentUser) {
            currentUser = user;
            onVaultAuthenticated();
        } else if (!user) {
            lockVault();
        }
    });

    function showLockedView() {
        lockedSection.style.display = 'flex';
        lockedSection.classList.add('active');
        unlockedDashboard.style.display = 'none';
        unlockedDashboard.classList.remove('active');
        authHeaderBtnWrap.replaceChildren();
        if (loginStatusMsg) loginStatusMsg.textContent = '';
        if (fbSubmitBtn) {
            fbSubmitBtn.disabled = false;
            fbSubmitBtn.textContent = 'Authenticate Session';
        }
    }

    function showUnlockedView() {
        lockedSection.style.display = 'none';
        lockedSection.classList.remove('active');
        unlockedDashboard.style.display = 'block';
        unlockedDashboard.classList.add('active');

        authHeaderBtnWrap.replaceChildren();
        const lockBtn = safeEl('button', {
            className: 'action-btn outline-btn',
            attrs: { title: 'Lock Session' },
            events: {
                click: () => lockVault('Session Locked by User')
            }
        }, [
            safeEl('i', { className: 'fas fa-lock' }),
            safeEl('span', { text: ' Lock Vault' })
        ]);
        authHeaderBtnWrap.appendChild(lockBtn);
    }

    function onVaultAuthenticated() {
        showUnlockedView();
        AutoLockManager.start();

        if (userNameEl && currentUser) {
            userNameEl.textContent = currentUser.displayName || 'Authorized Admin';
        }

        // Fetch cloud file records
        loadCloudFiles();
    }

    // ------------------------------------------------------------------
    // CLOUD FILE SYNC (LIST & CATEGORIZE)
    // ------------------------------------------------------------------
    async function loadCloudFiles() {
        if (isFetchingFiles || !currentUser) return;
        isFetchingFiles = true;

        try {
            const data = await DRIVE_RELAY.listFiles();
            if (data && Array.isArray(data.files)) {
                allCloudFiles = data.files;
                partitionAndRenderCloudFiles();

                // If Master Passphrase is ready, decrypt notes automatically
                if (currentMasterPassphrase) {
                    await syncEncryptedNotepad(false);
                }
            }
        } catch (err) {
            Log.warn('Cloud sync error:', err.message);
            showToast('Cloud sync notice: ' + err.message, 'circle-exclamation');
        } finally {
            isFetchingFiles = false;
        }
    }

    function partitionAndRenderCloudFiles() {
        // Filter out system files from media views
        const userFiles = allCloudFiles.filter(f => 
            f.name !== SECRETS_FILE_NAME && f.name !== NOTEPAD_FILE_NAME && !f.name.endsWith('.txt')
        );

        // Images, Videos, Docs
        const images = [];
        const videos = [];
        const docs = [];

        userFiles.forEach(f => {
            const lowerName = f.name.toLowerCase();
            // In v2, client-encrypted files are .enc; if decrypted metadata is present, check original mimeType
            const decryptedMeta = decryptedFilesMap.get(f.id);
            const mime = (decryptedMeta && decryptedMeta.type) ? decryptedMeta.type : '';
            const origName = (decryptedMeta && decryptedMeta.name) ? decryptedMeta.name.toLowerCase() : lowerName;

            if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(origName)) {
                images.push(f);
            } else if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(origName)) {
                videos.push(f);
            } else {
                docs.push(f);
            }
        });

        if (imagesCount) imagesCount.textContent = images.length;
        if (videosCount) videosCount.textContent = videos.length;
        if (docsCount) docsCount.textContent = docs.length;

        renderGrid(imagesGrid, images, 'images');
        renderGrid(videosGrid, videos, 'videos');
        renderGrid(docsGrid, docs, 'docs');
    }

    // ------------------------------------------------------------------
    // SAFE DOM GRID RENDERING (Zero innerHTML injection)
    // ------------------------------------------------------------------
    function renderGrid(container, items, type) {
        if (!container) return;
        container.replaceChildren();

        if (!items || items.length === 0) {
            const emptyState = safeEl('div', { className: 'empty-state' }, [
                safeEl('i', { className: type === 'images' ? 'fas fa-images' : (type === 'videos' ? 'fas fa-film' : 'fas fa-file-lines') }),
                safeEl('h3', { text: `${type.charAt(0).toUpperCase() + type.slice(1)} Vault` }),
                safeEl('p', { text: `No encrypted ${type} found. Upload files up to 20MB.` })
            ]);
            container.appendChild(emptyState);
            return;
        }

        items.forEach(file => {
            const decryptedMeta = decryptedFilesMap.get(file.id);
            const displayName = decryptedMeta ? decryptedMeta.name : (file.name.endsWith('.enc') ? '🔒 Encrypted File' : file.name);
            const isEncrypted = file.name.endsWith('.enc');

            const card = safeEl('div', { className: 'file-card media-card', attrs: { 'data-id': file.id } });

            // Preview Container
            const previewWrap = safeEl('div', { className: 'media-preview-container' });
            if (decryptedMeta && decryptedMeta.blobUrl && type === 'images') {
                const img = safeEl('img', {
                    className: 'media-thumb-img',
                    attrs: { src: decryptedMeta.blobUrl, alt: displayName, loading: 'lazy' }
                });
                previewWrap.appendChild(img);
            } else {
                const iconBox = safeEl('div', {
                    className: 'doc-icon-box',
                    attrs: { style: 'display:flex;align-items:center;justify-content:center;height:100%;font-size:36px;color:var(--text-muted);' }
                }, [
                    safeEl('i', { className: isEncrypted ? 'fas fa-file-shield' : (type === 'videos' ? 'fas fa-video' : 'fas fa-file') })
                ]);
                previewWrap.appendChild(iconBox);
            }
            card.appendChild(previewWrap);

            // Details
            const details = safeEl('div', { className: 'file-details' }, [
                safeEl('div', { className: 'file-name', text: displayName, attrs: { title: displayName } }),
                safeEl('div', { className: 'file-meta', text: `${formatBytes(file.size)} • ${new Date(file.modifiedTime).toLocaleDateString()}` })
            ]);
            card.appendChild(details);

            // Card Bottom Actions
            const actions = safeEl('div', { className: 'file-actions' });

            // Decrypt / Preview Button
            const previewBtn = safeEl('button', {
                className: 'file-btn view-btn',
                attrs: { type: 'button', title: 'Decrypt & Preview' },
                events: {
                    click: () => handleFileDecryptAndPreview(file)
                }
            }, [safeEl('i', { className: 'fas fa-eye' })]);
            actions.appendChild(previewBtn);

            // Direct Download Button
            const downloadBtn = safeEl('button', {
                className: 'file-btn download-btn',
                attrs: { type: 'button', title: 'Decrypt & Download' },
                events: {
                    click: () => handleFileDecryptAndDownload(file)
                }
            }, [safeEl('i', { className: 'fas fa-download' })]);
            actions.appendChild(downloadBtn);

            // Delete Button
            const deleteBtn = safeEl('button', {
                className: 'file-btn del-btn',
                attrs: { type: 'button', title: 'Delete', style: 'color:#FF3B30;' },
                events: {
                    click: () => handleFileDelete(file.id, displayName)
                }
            }, [safeEl('i', { className: 'fas fa-trash-can' })]);
            actions.appendChild(deleteBtn);

            const bottomBar = safeEl('div', { className: 'file-card-bottom' }, [
                safeEl('span', {
                    attrs: { style: 'font-size:11px;font-family:var(--font-mono);color:var(--text-muted);' }
                }, [
                    safeEl('i', { className: 'fas fa-shield-halved', attrs: { style: 'color:#00C853;margin-right:4px;' } }),
                    document.createTextNode(isEncrypted ? 'E2E Sealed' : 'Cloud Stored')
                ]),
                actions
            ]);
            card.appendChild(bottomBar);

            container.appendChild(card);
        });
    }

    // ------------------------------------------------------------------
    // CLIENT-SIDE ENCRYPTED FILE UPLOAD HANDLER
    // ------------------------------------------------------------------
    async function handleEncryptedUpload(files) {
        if (!files || files.length === 0) return;
        if (!currentMasterPassphrase) {
            showToast('Master Passphrase required to encrypt files. Unlock Passwords tab first!', 'key');
            // Switch to secrets tab to prompt for passphrase
            const secretsTabBtn = document.querySelector('[data-tab="tab-secrets"]');
            if (secretsTabBtn) secretsTabBtn.click();
            return;
        }

        if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';

        let uploaded = 0;
        const total = files.length;

        for (let i = 0; i < total; i++) {
            const file = files[i];

            // Size enforcement: Max 20MB
            if (file.size > MAX_FILE_SIZE_BYTES) {
                showToast(`Skipped ${file.name}: Exceeds 20MB security limit.`, 'triangle-exclamation');
                continue;
            }

            if (uploadStatusText) uploadStatusText.textContent = `Encrypting ${file.name}...`;
            if (uploadProgressBar) uploadProgressBar.style.width = `${Math.round(((i) / total) * 100)}%`;
            if (uploadPercentText) uploadPercentText.textContent = `${Math.round(((i) / total) * 100)}%`;

            try {
                // Read binary buffer
                const arrayBuffer = await file.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);

                // Convert to binary string
                let binaryStr = '';
                const chunk = 8192;
                for (let j = 0; j < uint8.length; j += chunk) {
                    binaryStr += String.fromCharCode.apply(null, uint8.subarray(j, j + chunk));
                }
                const base64Data = btoa(binaryStr);

                // Encrypt payload containing metadata + data
                const filePayload = {
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    lastModified: file.lastModified,
                    data: base64Data
                };

                const encryptedStr = await CryptoEngine.encrypt(filePayload, currentMasterPassphrase);

                // Disguised random cloud name
                const randomCloudName = 'enc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16) + '.enc';

                if (uploadStatusText) uploadStatusText.textContent = `Uploading encrypted package...`;
                const res = await DRIVE_RELAY.uploadEncryptedBlob(encryptedStr, randomCloudName);

                if (res && res.success) {
                    uploaded++;
                }
            } catch (err) {
                Log.error('Encryption or upload failed for file:', err.message);
                showToast(`Upload failed for ${file.name}: ${err.message}`, 'triangle-exclamation');
            }
        }

        if (uploadProgressBar) uploadProgressBar.style.width = '100%';
        if (uploadPercentText) uploadPercentText.textContent = '100%';
        setTimeout(() => {
            if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
        }, 500);

        if (uploaded > 0) {
            showToast(`Encrypted & uploaded ${uploaded} file(s) safely!`, 'shield-check');
            await loadCloudFiles();
        }
    }

    if (uploadImageBtn && imageUploader) {
        uploadImageBtn.addEventListener('click', () => imageUploader.click());
        imageUploader.addEventListener('change', (e) => {
            handleEncryptedUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    if (uploadVideoBtn && videoUploader) {
        uploadVideoBtn.addEventListener('click', () => videoUploader.click());
        videoUploader.addEventListener('change', (e) => {
            handleEncryptedUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    if (uploadDocBtn && docUploader) {
        uploadDocBtn.addEventListener('click', () => docUploader.click());
        docUploader.addEventListener('change', (e) => {
            handleEncryptedUpload(Array.from(e.target.files));
            e.target.value = '';
        });
    }

    // ------------------------------------------------------------------
    // FILE DECRYPT, PREVIEW & DOWNLOAD
    // ------------------------------------------------------------------
    async function decryptCloudBlob(fileId) {
        if (!currentMasterPassphrase) {
            showToast('Master Passphrase required to decrypt. Unlock Passwords tab first!', 'key');
            const secretsTabBtn = document.querySelector('[data-tab="tab-secrets"]');
            if (secretsTabBtn) secretsTabBtn.click();
            return null;
        }

        if (decryptedFilesMap.has(fileId)) {
            return decryptedFilesMap.get(fileId);
        }

        showToast('Fetching and decrypting from cloud...', 'lock-open');
        const res = await DRIVE_RELAY.downloadBlob(fileId);
        if (!res || !res.base64) {
            throw new Error('Failed to retrieve file blob.');
        }

        const rawEncryptedStr = decodeURIComponent(escape(atob(res.base64)));
        const decryptedPayload = await CryptoEngine.decrypt(rawEncryptedStr, currentMasterPassphrase);

        // Convert base64 payload data to Blob
        const binStr = atob(decryptedPayload.data);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: decryptedPayload.type || 'application/octet-stream' });
        const blobUrl = createSafeObjectURL(blob);

        const fileRecord = {
            name: decryptedPayload.name,
            type: decryptedPayload.type,
            size: decryptedPayload.size,
            blob: blob,
            blobUrl: blobUrl
        };

        decryptedFilesMap.set(fileId, fileRecord);
        return fileRecord;
    }

    async function handleFileDecryptAndPreview(file) {
        try {
            const record = await decryptCloudBlob(file.id);
            if (!record) return;

            if (previewModalTitle) previewModalTitle.textContent = record.name;
            if (previewModalBody) {
                previewModalBody.replaceChildren();

                if (record.type.startsWith('image/')) {
                    const img = safeEl('img', {
                        attrs: {
                            src: record.blobUrl,
                            alt: record.name,
                            style: 'max-width:100%;max-height:70vh;object-fit:contain;border-radius:6px;'
                        }
                    });
                    previewModalBody.appendChild(img);
                } else if (record.type.startsWith('video/')) {
                    const video = safeEl('video', {
                        attrs: {
                            src: record.blobUrl,
                            controls: 'true',
                            style: 'max-width:100%;max-height:70vh;border-radius:6px;'
                        }
                    });
                    previewModalBody.appendChild(video);
                } else if (record.type === 'application/pdf') {
                    const iframe = safeEl('iframe', {
                        attrs: {
                            src: record.blobUrl,
                            style: 'width:100%;height:70vh;border:none;'
                        }
                    });
                    previewModalBody.appendChild(iframe);
                } else {
                    const genericView = safeEl('div', {
                        attrs: { style: 'text-align:center;padding:32px;' }
                    }, [
                        safeEl('i', { className: 'fas fa-file-circle-check', attrs: { style: 'font-size:48px;color:#00C853;margin-bottom:12px;' } }),
                        safeEl('h4', { text: record.name }),
                        safeEl('p', { text: `Decrypted ${formatBytes(record.size)}. Ready for direct download.` })
                    ]);
                    previewModalBody.appendChild(genericView);
                }
            }

            if (previewModalDownloadBtn) {
                previewModalDownloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = record.blobUrl;
                    a.download = record.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
            }

            if (previewModal) {
                previewModal.style.display = 'flex';
                previewModal.setAttribute('aria-hidden', 'false');
            }
        } catch (err) {
            Log.error('Decryption failed for preview:', err.message);
            showToast('Decryption failed: Check Master Passphrase.', 'triangle-exclamation');
        }
    }

    async function handleFileDecryptAndDownload(file) {
        try {
            const record = await decryptCloudBlob(file.id);
            if (!record) return;

            const a = document.createElement('a');
            a.href = record.blobUrl;
            a.download = record.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`Decrypted & downloaded ${record.name}!`, 'shield-check');
        } catch (err) {
            Log.error('Decryption failed for download:', err.message);
            showToast('Decryption failed: Check Master Passphrase.', 'triangle-exclamation');
        }
    }

    async function handleFileDelete(fileId, displayName) {
        if (!confirm(`Permanently delete "${displayName}" from private cloud?`)) return;

        try {
            showToast(`Deleting ${displayName}...`, 'trash-can');
            await DRIVE_RELAY.deleteFile(fileId);
            decryptedFilesMap.delete(fileId);
            allCloudFiles = allCloudFiles.filter(f => f.id !== fileId);
            partitionAndRenderCloudFiles();
            showToast('File permanently deleted.', 'circle-check');
        } catch (err) {
            Log.error('Delete error:', err.message);
            showToast(`Delete failed: ${err.message}`, 'triangle-exclamation');
        }
    }

    function closePreviewModal() {
        if (!previewModal) return;
        previewModal.style.display = 'none';
        previewModal.setAttribute('aria-hidden', 'true');
        if (previewModalBody) previewModalBody.replaceChildren();
    }

    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreviewModal);
    if (closePreviewModalBtn) closePreviewModalBtn.addEventListener('click', closePreviewModal);

    // ------------------------------------------------------------------
    // ENCRYPTED NOTEPAD LOGIC (AES-GCM ON DRIVE AS vault_notepad.enc)
    // ------------------------------------------------------------------
    function updateNotepadStats() {
        if (!notesTextarea || !notesCharCount) return;
        const text = notesTextarea.value || '';
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        notesCharCount.textContent = `${chars} chars | ${words} words`;
    }

    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => {
            updateNotepadStats();
            if (notesSyncStatus) {
                notesSyncStatus.replaceChildren(
                    safeEl('i', { className: 'fas fa-spinner fa-spin' }),
                    document.createTextNode(' Encrypting & saving...')
                );
            }
            clearTimeout(notesSaveTimeout);
            notesSaveTimeout = setTimeout(saveEncryptedNotepad, 1200);
        });
    }

    async function syncEncryptedNotepad(forceToast = false) {
        if (!currentMasterPassphrase || !currentUser) return;

        const notepadFile = allCloudFiles.find(f => f.name === NOTEPAD_FILE_NAME);
        if (!notepadFile) {
            if (notesSyncStatus) {
                notesSyncStatus.replaceChildren(
                    safeEl('i', { className: 'fas fa-shield-halved', attrs: { style: 'color:#00C853;' } }),
                    document.createTextNode(' E2E Encrypted Active')
                );
            }
            return;
        }

        try {
            const res = await DRIVE_RELAY.downloadBlob(notepadFile.id);
            if (res && res.base64) {
                const rawEncryptedStr = decodeURIComponent(escape(atob(res.base64)));
                const payload = await CryptoEngine.decrypt(rawEncryptedStr, currentMasterPassphrase);
                if (payload && typeof payload.text === 'string') {
                    decryptedNotesText = payload.text;
                    if (notesTextarea && (!notesTextarea.value || notesTextarea.value === '')) {
                        notesTextarea.value = decryptedNotesText;
                        updateNotepadStats();
                    }
                    if (notesSyncStatus) {
                        notesSyncStatus.replaceChildren(
                            safeEl('i', { className: 'fas fa-check-circle', attrs: { style: 'color:#00C853;' } }),
                            document.createTextNode(' Synced Encrypted')
                        );
                    }
                    if (forceToast) showToast('Notepad decrypted from cloud!', 'pen-to-square');
                }
            }
        } catch (err) {
            Log.warn('Could not decrypt notepad with current key:', err.message);
        }
    }

    async function saveEncryptedNotepad() {
        if (!notesTextarea || !currentUser) return;
        if (!currentMasterPassphrase) {
            if (notesSyncStatus) {
                notesSyncStatus.replaceChildren(
                    safeEl('i', { className: 'fas fa-triangle-exclamation', attrs: { style: 'color:#FF5252;' } }),
                    document.createTextNode(' Unlock Passwords tab to enable sync')
                );
            }
            return;
        }

        const text = notesTextarea.value || '';
        decryptedNotesText = text;

        try {
            const encryptedStr = await CryptoEngine.encrypt({ text: text, updated: new Date().toISOString() }, currentMasterPassphrase);

            // Check if existing notepad file exists to delete/overwrite
            const existing = allCloudFiles.find(f => f.name === NOTEPAD_FILE_NAME);
            if (existing) {
                await DRIVE_RELAY.deleteFile(existing.id);
                allCloudFiles = allCloudFiles.filter(f => f.id !== existing.id);
            }

            const res = await DRIVE_RELAY.uploadEncryptedBlob(encryptedStr, NOTEPAD_FILE_NAME);
            if (res && res.success) {
                allCloudFiles.push({
                    id: res.id,
                    name: NOTEPAD_FILE_NAME,
                    size: encryptedStr.length,
                    modifiedTime: new Date().toISOString()
                });
                if (notesSyncStatus) {
                    notesSyncStatus.replaceChildren(
                        safeEl('i', { className: 'fas fa-check-circle', attrs: { style: 'color:#00C853;' } }),
                        document.createTextNode(` Synced Encrypted (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`)
                    );
                }
            }
        } catch (err) {
            Log.error('Encrypted notepad save error:', err.message);
            if (notesSyncStatus) {
                notesSyncStatus.replaceChildren(
                    safeEl('i', { className: 'fas fa-circle-exclamation', attrs: { style: 'color:#FF5252;' } }),
                    document.createTextNode(' Save failed')
                );
            }
        }
    }

    if (copyNotesBtn && notesTextarea) {
        copyNotesBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(notesTextarea.value || '').then(() => {
                showToast('Notepad content copied!', 'copy');
            });
        });
    }

    if (downloadNotesBtn && notesTextarea) {
        downloadNotesBtn.addEventListener('click', () => {
            const blob = new Blob([notesTextarea.value || ''], { type: 'text/plain' });
            const url = createSafeObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `arpit_vault_notes_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            showToast('Notes downloaded as .txt', 'download');
        });
    }

    if (clearNotesBtn && notesTextarea) {
        clearNotesBtn.addEventListener('click', () => {
            if (confirm('Clear all notepad text? This will be permanently erased.')) {
                notesTextarea.value = '';
                updateNotepadStats();
                saveEncryptedNotepad();
                showToast('Notepad cleared.', 'trash');
            }
        });
    }

    // ------------------------------------------------------------------
    // SECRETS MANAGER (PBKDF2 600K + AES-GCM + XSS SAFE DOM)
    // ------------------------------------------------------------------
    function renderSecrets(items) {
        if (!secretsList) return;
        secretsList.replaceChildren();

        const list = items || decryptedSecrets || [];
        if (secretsCount) secretsCount.textContent = list.length;

        if (list.length === 0) {
            const empty = safeEl('div', {
                className: 'empty-state',
                attrs: { style: 'padding:28px 16px;' }
            }, [
                safeEl('i', { className: 'fas fa-key' }),
                safeEl('h3', { text: 'No Stored Credentials' }),
                safeEl('p', { text: 'Click "Store New Credential" to save passwords or API keys encrypted with AES-GCM.' })
            ]);
            secretsList.appendChild(empty);
            return;
        }

        list.forEach((sec, idx) => {
            const catBadge = (sec.cat || 'other').toUpperCase();

            const itemEl = safeEl('div', { className: 'secret-item', attrs: { 'data-idx': String(idx) } });

            // Info
            const infoEl = safeEl('div', { className: 'secret-info' }, [
                safeEl('span', { className: 'secret-badge', text: catBadge }),
                safeEl('div', { className: 'secret-meta' }, [
                    safeEl('h4', { text: sec.title || 'Untitled' }),
                    safeEl('span', { text: sec.user || 'No identifier' }),
                    sec.notes ? safeEl('div', { text: sec.notes, attrs: { style: 'font-size:11px;color:var(--text-muted);margin-top:2px;' } }) : null
                ].filter(Boolean))
            ]);
            itemEl.appendChild(infoEl);

            // Actions
            const valDisplay = safeEl('span', { className: 'secret-val-display', text: '••••••••', id: `sec-val-${idx}` });

            const revealBtn = safeEl('button', {
                className: 'copy-btn sec-reveal-btn',
                attrs: { type: 'button', title: 'Reveal / Hide' },
                events: {
                    click: () => {
                        if (valDisplay.textContent === '••••••••') {
                            valDisplay.textContent = sec.pass;
                            revealBtn.replaceChildren(safeEl('i', { className: 'fas fa-eye-slash' }));
                        } else {
                            valDisplay.textContent = '••••••••';
                            revealBtn.replaceChildren(safeEl('i', { className: 'fas fa-eye' }));
                        }
                    }
                }
            }, [safeEl('i', { className: 'fas fa-eye' })]);

            const copyBtn = safeEl('button', {
                className: 'copy-btn sec-copy-btn',
                attrs: { type: 'button', title: 'Copy Secret' },
                events: {
                    click: () => {
                        if (sec.pass) {
                            navigator.clipboard.writeText(sec.pass).then(() => {
                                showToast('Credential copied to clipboard!', 'copy');
                            });
                        }
                    }
                }
            }, [safeEl('i', { className: 'fas fa-copy' }), document.createTextNode(' Copy')]);

            const delBtn = safeEl('button', {
                className: 'copy-btn sec-delete-btn',
                attrs: { type: 'button', title: 'Delete', style: 'color:#FF3B30;' },
                events: {
                    click: async () => {
                        if (confirm(`Delete credential "${sec.title}"?`)) {
                            decryptedSecrets.splice(idx, 1);
                            await saveAndSyncSecrets();
                            renderSecrets(decryptedSecrets);
                            showToast('Credential removed', 'trash');
                        }
                    }
                }
            }, [safeEl('i', { className: 'fas fa-trash-can' })]);

            const actionsEl = safeEl('div', { className: 'secret-actions' }, [
                valDisplay,
                revealBtn,
                copyBtn,
                delBtn
            ]);
            itemEl.appendChild(actionsEl);

            secretsList.appendChild(itemEl);
        });
    }

    async function saveAndSyncSecrets() {
        if (!currentMasterPassphrase || !currentUser) return;
        try {
            const encryptedStr = await CryptoEngine.encrypt(decryptedSecrets, currentMasterPassphrase);

            // Check if existing file in cloud
            const existing = allCloudFiles.find(f => f.name === SECRETS_FILE_NAME);
            if (existing) {
                await DRIVE_RELAY.deleteFile(existing.id);
                allCloudFiles = allCloudFiles.filter(f => f.id !== existing.id);
            }

            const res = await DRIVE_RELAY.uploadEncryptedBlob(encryptedStr, SECRETS_FILE_NAME);
            if (res && res.success) {
                allCloudFiles.push({
                    id: res.id,
                    name: SECRETS_FILE_NAME,
                    size: encryptedStr.length,
                    modifiedTime: new Date().toISOString()
                });
            }
        } catch (err) {
            Log.error('Error encrypting and syncing credentials:', err.message);
            showToast('Sync error: ' + err.message, 'triangle-exclamation');
        }
    }

    if (unlockSecretsBtn && masterPassphraseInput) {
        unlockSecretsBtn.addEventListener('click', async () => {
            if (passphraseCooldownActive) {
                showToast('Cooldown active. Please wait.', 'stopwatch');
                return;
            }

            const passphrase = (masterPassphraseInput.value || '').trim();
            const evaluation = evaluatePassphrase(passphrase);

            if (!evaluation.valid) {
                showToast(evaluation.label, 'triangle-exclamation');
                return;
            }

            unlockSecretsBtn.disabled = true;
            unlockSecretsBtn.textContent = 'Deriving Key (PBKDF2 600,000)...';

            try {
                // Find encrypted file on cloud if exists
                const cloudSecretFile = allCloudFiles.find(f => f.name === SECRETS_FILE_NAME);
                if (cloudSecretFile) {
                    const res = await DRIVE_RELAY.downloadBlob(cloudSecretFile.id);
                    if (res && res.base64) {
                        const rawEncryptedStr = decodeURIComponent(escape(atob(res.base64)));
                        const decrypted = await CryptoEngine.decrypt(rawEncryptedStr, passphrase);
                        decryptedSecrets = Array.isArray(decrypted) ? decrypted : [];
                    }
                } else {
                    decryptedSecrets = [];
                }

                currentMasterPassphrase = passphrase;
                failedPassphraseAttempts = 0; // Reset cooldown
                masterPassphraseInput.value = '';

                secretsUnlockCard.style.display = 'none';
                secretsManagerWrap.style.display = 'block';
                renderSecrets(decryptedSecrets);

                // Auto-sync notepad now that key is known
                await syncEncryptedNotepad(true);

                // Re-render cloud files to attach decrypted names/types
                partitionAndRenderCloudFiles();

                showToast('Master Key Derived & Vault Decrypted!', 'shield-check');
            } catch (err) {
                Log.error('Decryption failed with provided passphrase.');
                showToast('Incorrect Master Passphrase', 'triangle-exclamation');
                applyExponentialCooldown();
            } finally {
                if (!passphraseCooldownActive) {
                    unlockSecretsBtn.disabled = false;
                }
                unlockSecretsBtn.textContent = 'Decrypt Vault';
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
            decryptedFilesMap.clear();
            revokeAllObjectURLs();

            if (secretsList) secretsList.replaceChildren();
            if (secretsCount) secretsCount.textContent = '0';
            secretsManagerWrap.style.display = 'none';
            secretsUnlockCard.style.display = 'block';

            if (notesTextarea) notesTextarea.value = '';

            partitionAndRenderCloudFiles();
            showToast('Master Key erased from memory.', 'shield-halved');
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

    // Modal Handlers
    function closeSecretModal() {
        if (!newSecretModal) return;
        newSecretModal.style.display = 'none';
        newSecretModal.setAttribute('aria-hidden', 'true');
        if (newSecretForm) newSecretForm.reset();
        if (secPass) secPass.type = 'password';
    }

    if (openNewSecretModalBtn && newSecretModal) {
        openNewSecretModalBtn.addEventListener('click', () => {
            newSecretModal.style.display = 'flex';
            newSecretModal.setAttribute('aria-hidden', 'false');
            const titleInput = document.getElementById('sec-title');
            if (titleInput) titleInput.focus();
        });
    }

    if (closeSecretModalBtn) closeSecretModalBtn.addEventListener('click', closeSecretModal);
    if (cancelSecretBtn) cancelSecretBtn.addEventListener('click', closeSecretModal);

    if (toggleSecPass && secPass) {
        toggleSecPass.addEventListener('click', () => {
            const isPassword = secPass.type === 'password';
            secPass.type = isPassword ? 'text' : 'password';
            toggleSecPass.replaceChildren(safeEl('i', { className: isPassword ? 'fas fa-eye-slash' : 'fas fa-eye' }));
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
            showToast('Credential Encrypted & Saved!', 'shield-check');
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

    // Refresh Files Trigger
    document.querySelectorAll('.refresh-files-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            loadCloudFiles();
            showToast('Refreshing cloud directory...', 'rotate');
        });
    });

    // Search filters for Images, Videos, Docs
    const imageSearch = document.getElementById('images-search-input');
    if (imageSearch) {
        imageSearch.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            const imgs = allCloudFiles.filter(f => {
                const dec = decryptedFilesMap.get(f.id);
                const name = (dec ? dec.name : f.name).toLowerCase();
                return name.includes(q) && (name.endsWith('.enc') || /\.(jpg|png|jpeg|webp|svg|gif)$/i.test(name));
            });
            renderGrid(imagesGrid, imgs, 'images');
        });
    }

    const docSearch = document.getElementById('docs-search-input');
    if (docSearch) {
        docSearch.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            const docs = allCloudFiles.filter(f => {
                const dec = decryptedFilesMap.get(f.id);
                const name = (dec ? dec.name : f.name).toLowerCase();
                return name.includes(q) && !/\.(jpg|png|jpeg|webp|svg|gif|mp4|webm)$/i.test(name);
            });
            renderGrid(docsGrid, docs, 'docs');
        });
    }

    // Initialize Inactivity and Security Watchdogs
    AutoLockManager.init();

})();
