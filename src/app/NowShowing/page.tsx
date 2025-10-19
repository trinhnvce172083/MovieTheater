import { Metadata } from "next";
import NowShowingContent from "./NowShowingContent";

export const metadata: Metadata = {
  title: "Now Showing | Lumiere Cinema",
  description: "Discover the latest blockbusters and must-see films playing in theaters now. Book your tickets online at Lumiere Cinema.",
  keywords: ["now showing", "cinema", "movies", "current films", "blockbusters", "lumiere", "tickets"],
  openGraph: {
    title: "Now Showing - Lumiere Cinema",
    description: "Discover the latest blockbusters and must-see films playing in theaters now",
    type: "website",
  },
};

export default function NowShowingPage() {
  return <NowShowingContent />;
}
