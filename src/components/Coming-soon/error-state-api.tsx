"use client";

import { AlertCircle, RefreshCw, Wifi, WifiOff, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateApiProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorStateApi({ error, onRetry }: ErrorStateApiProps) {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes("Network Error") || errorMessage.includes("fetch")) {
      return {
        type: "network",
        icon: WifiOff,
        title: "Network Connection Error",
        description: "Unable to connect to the API server. Please check your internet connection.",
        color: "text-red-400"
      };
    } else if (errorMessage.includes("500") || errorMessage.includes("server")) {
      return {
        type: "server",
        icon: Server,
        title: "Server Error",
        description: "The API server is experiencing issues. Please try again later.",
        color: "text-orange-400"
      };
    } else if (errorMessage.includes("404")) {
      return {
        type: "notfound",
        icon: AlertCircle,
        title: "Resource Not Found",
        description: "The requested movies data could not be found.",
        color: "text-yellow-400"
      };
    } else {
      return {
        type: "general",
        icon: AlertCircle,
        title: "Error Loading Movies",
        description: "An unexpected error occurred while fetching movie data.",
        color: "text-red-400"
      };
    }
  };

  const errorInfo = getErrorType(error);
  const ErrorIcon = errorInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-orange-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert className="border-red-500/20 bg-red-500/10 backdrop-blur-sm">
          <ErrorIcon className={`h-5 w-5 ${errorInfo.color}`} />
          <AlertTitle className={`${errorInfo.color} text-lg font-semibold`}>
            {errorInfo.title}
          </AlertTitle>
          <AlertDescription className="text-red-200 mt-2">
            {errorInfo.description}
          </AlertDescription>
          
          {/* Error Details */}
          <div className="mt-4 p-3 bg-black/30 rounded-lg border border-red-500/20">
            <p className="text-xs text-gray-400 font-mono">
              {error}
            </p>
          </div>
        </Alert>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20">
          <h3 className="text-orange-300 font-semibold mb-3 text-sm">Troubleshooting Tips:</h3>
          <ul className="text-xs text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>Verify the API server is running</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>Try refreshing the page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              <span>Contact support if the issue persists</span>
            </li>
          </ul>
        </div>

        {/* API Status */}
        
        
        
        
        
        
      </div>
    </div>
  );
} 