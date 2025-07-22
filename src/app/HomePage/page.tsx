import { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: "Home | Lumiere Cinema",
  description: "Welcome to Lumiere Cinema - Now Showing and Upcoming Movies",
  keywords: ["cinema", "movies", "now showing", "upcoming", "lumiere", "entertainment"],
  openGraph: {
    title: "Lumiere Cinema - Your Movie Experience",
    description: "Discover now showing and upcoming movies at Lumiere Cinema",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
