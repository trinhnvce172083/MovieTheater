export default function NowShowingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-orange-900 to-black">
      {children}
    </div>
  );
}
