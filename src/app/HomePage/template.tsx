export default function HomeTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div key="home-template" className="home-template">
      {children}
    </div>
  );
}
