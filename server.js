const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// In-memory user store. In a real application you would persist users in a database.
const users = {};

const app = express();
// Listen on port 9500 by default. You can override the port by setting the
// PORT environment variable when starting the server.
const PORT = process.env.PORT || 9500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static('public'));

/**
 * Simulated authentication endpoint. Checks a user's username and password.
 * In a real application you would compare the supplied password to a hashed
 * password stored in your database. Here we simply accept any password.
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  // Create the user record on first login. In a real app you would look the
  // user up in your database and verify their password.
  if (!users[username]) {
    users[username] = {
      password, // not secure! Use hashed passwords in a real application
      totp: null,
    };
  }
  // Check password (always valid in this demo)
  if (users[username].password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Determine whether the user needs to set up TOTP
  if (!users[username].totp) {
    // Generate a new TOTP secret for the user
    const secret = speakeasy.generateSecret({ name: `DemoApp (${username})` });
    users[username].totp = {
      secret: secret.base32,
    };
    // Generate the otpauth URL for QR code
    const otpAuthUrl = secret.otpauth_url;
    // Generate QR code data URL
    QRCode.toDataURL(otpAuthUrl, (err, dataUrl) => {
      if (err) {
        console.error('Error generating QR code', err);
        return res.status(500).json({ error: 'Failed to generate QR code' });
      }
      res.json({ setup_required: true, otpAuthUrl: otpAuthUrl, qrCodeDataUrl: dataUrl });
    });
  } else {
    // TOTP already set up, require token verification
    res.json({ totp_required: true });
  }
});

/**
 * Endpoint for verifying a TOTP token. Expects { username, token } in the request
 * body. Returns success/failure. In a real application you would check whether
 * the user is already authenticated and properly authorised to call this route.
 */
app.post('/verify-totp', (req, res) => {
  const { username, token } = req.body;
  if (!username || !token) {
    return res.status(400).json({ error: 'Missing username or token' });
  }
  const userRecord = users[username];
  if (!userRecord || !userRecord.totp) {
    return res.status(404).json({ error: 'User or TOTP setup not found' });
  }
  const { secret } = userRecord.totp;
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // allow 30 seconds clock drift (optional)
  });
  if (verified) {
    // Generate a dummy session token or set session cookie here. For demonstration
    // we just return success.
    return res.json({ success: true, message: 'TOTP validated successfully' });
  }
  res.status(401).json({ error: 'Invalid TOTP token' });
});

// A simple endpoint to get the current user info (for demo purposes)
app.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const userRecord = users[username];
  if (!userRecord) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ username, totpEnabled: !!userRecord.totp });
});

app.listen(PORT, () => {
  console.log(`TOTP demo server running on http://localhost:${PORT}`);
});