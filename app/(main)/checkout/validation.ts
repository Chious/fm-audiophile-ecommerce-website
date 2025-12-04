// Validation error messages
export const VALIDATION_MESSAGES = {
  name: {
    required: "Name is required",
  },
  email: {
    required: "Email is required",
    invalid: "Invalid email format",
  },
  phone: {
    required: "Phone number is required",
  },
  address: {
    required: "Address is required",
  },
  zip: {
    required: "ZIP code is required",
  },
  city: {
    required: "City is required",
  },
  country: {
    required: "Country is required",
  },
  payment: {
    required: "Payment method is required",
  },
  emoneyNumber: {
    required: "e-Money number is required",
  },
  emoneyPin: {
    required: "e-Money PIN is required",
  },
} as const;

// General error messages
export const ERROR_MESSAGES = {
  checkoutFailed: "Checkout failed. Please try again.",
  cartEmpty: "Your cart is empty",
  loading: "Loading...",
} as const;
