/**
 * Form Validation Utilities
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
}

export function validateField(value: string, rules: ValidationRule): string | null {
  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address';
  }

  if (rules.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(value)) {
    return 'Please enter a valid phone number';
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Please enter a valid value';
  }

  return null;
}