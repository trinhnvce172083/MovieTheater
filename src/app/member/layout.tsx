// app/member/layout.tsx
import MemberHeader from "@/components/member/MemberHeader";
import Header from "@/components/Header/Header";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>

      {/* Sidebar */}
      <aside className="w-[280px] bg-gradient-to-b from-[#fef1df] to-[#d2e7f5]">
        <MemberHeader />
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
