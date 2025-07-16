export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div key="login-template" className="auth-template">
      {children}
    </div>
  );
}
