import { useEffect } from "react";
import { toast } from "sonner";

// This component is used to display error messages during the login process.
export default function LoginError({ error }: { error: Error | null }) {
  // Extract error message from API response if available
  const getErrorMessage = (error: Error) => {
    try {
      console.log("Login Error object:", error); // Debug log

      // Check if error has response data (from API calls)
      if (error && typeof error === "object") {
        // Check for response property (axios errors)
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          const response = error.response as {
            data?: {
              message?: string;
              errors?: Array<{ message?: string; field?: string }>;
            };
          };
          if (response.data) {
            // Priority: specific message from API
            if (response.data.message) {
              return response.data.message;
            }
            // Check for validation errors
            if (
              response.data.errors &&
              Array.isArray(response.data.errors) &&
              response.data.errors.length > 0
            ) {
              return (
                response.data.errors[0].message ||
                `${response.data.errors[0].field} error`
              );
            }
          }
        }

        // Check for cause property (fetch errors)
        if (
          "cause" in error &&
          error.cause &&
          typeof error.cause === "object"
        ) {
          const cause = error.cause as { message?: string };
          if (cause.message) {
            return cause.message;
          }
        }

        // Try to parse error message if it's a JSON string
        if (error.message) {
          try {
            const parsedError = JSON.parse(error.message);

            // If there's a specific message field, use it
            if (parsedError.message) {
              return parsedError.message;
            }

            // If there are validation errors, display the first one
            if (
              parsedError.errors &&
              Array.isArray(parsedError.errors) &&
              parsedError.errors.length > 0
            ) {
              return (
                parsedError.errors[0].message ||
                `${parsedError.errors[0].field} error`
              );
            }

            // Fallback to general message
            return parsedError.errorCode || "Login validation error occurred";
          } catch {
            // If not JSON, check if it's a meaningful message (not just status code)
            if (
              error.message &&
              !error.message.match(/^\d+$/) &&
              !error.message.includes("Failed to fetch")
            ) {
              return error.message;
            }
          }
        }

        // Check if it's a fetch error with status
        if (error.message && error.message.includes("400")) {
          return "Invalid login credentials. Please check your input and try again.";
        }

        if (error.message && error.message.includes("401")) {
          return "Authentication failed. Please check your username and password.";
        }

        if (error.message && error.message.includes("403")) {
          return "Access denied. Your account may be locked or inactive.";
        }

        if (error.message && error.message.includes("500")) {
          return "Server error. Please try again later.";
        }
      }

      return "Login failed. Please try again.";
    } catch (err) {
      console.error("Error parsing login error message:", err);
      return "Login failed. Please try again.";
    }
  };

  useEffect(() => {
    if (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
      });
    }
  }, [error]);

  return null; // Don't render anything, just handle the toast
}
