// Validation utilities for authentication forms

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password, isSignUp = false) => {
  if (!password) return 'Password is required';
  if (isSignUp && password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name must be less than 50 characters';
  return null;
};

export const normalizeEmail = (email) => {
  return email ? email.toLowerCase().trim() : '';
};

// Firebase error code to user-friendly message mapping (cleaned up duplicates)
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/operation-not-allowed': 'This sign-in method is not enabled',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password',
    'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection and try again',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/account-exists-with-different-credential': 'An account already exists with this email but different sign-in method',
    'auth/popup-closed-by-user': 'Sign-in cancelled',
    'auth/popup-blocked': 'Sign-in popup blocked. Please allow popups and try again',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/invalid-verification-id': 'Invalid verification ID',
    'auth/code-expired': 'Verification code expired. Please request a new one',
    'auth/missing-verification-code': 'Please enter the verification code',
    'auth/missing-verification-id': 'Verification ID is missing',
    'auth/captcha-check-failed': 'Security verification failed. Please try again',
    'auth/invalid-phone-number': 'Invalid phone number format',
    'auth/missing-phone-number': 'Phone number is required',
    'auth/quota-exceeded': 'Service quota exceeded. Please try again later',
    'auth/app-deleted': 'This app has been deleted',
    'auth/app-not-authorized': 'App is not authorized for this operation',
    'auth/argument-error': 'Invalid arguments provided',
    'auth/invalid-api-key': 'Invalid API key',
    'auth/invalid-user-token': 'Your session has expired. Please sign in again',
    'auth/invalid-tenant-id': 'Invalid tenant ID',
    'auth/multi-factor-info-not-found': 'Multi-factor info not found',
    'auth/multi-factor-auth-required': 'Multi-factor authentication required',
    'auth/maximum-second-factor-count-exceeded': 'Maximum second factor count exceeded',
    'auth/second-factor-already-in-use': 'Second factor already in use',
    'auth/unsupported-first-factor': 'Unsupported first factor',
    'auth/unverified-email': 'Email address not verified',
    'auth/user-mismatch': 'User account mismatch',
    'auth/requires-recent-login': 'This operation requires recent login. Please sign in again',
    'auth/provider-already-linked': 'Provider already linked to this account',
    'auth/no-auth-event': 'No authentication event found',
    'auth/invalid-continue-uri': 'Invalid continue URL',
    'auth/missing-continue-uri': 'Continue URL is required',
    'auth/missing-ios-bundle-id': 'iOS bundle ID is required',
    'auth/missing-android-pkg-name': 'Android package name is required',
    'auth/unauthorized-continue-uri': 'Continue URL is not authorized',
    'auth/invalid-dynamic-link-domain': 'Invalid dynamic link domain',
    'auth/admin-restricted-operation': 'This operation is restricted to administrators',
    'auth/already-initialized': 'Firebase already initialized',
    'auth/app-not-installed': 'App is not installed',
    'auth/cordova-not-ready': 'Cordova framework not ready',
    'auth/cors-unsupported': 'CORS is not supported',
    'auth/credential-already-in-use': 'Credential is already in use',
    'auth/custom-token-mismatch': 'Custom token mismatch',
    'auth/dependent-sdk-initialized-before-auth': 'SDK initialization error',
    'auth/dynamic-link-not-activated': 'Dynamic link not activated',
    'auth/email-change-needs-verification': 'Email change needs verification',
    'auth/expired-action-code': 'Action code expired',
    'auth/cancelled-popup-request': 'Sign-in cancelled',
    'auth/internal-error': 'An internal error occurred. Please try again',
    'auth/invalid-app-credential': 'Invalid app credential',
    'auth/invalid-app-id': 'Invalid app ID',
    'auth/invalid-auth-event': 'Invalid authentication event',
    'auth/invalid-cert-hash': 'Invalid certificate hash',
    'auth/invalid-message-payload': 'Invalid message payload',
    'auth/invalid-multi-factor-session': 'Invalid multi-factor session',
    'auth/invalid-oauth-client-id': 'Invalid OAuth client ID',
    'auth/invalid-oauth-provider': 'Invalid OAuth provider',
    'auth/invalid-action-code': 'Invalid action code',
    'auth/unauthorized-domain': 'Domain is not authorized',
    'auth/invalid-persistence-type': 'Invalid persistence type',
    'auth/invalid-provider-id': 'Invalid provider ID',
    'auth/invalid-recipient-email': 'Invalid recipient email',
    'auth/invalid-sender': 'Invalid sender',
    'auth/missing-app-credential': 'App credential missing',
    'auth/auth-domain-config-required': 'Auth domain configuration required',
    'auth/missing-iframe-start': 'Missing iframe start',
    'auth/missing-or-invalid-nonce': 'Missing or invalid nonce',
    'auth/null-user': 'User is null',
    'auth/operation-not-supported-in-this-environment': 'Operation not supported in this environment',
    'auth/redirect-cancelled-by-user': 'Redirect cancelled by user',
    'auth/redirect-operation-pending': 'Redirect operation pending',
    'auth/rejected-credential': 'Credential rejected',
    'auth/second-factor-limit-exceeded': 'Second factor limit exceeded',
    'auth/tenant-id-mismatch': 'Tenant ID mismatch',
    'auth/timeout': 'Operation timed out',
    'auth/user-token-expired': 'User token expired',
    'auth/web-storage-unsupported': 'Web storage not supported'
  };
  
  // Ensure we always return a user-friendly message
  const message = errorMessages[errorCode];
  if (message) {
    return message;
  }
  
  // For unknown error codes, provide a generic message without exposing technical details
  return 'An unexpected error occurred. Please try again.';
};

// Check password strength and return feedback
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 'none', message: '' };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');
  
  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');
  
  // Number check
  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Add special characters');
  
  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|654321|qwerty|password/i // Common sequences
  ];
  
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    feedback.push('Avoid common patterns');
    score = Math.max(0, score - 1);
  }
  
  const strengthLevels = {
    0: 'very-weak',
    1: 'weak', 
    2: 'fair',
    3: 'good',
    4: 'strong',
    5: 'very-strong'
  };
  
  const strengthMessages = {
    'very-weak': 'Very weak password',
    'weak': 'Weak password',
    'fair': 'Fair password',
    'good': 'Good password',
    'strong': 'Strong password',
    'very-strong': 'Very strong password'
  };
  
  const strength = strengthLevels[score];
  
  return {
    strength,
    score,
    message: strengthMessages[strength],
    feedback: feedback,
    isStrong: score >= 3
  };
};