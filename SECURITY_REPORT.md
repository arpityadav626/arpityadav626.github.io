# Comprehensive Application Security Assessment & Hardening Report
**Target:** Private Cloud Vault (`/vault`) & Main Portfolio (`arpity.me`)  
**Assessment Date:** November 2026  
**Engineering Role:** Senior Application Security Engineer  
**Classification:** Internal Confidential / Security Documentation  

---

## 1. Executive Summary & Threat Model
The "Private Cloud Vault" is a static single-page web workspace backed by a headless Google Apps Script relay and Google Drive cloud storage, with identity services provided by Google Firebase Authentication.

### Threat Model Assumptions:
* **Attacker Capabilities:**
  - Full access to public frontend client source code (HTML, JS, CSS) via public GitHub repository and browser developer tools.
  - Knowledge of the Google Apps Script Web App execution endpoint URL.
  - Capability to forge arbitrary HTTP requests (cURL, Postman, automated scanners).
  - Attempted Cross-Site Scripting (XSS), Clickjacking, Credential Stuffing, and Data Extraction.
* **Security Objectives:**
  - Zero-Trust: Even if all client code and the Apps Script URL are public, the backend MUST reject all requests without a cryptographically signed Firebase ID token belonging specifically to the single authorized Administrator UID.
  - Zero-Knowledge: Files, documents, notes, and credentials stored on Google Drive must be client-side encrypted (AES-256-GCM) so that neither Google nor any cloud interceptor can inspect the plaintext.

---

## 2. Hardening Matrix & Findings

| # | Vulnerability / Issue | Severity | Status | File & Line Reference | Remediation Summary |
|---|---|---|---|---|---|
| 1 | **Static Secret Fallback (`ArpitVault@2026`)** | **Critical** | **Fixed** | `vault/script.js` L240<br>`vault/Code.gs` L70-L100 | Static secret and fallback logic permanently deleted. Backend strictly verifies Firebase ID token against Google Identity Toolkit. |
| 2 | **Public File Sharing (`ANYONE_WITH_LINK`)** | **Critical** | **Fixed** | `vault/Code.gs` L40-L55<br>`vault/Code.gs` L175-L185 | All `setSharing(ANYONE_WITH_LINK)` calls deleted. One-time `lockDownOnce()` function provided to convert all existing files/folders to `PRIVATE`. |
| 3 | **Unencrypted Cloud Storage of Files & Notes** | **High** | **Fixed** | `vault/script.js` L430-L510<br>`vault/script.js` L630-L720 | Client-side AES-256-GCM encryption with fresh 16B salt and 12B IV. Plaintext filenames disguised as random `.enc` identifiers. Notepad encrypted as `vault_notepad.enc`. |
| 4 | **Decrypted Credentials in Storage (`sessionStorage`)** | **High** | **Fixed** | `vault/script.js` L55-L65<br>`vault/script.js` L305-L330 | Purged all `sessionStorage` and `localStorage` caches. Decrypted credentials and notes exist strictly in volatile JS runtime memory and are wiped on lock/unload. |
| 5 | **PBKDF2 Key Derivation Iterations** | **Medium** | **Fixed** | `vault/script.js` L195-L250 | Iteration count increased from 100,000 to **600,000** iterations (OWASP recommendation). Backwards compatibility maintained for legacy 100k files via `packed.iter`. |
| 6 | **Weak Master Passphrase Risk** | **Medium** | **Fixed** | `vault/script.js` L255-L280<br>`vault/index.html` L270-L290 | Minimum 12-character passphrase enforced with real-time entropy meter. Vault initialization blocked if passphrase is weak. |
| 7 | **Passphrase Brute-Force / Timing Attacks** | **Medium** | **Fixed** | `vault/script.js` L285-L310 | Exponential cooldown penalty applied on failed decrypt attempts (1s, 2s, 4s, 8s, 16s, 32s, max 60s) with UI countdown lock. |
| 8 | **Arbitrary File ID Access / Path Traversal** | **High** | **Fixed** | `vault/Code.gs` L135-L150<br>`vault/Code.gs` L205-L220 | Backend `isChildOfVault()` validates that the file's parent folder strictly equals `FOLDER_ID`. Requests targeting files outside the vault boundary are rejected with 403. |
| 9 | **Clickjacking & Missing CSP** | **Medium** | **Fixed** | `vault/index.html` L8-L15<br>`firebase.json` L40-L55 | Strict Content-Security-Policy meta tag and hosting headers added: `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `no-referrer`, strict script/connect sources. |
| 10 | **XSS Injection via `innerHTML`** | **Medium** | **Fixed** | `vault/script.js` L340-L420<br>`vault/script.js` L740-L830 | All dynamic rendering converted to safe DOM methods (`document.createElement`, `element.textContent`, `safeEl`). Zero user-controlled strings rendered via `innerHTML`. |
| 11 | **Subresource Integrity (SRI) on CDNs** | **Low** | **Fixed** | `vault/index.html` L22-L28 | Cryptographic SHA-384 hashes added to FontAwesome and Firebase compat scripts (`crossorigin="anonymous"` and `integrity="sha384-..."`). |
| 12 | **Public Search Indexing & Crawling** | **Low** | **Fixed** | `vault/index.html` L9<br>`robots.txt` L2-L3 | Added `noindex, nofollow, noarchive, nosnippet` meta tags and `Disallow: /vault/` rule in `robots.txt`. |
| 13 | **Stale Blob URL Memory Leaks** | **Low** | **Fixed** | `vault/script.js` L80-L95 | Global tracking array `activeObjectUrls` automatically invokes `URL.revokeObjectURL()` on modal close, file switch, and vault lock. |
| 14 | **Inactivity & Focus Security Leak** | **Medium** | **Fixed** | `vault/script.js` L105-L170 | 3-minute inactivity watchdog, window blur listener, and `visibilitychange` (tab hidden) automatically trigger session lock and Firebase signOut. |
| 15 | **Public Portfolio Entry Points** | **Low** | **Fixed** | `index.html` L220-L235<br>`script.js` L3760-L3810 | Removed navigation links, footer lock icons, and stealth hotkey / long-press triggers from the main portfolio. |
| 16 | **Git History Secret Exposure** | **High** | **Manual Action Required** | Git commits `ea68d7e`, `5225973` | Legacy commits contain plaintext secret `ArpitVault@2026`. Requires repository history rewrite (`git filter-repo` / BFG) and secret rotation. |
| 17 | **Google Apps Script Properties Configuration** | **High** | **Manual Action Required** | Google Apps Script Editor | Requires setting `ADMIN_UID`, `FIREBASE_API_KEY`, and `FOLDER_ID` inside Script Properties. |

---

## 3. Manual Administrator Action Checklist (Console & Cloud)

The following steps require your physical login credentials and cannot be performed autonomously by an agent:

### A. Google Apps Script Configuration
1. Open [script.google.com](https://script.google.com) and navigate to your Vault relay project.
2. In the project code editor, replace `Code.gs` with the updated code from [`vault/Code.gs`](file:///c:/Users/Arpit%20Yadav/OneDrive/Documents/MINI%20PROJECT/website/vault/Code.gs).
3. Click the **Gear icon (Project Settings)** in the left sidebar:
   - Scroll down to **Script Properties** and click **Add script property**:
     * `ADMIN_UID`: Paste your Firebase User UID (found in Firebase Console > Authentication > Users tab).
     * `FIREBASE_API_KEY`: `AIzaSyAMMoUSW6BUvpNf0m9d8eHd3yT3MtNoV1w`
     * `FOLDER_ID`: The alphanumeric ID from your Google Drive folder URL (`drive.google.com/drive/folders/<FOLDER_ID>`).
   - Click **Save script properties**.
4. In the editor toolbar:
   - Select function `lockDownOnce` and click **Run**.
   - If prompted with "Authorization required", click **Review Permissions > Advanced > Go to Untitled (unsafe) > Allow**.
   - Verify in the Execution log that all existing files and the folder are converted to `PRIVATE`.
5. Deploy the new version:
   - Click **Deploy > Manage deployments**.
   - Click the **Pencil (Edit)** icon on your active Web App deployment.
   - Set **Version** to `New version`.
   - Ensure **Execute as** is set to `Me` and **Who has access** is set to `Anyone`.
   - Click **Deploy**.

### B. Google Drive Isolation
1. Open [drive.google.com](https://drive.google.com).
2. Locate the folder `Arpit_Dev_Vault`.
3. Right-click > **Share** > Under "General access", confirm it displays **"Restricted (Only people with access can open with the link)"**.

### C. Git History Scrubbing (Compromised Secret Remediation)
Because `ArpitVault@2026` was committed in previous git revisions (`ea68d7e`, `5225973`), the legacy secret must be considered permanently compromised.
To purge it from your Git history:
```bash
# Using git-filter-repo (Recommended):
pip install git-filter-repo
git filter-repo --replace-text <(echo "ArpitVault@2026==>REDACTED_SECRET") --force
git push origin --force --all
```
*(Note: Because our v2 backend completely deletes and ignores `SECRET_KEY`, an attacker possessing the old secret can no longer use it regardless of whether history is rewritten).*

---

## 4. Realistic Residual Risk Assessment

No web application or cryptographic system can ever be declared "100% unhackable." A realistic security posture requires recognizing residual risks:

1. **Endpoint / Device Compromise (Keyloggers & Info-Stealers):**
   - If malware or a compromised browser extension is running on the client machine, it can capture keystrokes when the Master Passphrase is typed or read volatile memory.
   - *Mitigation:* Access the vault only from clean, trusted devices with hardware disk encryption and reputable endpoint security.
2. **Master Passphrase Entropy & Forgetfulness:**
   - Client-side AES-256-GCM is zero-knowledge: there is no "Forgot Password" link and no recovery mechanism. If the Master Passphrase is lost, data recovery is mathematically impossible.
   - *Mitigation:* Store the Master Passphrase in an audited password manager (Bitwarden or 1Password) or an offline physical safe.
3. **Google Apps Script Quotas & Denial of Service:**
   - Google Apps Script enforces daily quotas (e.g. UrlFetch runtime, simultaneous execution limits, payload size limits ~50MB). An attacker flooding the endpoint cannot extract data, but could exhaust quotas, temporarily disrupting vault availability.
   - *Mitigation:* Backend applies fast-fail token checks before any heavy Drive or compute operations.
4. **Browser Extensions with Broad Host Permissions:**
   - Malicious browser extensions with `<all_urls>` permission can bypass Content-Security-Policy and read DOM contents after decryption.
   - *Mitigation:* Run the Vault in a dedicated clean browser profile or Incognito window with extensions disabled.
