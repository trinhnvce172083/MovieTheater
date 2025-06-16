// app/member/layout.tsx
import MemberHeader from "@/components/member/MemberHeader";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[280px] bg-gradient-to-b from-[#fef1df] to-[#d2e7f5]">
        <MemberHeader
          user={{
            name: "Alexa Rawles",
            email: "alexarawles@gmail.com",
            points: 0,
          }}
        />
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}
