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
  if (name.trim().length < 3) return 'Name must be at least 3 characters long';
  if (name.length > 50) return 'Name must be less than 50 characters';
  return null;
};

export const normalizeEmail = (email) => {
  return email ? email.toLowerCase().trim() : '';
};

// Shared form validation function for all authentication forms
export const validateForm = (formData, formType = 'signin') => {
  const errors = {};
  let firstErrorField = null;

  // Name validation (signup only)
  if (formType === 'signup') {
    const name = formData.get('name')?.trim();
    const nameError = validateName(name);
    if (nameError) {
      errors.name = nameError;
      if (!firstErrorField) firstErrorField = 'name';
    }
  }

  // Email validation (all forms)
  const email = formData.get('email')?.trim();
  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
    if (!firstErrorField) firstErrorField = 'email';
  }

  // Password validation (signin and signup only)
  if (formType !== 'forgot-password') {
    const password = formData.get('password')?.trim();
    const passwordError = validatePassword(password, formType === 'signup');
    if (passwordError) {
      errors.password = passwordError;
      if (!firstErrorField) firstErrorField = 'password';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField
  };
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