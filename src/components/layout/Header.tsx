import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/article";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {siteConfig.name}
          </Link>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {CATEGORY_LABELS[category]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
