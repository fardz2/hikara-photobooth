// Validation for reservation phone numbers
const phoneValidation = /^8\d+$/; // Updated to accept phone numbers starting with 8

// Error message for an invalid phone number
const phoneErrorMessage = 'Phone number must start with 8 and contain only digits.';

// Minimum length comment
// Minimum length must be at least 8 characters

export { phoneValidation, phoneErrorMessage };