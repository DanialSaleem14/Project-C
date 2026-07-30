import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `Learn what ${siteConfig.name} covers, how our articles are produced, and our editorial standards.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        About {siteConfig.name}
      </h1>
      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          {siteConfig.name} tracks daily developments in artificial intelligence and turns
          them into clear, readable coverage: what happened, why it matters, and what it
          means for people building with AI, running businesses affected by it, or simply
          trying to keep up. We cover large language models, AI tools and products,
          research breakthroughs, business and industry impact, and practical tutorials.
        </p>

        <h2>How our articles are made</h2>
        <p>
          We monitor a curated set of primary sources &mdash; company blogs from major AI
          labs, established technology news outlets, and research publications &mdash; for
          newsworthy developments. Each candidate story is drafted into an original article
          using AI-assisted writing, then reviewed and edited by a human editor before
          publication. We do not republish or copy source articles; every piece is written
          fresh, with additional context and analysis, and always credits and links to its
          original source.
        </p>

        <h2>Editorial standards</h2>
        <ul>
          <li>Every article links back to the original source it was reported from.</li>
          <li>Articles are reviewed before publishing; nothing goes live automatically.</li>
          <li>
            We correct errors when we find them. If you spot one, please{" "}
            <a href="/contact">contact us</a>.
          </li>
          <li>
            We do not accept payment in exchange for favorable coverage of any product,
            company, or individual.
          </li>
        </ul>

        <h2>Get in touch</h2>
        <p>
          Questions, corrections, or feedback? Visit our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
