import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service governing use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        Terms of Service
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of{" "}
          {siteConfig.url} (the &quot;Site&quot;), operated by {siteConfig.name}. By using
          the Site, you agree to these Terms. If you do not agree, please do not use the
          Site.
        </p>

        <h2>Content and how it is produced</h2>
        <p>
          Articles on this Site are produced with the assistance of AI language models,
          based on publicly available source reporting, and are reviewed by a human editor
          before publication. Each article links to and credits its original source. While
          we aim for accuracy, articles may occasionally contain errors; see our{" "}
          <Link href="/about">About page</Link> for our editorial standards and{" "}
          <Link href="/contact">Contact page</Link> to report corrections.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site in any way that violates applicable law or regulation.</li>
          <li>
            Scrape, republish, or redistribute Site content at scale without permission,
            beyond normal reading, sharing, and fair-use quotation with attribution.
          </li>
          <li>Attempt to interfere with the Site&apos;s operation or security.</li>
          <li>Use automated means to access the Site in a manner that sends more request traffic than a human could reasonably generate.</li>
        </ul>

        <h2>Intellectual property</h2>
        <p>
          Original text, design, and branding on this Site are owned by {siteConfig.name}
          unless otherwise noted. Source material we reference remains the property of its
          respective owners; we link to and credit those sources rather than reproducing
          them. Trademarks, logos, and images belonging to third parties (including source
          publications) remain the property of their owners.
        </p>

        <h2>Third-party links and advertising</h2>
        <p>
          The Site may contain links to third-party websites and may display advertising
          served by third-party ad networks (see our <Link href="/privacy">Privacy Policy</Link>{" "}
          for details). We do not control and are not responsible for the content,
          accuracy, or practices of third-party sites or advertisers.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          The Site and its content are provided &quot;as is&quot; and &quot;as
          available&quot; without warranties of any kind, express or implied, including
          but not limited to accuracy, completeness, or fitness for a particular purpose.
          Content is provided for informational purposes only and does not constitute
          professional, financial, legal, or investment advice.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising
          from your use of, or inability to use, the Site.
        </p>

        <h2>Changes to these Terms</h2>
        <p>
          We may revise these Terms from time to time. Continued use of the Site after
          changes are posted constitutes acceptance of the revised Terms. Material changes
          will be reflected by updating the &quot;Last updated&quot; date above.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms can be sent via our <Link href="/contact">Contact page</Link>.
        </p>
      </div>
    </div>
  );
}
