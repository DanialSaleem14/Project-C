import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSlot } from "@/components/ads/AdSlot";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-5xl px-4 pt-4">
        <AdSlot variant="leaderboard" />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
