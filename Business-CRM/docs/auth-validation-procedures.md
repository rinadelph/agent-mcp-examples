# Authentication Validation Procedures

This document outlines step-by-step procedures for validating the authentication system functionality.

## Quick Validation Tests

### Test 1: Basic Login Flow
1. Open the application in a browser
2. Navigate to `/login`
3. Enter valid test credentials
4. Click "Login" button
5. **Expected:** Redirect to home page with success message
6. **Verify:** User menu shows logout option

### Test 2: Registration with Password Strength
1. Navigate to `/register`
2. Enter full name: "Test User"
3. Enter email: "test@example.com"
4. Enter weak password: "123"
5. **Expected:** Password strength meter shows "Very Weak"
6. **Expected:** Register button is disabled
7. Enter strong password: "Test123!@#"
8. **Expected:** Password strength meter shows "Strong"
9. **Expected:** Register button becomes enabled

### Test 3: Rate Limiting Protection
1. Navigate to `/login`
2. Enter invalid credentials 5 times consecutively
3. **Expected:** After 5th attempt, account lockout message appears
4. **Expected:** Login button becomes disabled
5. **Expected:** Countdown timer shows remaining lockout time

### Test 4: Route Protection
1. Without logging in, try to navigate to `/account`
2. **Expected:** Redirect to `/login` with query parameter
3. Login with valid credentials
4. **Expected:** Redirect back to `/account`

### Test 5: Admin Access Control
1. Login as regular user
2. Try to navigate to `/admin`
3. **Expected:** Redirect to `/account` page
4. Logout and login as admin user
5. **Expected:** Can access `/admin` page

## Detailed Validation Steps

### Authentication Store Validation

#### Test Auth Store State Management
```javascript
// Open browser console and test auth store
const authStore = useAuthStore()

// Check initial state
console.log('Initial auth state:', {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user,
  isAdmin: authStore.isAdmin
})

// Test login (use actual test credentials)
await authStore.login('test@example.com', 'password123')

// Verify state after login
console.log('Post-login state:', {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user,
  profile: authStore.profile,
  isAdmin: authStore.isAdmin
})
```

#### Test Security Features
```javascript
// Test rate limiting state
console.log('Security state:', {
  loginAttempts: authStore.loginAttempts,
  isLockedOut: authStore.isLockedOut,
  canAttemptLogin: authStore.canAttemptLogin
})

// Test session extension
authStore.extendSession()
console.log('Session extended')
```

### Form Validation Testing

#### Password Strength Validation
1. Open `/register` page
2. Open browser console
3. Enter different passwords and observe:
```javascript
// Check password strength for different inputs
passwords = [
  'weak',           // Very Weak
  'Weak1',          // Weak  
  'Weak12',         // Fair
  'Weak123!',       // Good
  'StrongPass123!'  // Strong
]

// Test each password in the form and observe strength meter
```

#### Form Error Handling
1. Test form submission with empty fields
2. Test invalid email formats
3. Test password confirmation mismatch
4. Verify all error messages display correctly

### API Integration Validation

#### Test Authentication Endpoints
```javascript
// Test auth API functions (use browser console)
import { signIn, signUp, signOut, getCurrentUser } from '@/services/api'

// Test invalid login
try {
  const result = await signIn('invalid@test.com', 'wrongpassword')
  console.log('Invalid login result:', result)
} catch (error) {
  console.log('Expected error:', error)
}

// Test valid login (use actual test credentials)
try {
  const result = await signIn('test@example.com', 'correctpassword')
  console.log('Valid login result:', result)
} catch (error) {
  console.log('Unexpected error:', error)
}

// Test current user retrieval
const currentUser = await getCurrentUser()
console.log('Current user:', currentUser)
```

### Route Guard Validation

#### Manual Route Testing
1. **Guest Route Test:**
   - Login as user
   - Try to access `/login` or `/register`
   - Should redirect to home page

2. **Auth Required Test:**
   - Logout
   - Try to access `/account` or `/checkout`
   - Should redirect to login with redirect query

3. **Admin Required Test:**
   - Login as non-admin user
   - Try to access `/admin`
   - Should redirect to account page

#### Programmatic Route Testing
```javascript
// Test route guards programmatically
import { useRouter } from 'vue-router'
const router = useRouter()

// Test protected route access
router.push('/account')
// Observe redirect behavior based on auth state
```

### Session Management Validation

#### Session Persistence Test
1. Login to the application
2. Refresh the browser page
3. **Expected:** User remains logged in
4. Close browser tab and reopen
5. **Expected:** User remains logged in

#### Session Timeout Test (Modified for Testing)
```javascript
// Temporarily reduce session timeout for testing
// Note: This would be done in auth store for testing only
const authStore = useAuthStore()

// Override timeout duration (test only - don't commit this)
// In setupSessionTimeout function, change to 1 minute instead of 2 hours
// const timeoutDuration = 1 * 60 * 1000 // 1 minute for testing
```

### Security Validation

#### Information Leakage Test
1. Try to login with non-existent email
2. **Expected:** Generic error message (not "user not found")
3. Try to login with existing email but wrong password
4. **Expected:** Same generic error message

#### XSS Protection Test
1. Try to enter malicious scripts in form fields:
   - `<script>alert('xss')</script>`
   - `javascript:alert('xss')`
2. **Expected:** Scripts should not execute
3. Check that user data is properly escaped in display

### Performance Validation

#### Load Time Testing
1. Measure auth store initialization time
2. Test form rendering performance
3. Check password strength meter responsiveness
4. Verify no memory leaks in auth state

#### Concurrent Session Testing
1. Open application in multiple browser tabs
2. Login in one tab
3. **Expected:** All tabs reflect logged-in state
4. Logout in one tab
5. **Expected:** All tabs reflect logged-out state

## Validation Checklist

### Core Functionality
- [ ] Login with valid credentials works
- [ ] Registration creates new user account
- [ ] Logout clears all authentication state
- [ ] Route guards protect appropriate pages
- [ ] Admin access control works correctly

### Security Features
- [ ] Rate limiting prevents brute force attempts
- [ ] Password strength requirements are enforced
- [ ] Error messages don't reveal sensitive information
- [ ] Session timeout provides security
- [ ] XSS protection is effective

### User Experience
- [ ] Forms provide clear validation feedback
- [ ] Loading states are shown during operations
- [ ] Error messages are user-friendly
- [ ] Success messages confirm operations
- [ ] Responsive design works on mobile

### Performance
- [ ] Auth operations complete quickly
- [ ] No memory leaks in auth store
- [ ] Form interactions are responsive
- [ ] Page loads are fast

## Troubleshooting Common Issues

### Login Not Working
1. Check browser console for errors
2. Verify Supabase configuration
3. Check network tab for failed requests
4. Validate user credentials in database

### Route Guards Not Working
1. Verify auth store state is correct
2. Check route meta properties
3. Ensure guards are properly defined
4. Test auth status checking

### Form Validation Issues
1. Check Zod schema definitions
2. Verify form field bindings
3. Test validation trigger events
4. Check error message display

### Session Management Problems
1. Verify checkAuthStatus function
2. Check session timeout configuration
3. Test state persistence
4. Validate logout functionality

---

## Automated Testing Setup (Future)

For comprehensive automated testing, consider implementing:

1. **Unit Tests:** Test auth store functions
2. **Component Tests:** Test form validation
3. **Integration Tests:** Test API interactions
4. **E2E Tests:** Test complete user flows

Example test frameworks:
- Vitest for unit/component tests
- Cypress or Playwright for E2E tests
- MSW for API mocking

---

**Note:** Always perform validation in a development environment first. Never test security features like rate limiting or account lockout in production.