import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DirectoryExplorer from "@/components/DirectoryExplorer";
import { getMandal } from "@/lib/organization";

export const dynamic = "force-dynamic";

export default async function Home() {
  const mandal = await getMandal();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
            Kundapura Mandala
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Member Directory
          </h1>
          <p className="mt-2 max-w-xl text-base text-stone-500">
            Browse Mandala → Stana (Grama) → Upavathi → Area (Shakaha), or view all members at once.
          </p>
        </div>
        <DirectoryExplorer mandal={mandal} />
      </main>
      <Footer />
    </div>
  );
}
