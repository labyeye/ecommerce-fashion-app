# Quick Testing Checklist

## Before Testing
- [ ] Backend running on `https://backend.flauntbynishi.com`
- [ ] Frontend running on `http://localhost:5173` (or your Vite port)
- [ ] Email service configured in backend `.env`
- [ ] Run `npm install` in backend folder to install axios

## Email OTP Testing

### Test 1: New User Registration via Email OTP
1. [ ] Open login page
2. [ ] Enter a new email address
3. [ ] Click "Send OTP" button
4. [ ] Check email inbox for OTP code
5. [ ] Verify email has Flaunt by Nishi branding
6. [ ] Enter the 6-digit code
7. [ ] Click "Sign In"
8. [ ] Should see registration form
9. [ ] Fill in first name, last name, and password
10. [ ] Click "Create Account"
11. [ ] Should be logged in and redirected to home page

### Test 2: Existing User Login via Email OTP
1. [ ] Open login page
2. [ ] Enter existing user email
3. [ ] Click "Send OTP"
4. [ ] Check email for code
5. [ ] Enter code and click "Sign In"
6. [ ] Should be logged in immediately (no registration form)

### Test 3: OTP Expiry
1. [ ] Request OTP
2. [ ] Wait 6 minutes
3. [ ] Try to use expired code
4. [ ] Should see error message

### Test 4: OTP Invalidation
1. [ ] Request OTP
2. [ ] Request another OTP for same email
3. [ ] Try to use first OTP
4. [ ] Should fail (invalidated)
5. [ ] Use second OTP
6. [ ] Should work

## Google Sign-In Testing

### Test 5: New User via Google
1. [ ] Open login page
2. [ ] Look for "Sign in with Google" button
3. [ ] Click button
4. [ ] Select Google account
5. [ ] Should see registration form
6. [ ] Enter first name, last name, and password
7. [ ] Click "Complete Registration"
8. [ ] Should be logged in and redirected

### Test 6: Existing Google User
1. [ ] Login with Google account used before
2. [ ] Click Google button
3. [ ] Should be logged in immediately (no registration)

## Error Scenarios

### Test 7: Invalid OTP
1. [ ] Request OTP
2. [ ] Enter wrong code
3. [ ] Should see error message

### Test 8: Empty Fields
1. [ ] Try to send OTP with empty email
2. [ ] Should see validation error

### Test 9: Network Errors
1. [ ] Stop backend server
2. [ ] Try to send OTP
3. [ ] Should see network error message

## Browser Console Checks
- [ ] No JavaScript errors in console
- [ ] Google Sign-In script loads successfully
- [ ] API calls show correct status codes
- [ ] JWT tokens are stored in localStorage

## Backend Checks
- [ ] OTP emails are being sent
- [ ] OTPs are stored in database with correct expiry
- [ ] Old OTPs are invalidated when new ones are sent
- [ ] Google tokens are verified correctly
- [ ] User records created with correct fields

## Known Issues to Watch For
- Google button not appearing? Check client ID and script loading
- OTP not received? Check email service configuration
- Errors on login? Check backend is running and CORS is configured
- TypeScript errors? Ensure google.d.ts file is in types folder

## Quick Fix Commands

If you need to reinstall dependencies:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend/website
rm -rf node_modules package-lock.json
npm install
```

If backend won't start:
```bash
cd backend
npm install axios
node server.js
```

## Success Criteria
✅ All tests pass
✅ No console errors
✅ Email OTP works for new and existing users
✅ Google Sign-In works for new and existing users
✅ Registration forms appear for new users
✅ Existing users login immediately
✅ Error messages are clear and helpful
✅ UI is responsive and user-friendly
