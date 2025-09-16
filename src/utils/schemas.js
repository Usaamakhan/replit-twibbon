// Zod validation schemas for authentication forms

import { z } from 'zod';

// Common email schema with normalization
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .transform((email) => email.toLowerCase().trim());

// Simple password schema for sign-up - just require 8 characters minimum
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');

// Simplified password schema for sign-in (just check if not empty)
export const signInPasswordSchema = z
  .string()
  .min(1, 'Password is required');

// Full name schema
export const fullNameSchema = z
  .string()
  .min(1, 'Full name is required')
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