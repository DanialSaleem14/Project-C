import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach the ${siteConfig.name} team with questions, corrections, or feedback.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        Contact
      </h1>
      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          We welcome questions, corrections, and feedback from readers. Reach us by email
          and we&apos;ll respond as soon as we can:
        </p>
        <p>
          <a href="mailto:hello@learnaboutai.example.com">hello@learnaboutai.example.com</a>
        </p>

        <h2>Corrections</h2>
        <p>
          If you believe something we published is inaccurate, please include the article
          URL and a brief description of the issue. We review every correction request and
          update articles when warranted.
        </p>

        <h2>Source and republishing requests</h2>
        <p>
          If you are a publication or rights holder with a concern about how a source was
          referenced or attributed in one of our articles, please email us with the article
          URL and details, and we will investigate promptly.
        </p>
      </div>
    </div>
  );
}
