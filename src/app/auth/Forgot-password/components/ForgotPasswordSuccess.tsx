import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";

interface ForgotPasswordSuccessProps {
  email: string;
  onBackToLogin: () => void;
}

export default function ForgotPasswordSuccess({ email, onBackToLogin }: ForgotPasswordSuccessProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <MailOutlined className="text-green-600 text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            Check Your Email
          </CardTitle>
          <p className="text-gray-600 text-sm leading-relaxed">
            We&#39;ve sent a password reset link to
          </p>
          <p className="text-blue-600 font-medium text-sm">{email}</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Click the link in your email to reset your password. If you
              don&#39;t see it, check your spam folder.
            </p>
          </div>
          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="w-full mt-4 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeftOutlined className="mr-2" />
            Back to Login
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Redirecting to login in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
