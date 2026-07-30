import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-neutral-50">
        Page not found
      </h1>
      <p className="mb-8 text-neutral-500 dark:text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded bg-neutral-900 px-5 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
      >
        Back to homepage
      </Link>
    </div>
  );
}
