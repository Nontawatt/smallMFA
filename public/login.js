(() => {
  const form = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const tokenInput = document.getElementById('token');
  const totpSection = document.getElementById('totp-section');
  const qrSetup = document.getElementById('qr-setup');
  const qrCodeDiv = document.getElementById('qr-code');
  const messageDiv = document.getElementById('message');
  const submitButton = document.getElementById('submit-button');

  // Detect configuration from the script tag. This allows a site embedding the
  // script to specify which backend to talk to and which user to prefill. The
  // script can be loaded with query parameters or data attributes:
  // <script src=".../login.js?site=example.com&user=john"></script>
  // or
  // <script src=".../login.js" data-site="example.com" data-user="john"></script>
  let apiBase = '';
  (() => {
    const scripts = document.getElementsByTagName('script');
    let found;
    for (let i = scripts.length - 1; i >= 0; i--) {
      const s = scripts[i];
      if (s.src && s.src.includes('login.js')) {
        found = s;
        break;
      }
    }
    const scriptEl = found || document.currentScript;
    if (scriptEl) {
      const url = new URL(scriptEl.src, window.location.href);
      const site = scriptEl.getAttribute('data-site') || url.searchParams.get('site');
      const user = scriptEl.getAttribute('data-user') || url.searchParams.get('user');
      if (site) {
        apiBase = site.startsWith('http') ? site : `https://${site}`;
      }
      if (user) {
        usernameInput.value = user;
        usernameInput.readOnly = true;
      }
    }
  })();

  // Keep track of our current login stage: "login", "setup", "verify"
  let stage = 'login';

  function showMessage(msg, isError = true) {
    messageDiv.textContent = msg;
    messageDiv.classList.remove('hidden');
    messageDiv.style.color = isError ? '#d63384' : '#28a745';
  }

  function clearMessage() {
    messageDiv.classList.add('hidden');
    messageDiv.textContent = '';
  }

  async function handleLogin(e) {
    e.preventDefault();
    clearMessage();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    // If we are in the setup or verify stage, handle token submission
    if (stage === 'setup' || stage === 'verify') {
      const token = tokenInput.value.trim();
      if (token.length !== 6) {
        showMessage('Please enter a 6‑digit TOTP code. / กรุณากรอกรหัส TOTP 6 หลัก');
        return;
      }
      submitButton.disabled = true;
      try {
      const res = await fetch(`${apiBase}/verify-totp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, token }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'TOTP verification failed');
        }
        // Success! Show a success message and optionally redirect.
        showMessage('Login successful! TOTP validated. / เข้าสู่ระบบสำเร็จ รหัส TOTP ถูกต้อง', false);
        // You might redirect to a protected page here.
        form.reset();
        submitButton.disabled = false;
        stage = 'login';
        totpSection.classList.add('hidden');
        qrSetup.classList.add('hidden');
      } catch (err) {
        showMessage(err.message);
        submitButton.disabled = false;
      }
      return;
    }
    // Normal login stage
    submitButton.disabled = true;
    try {
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      // Determine response type
      if (data.setup_required) {
        // Show QR code for initial TOTP setup
        stage = 'setup';
        totpSection.classList.remove('hidden');
        qrSetup.classList.remove('hidden');
        qrCodeDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = data.qrCodeDataUrl;
        img.alt = 'TOTP QR Code';
        img.style.width = '200px';
        img.style.height = '200px';
        qrCodeDiv.appendChild(img);
        showMessage('Scan the QR code and enter the code from your authenticator app. / สแกนคิวอาร์โค้ดและกรอกรหัสจากแอปยืนยันตัวตน', false);
        submitButton.disabled = false;
      } else if (data.totp_required) {
        // Already has TOTP: ask for code
        stage = 'verify';
        totpSection.classList.remove('hidden');
        qrSetup.classList.add('hidden');
        showMessage('Enter the 6‑digit code from your authenticator app. / กรุณากรอกรหัส 6 หลักจากแอปยืนยันตัวตน', false);
        submitButton.disabled = false;
      } else {
        // Unexpected; maybe user has no 2FA enabled
        showMessage('Login successful (no TOTP configured). / เข้าสู่ระบบสำเร็จ (ยังไม่ได้ตั้งค่า TOTP)', false);
        submitButton.disabled = false;
        form.reset();
      }
    } catch (err) {
      showMessage(err.message);
      submitButton.disabled = false;
    }
  }

  form.addEventListener('submit', handleLogin);
})();
