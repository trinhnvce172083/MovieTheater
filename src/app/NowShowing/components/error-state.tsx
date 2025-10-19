"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Alert className="max-w-md border-red-500/20 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-300">Error Loading Movies</AlertTitle>
        <AlertDescription className="text-red-200">{error}</AlertDescription>
      </Alert>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4 border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}
