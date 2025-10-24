# Authentication Guide - Flaunt by Nishi

## Overview

This guide explains the authentication system with **Email-based OTP** and **Google Sign-In** (without Passport).

---

## Changes Made

### ✅ Removed
- **Twilio** SMS-based OTP (phone authentication)
- **Passport.js** and passport-google-oauth20

### ✅ Added
- **Email-based OTP** verification
- **Google Sign-In** using Google OAuth2 (direct token verification)
- **axios** for HTTP requests

---

## API Endpoints

### 1. Send OTP (Email-based)
**POST** `/api/auth/send-otp`

```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

- Generates a 6-digit OTP
- Sends OTP via email
- OTP expires in 5 minutes

---

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

**Response (New User):**
```json
{
  "success": true,
  "userExists": false,
  "tempToken": "temp_jwt_token"
}
```

---

### 3. Register with OTP
**POST** `/api/auth/register-with-otp`

```json
{
  "tempToken": "temp_jwt_token_from_verify",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword",
  "phone": "+919876543210" // optional
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

---

### 4. Google Sign-In
**POST** `/api/auth/google`

```json
{
  "idToken": "google_id_token_from_frontend"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

**How it works:**
- Frontend gets Google ID token using Google Sign-In library
- Backend verifies token with Google's tokeninfo endpoint
- Creates user if new, or logs in existing user
- Links Google account to existing email if found

---

## Frontend Implementation

### Email OTP Login Flow

```javascript
// 1. Request OTP
const sendOTP = async (email) => {
  const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  return data;
};

// 2. Verify OTP
const verifyOTP = async (email, code) => {
  const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  const data = await response.json();
  
  if (data.userExists === false) {
    // New user - collect additional info
    return { isNewUser: true, tempToken: data.tempToken };
  } else {
    // Existing user - logged in
    localStorage.setItem('token', data.token);
    return { isNewUser: false, user: data.user };
  }
};

// 3. Register new user (if needed)
const registerWithOTP = async (tempToken, firstName, lastName, password, phone) => {
  const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/register-with-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, firstName, lastName, password, phone })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
};
```

---

### Google Sign-In Implementation

#### 1. Install Google Sign-In Library

```bash
npm install @react-oauth/google
```

#### 2. Setup in React App

```jsx
// main.tsx or App.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

root.render(
  <GoogleOAuthProvider clientID={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
```

#### 3. Google Sign-In Button Component

```jsx
import { GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        // Redirect to dashboard or home
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Login Failed')}
        useOneTap
      />
    </div>
  );
}
```

---

## Environment Variables

Add to your `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Email Service (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@flauntbynishi.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## Database Model Updates

### User Model (`models/User.js`)

Added fields:
```javascript
{
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Not required for Google OAuth users
    }
  }
}
```

### OTP Model (`models/Otp.js`)

Changed from phone to email:
```javascript
{
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, enum: ['email-verification', 'login', 'password-reset'] },
  used: { type: Boolean, default: false }
}
```

---

## Testing

### Test OTP Flow
```bash
# 1. Send OTP
curl -X POST https://ecommerce-fashion-app-som7.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check terminal/email for OTP code

# 2. Verify OTP
curl -X POST https://ecommerce-fashion-app-som7.vercel.app/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### Test Google Sign-In
1. Get Google ID token from frontend
2. Send to backend:
```bash
curl -X POST https://ecommerce-fashion-app-som7.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your_google_id_token"}'
```

---

## Security Features

✅ **OTP expires in 5 minutes**
✅ **One-time use** (marked as used after verification)
✅ **Previous OTPs invalidated** when new OTP is requested
✅ **Google token verification** with Google's tokeninfo API
✅ **JWT tokens** for session management
✅ **Bcrypt password hashing**
✅ **Email verification** (via OTP for new users)

---

## Migration Notes

### For Existing Phone-based Users
If you had users with phone authentication, you'll need to:
1. Add email field to existing users
2. Prompt them to verify email with OTP
3. Migrate their data accordingly

### Removing Old Dependencies
```bash
npm uninstall twilio passport passport-google-oauth20
npm install axios
```

---

## Support

For issues or questions, contact the development team or refer to:
- Google Sign-In Docs: https://developers.google.com/identity/gsi/web
- Nodemailer Docs: https://nodemailer.com/
