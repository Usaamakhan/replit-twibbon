// Zod validation schemas for authentication forms

import { z } from 'zod';

// Common email schema with normalization
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .transform((email) => email.toLowerCase().trim());

// Strong password schema for sign-up
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(
    (password) => {
      // Check for common weak patterns
      const commonPatterns = [
        /(.)\1{2,}/, // Repeated characters (aaa, 111, etc.)
        /123456|654321|qwerty|password|admin/i, // Common sequences
        /^[0-9]+$/, // Only numbers
        /^[a-zA-Z]+$/, // Only letters
      ];
      return !commonPatterns.some(pattern => pattern.test(password));
    },
    'Password contains common patterns. Please choose a more secure password'
  );

// Simplified password schema for sign-in (just check if not empty)
export const signInPasswordSchema = z
  .string()
  .min(1, 'Password is required');

// Full name schema
export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters long')
  .max(50, 'Full name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((name) => name.trim());

// Sign In Form Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: signInPasswordSchema,
});

// Sign Up Form Schema
export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Forgot Password Form Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Helper function to extract first validation error message
export const getValidationError = (result) => {
  if (result.success) return null;
  
  const firstError = result.error.errors[0];
  return firstError?.message || 'Validation failed';
};