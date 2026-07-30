import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}: what data we collect, how we use it, and your choices.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        Privacy Policy
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p>
          This Privacy Policy explains how {siteConfig.name} (&quot;we&quot;, &quot;us&quot;,
          or &quot;our&quot;) collects, uses, and shares information when you visit{" "}
          {siteConfig.url}. By using the site, you agree to the practices described here.
        </p>

        <h2>Information we collect</h2>
        <p>We do not require you to create an account to read articles on this site. We may collect:</p>
        <ul>
          <li>
            <strong>Usage data</strong>: pages visited, referring pages, approximate
            location, device and browser type, collected automatically via standard web
            server logs and analytics tools.
          </li>
          <li>
            <strong>Information you provide</strong>: if you email us via the Contact page,
            we retain that correspondence to respond to you.
          </li>
        </ul>

        <h2>Cookies and similar technologies</h2>
        <p>
          This site, and third parties we work with, may use cookies, pixels, and similar
          technologies to operate the site, remember preferences, measure traffic, and
          &mdash; where enabled &mdash; serve advertising.
        </p>

        <h2>Advertising and Google AdSense</h2>
        <p>
          We may display advertisements served by Google AdSense and other ad networks.
          These third parties may use cookies (including the DoubleClick cookie) to serve
          ads based on your prior visits to this site or other websites. Google&apos;s use
          of advertising cookies enables it and its partners to serve ads based on your
          visit to this site and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
          , or by visiting{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            www.aboutads.info/choices
          </a>{" "}
          to opt out of participating vendors&apos; use of cookies for personalized
          advertising.
        </p>

        <h2>Analytics</h2>
        <p>
          We may use analytics services (such as Google Analytics) to understand how
          visitors use the site in aggregate. These services may set their own cookies and
          collect information subject to their own privacy policies.
        </p>

        <h2>Third-party links</h2>
        <p>
          Our articles link to original source articles and other third-party websites.
          We are not responsible for the privacy practices or content of those external
          sites. We encourage you to review their privacy policies.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          This site is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13.
        </p>

        <h2>Your choices</h2>
        <p>
          Most browsers let you block or delete cookies through their settings. Blocking
          cookies may affect how parts of the site function. You may also use browser
          extensions or the opt-out tools linked above to limit ad personalization.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain server logs and analytics data only as long as necessary for the
          purposes described above, and correspondence sent via our Contact page for as
          long as needed to address your request.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          reflected by updating the &quot;Last updated&quot; date above.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this Privacy Policy can be sent via our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
