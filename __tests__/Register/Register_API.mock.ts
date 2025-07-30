export const InputData = {
  validRegisterData: {
    username: "testuser",
    fullName: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    phoneNumber: "0123456789",
    dateOfBirth: "1990-01-01",
    address: "123 Test Street",
    agreeToTerms: true,
    acceptMarketing: false,
    role: "MEMBER"
  },
  invalidRegisterData: {
    username: "",
    fullName: "",
    email: "invalid-email",
    password: "123",
    confirmPassword: "different",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    agreeToTerms: false,
    acceptMarketing: false,
    role: "MEMBER"
  },
  existingUserData: {
    username: "existinguser",
    fullName: "Existing User",
    email: "existing@example.com",
    password: "password123",
    confirmPassword: "password123",
    phoneNumber: "0123456789",
    dateOfBirth: "1990-01-01",
    address: "123 Test Street",
    agreeToTerms: true,
    acceptMarketing: false,
    role: "MEMBER"
  }
};

export const SuccessResponse = {
  success: true,
  message: "User registered successfully",
  data: {
    userId: "12345",
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    role: "MEMBER"
  }
};

export const WrongInputResponse = {
  success: false,
  message: "Invalid input data",
  code: 400,
  errorCode: "INVALID_INPUT",
  timestamp: "2024-01-01T00:00:00Z"
};

export const ExistingUserResponse = {
  success: false,
  message: "Username already exists",
  code: 409,
  errorCode: "USERNAME_EXISTS",
  timestamp: "2024-01-01T00:00:00Z"
};

export const EmailExistsResponse = {
  success: false,
  message: "Email already exists",
  code: 409,
  errorCode: "EMAIL_EXISTS",
  timestamp: "2024-01-01T00:00:00Z"
};

export const ServerErrorResponse = {
  success: false,
  message: "Internal server error",
  code: 500,
  errorCode: "INTERNAL_ERROR",
  timestamp: "2024-01-01T00:00:00Z"
};

export const ValidationErrors = {
  username: "Username is required",
  fullName: "Full name is required",
  email: "Please enter a valid email address",
  password: "Password must be at least 6 characters",
  confirmPassword: "Passwords do not match",
  phoneNumber: "Phone number is required",
  dateOfBirth: "Date of birth is required",
  agreeToTerms: "You must agree to the Terms of Service"
}; 