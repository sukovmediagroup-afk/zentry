import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { fetchMarketTicks } from "@/lib/providers";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "ARENA USA Terms of Service. The rules and terms that govern your use of our website and services.",
  path: "/terms",
});

const LAST_UPDATED = "October 30, 2026";
const EFFECTIVE_DATE = "October 30, 2026";

export default async function TermsPage() {
  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={ticks} />

      <article className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-amber-glow">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Terms of Service</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-bronze/15">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Effective Date:</strong> {EFFECTIVE_DATE}
            <br />
            <strong className="text-foreground">Last Updated:</strong> {LAST_UPDATED}
          </p>
        </header>

        <div className="prose-legal text-foreground/90 leading-relaxed space-y-6 text-sm sm:text-base">
          <p>
            Welcome to ARENA USA. By accessing or using our website at{" "}
            <a href="https://zentry-rust.vercel.app" className="text-amber-glow hover:underline">
              zentry-rust.vercel.app
            </a>{" "}
            (the &quot;Service&quot;), you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree, please do not use the Service.
          </p>

          <Section title="1. Definitions">
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>&quot;Service&quot;</strong> refers to the ARENA USA website and all related APIs.</li>
              <li><strong>&quot;We&quot;, &quot;us&quot;, &quot;our&quot;</strong> refers to ARENA USA Technology.</li>
              <li><strong>&quot;You&quot;, &quot;user&quot;</strong> refers to any person accessing the Service.</li>
              <li><strong>&quot;Content&quot;</strong> refers to articles, images, summaries, and other media on the Service.</li>
              <li><strong>&quot;API&quot;</strong> refers to our public REST API at <code className="text-amber-glow">/api/*</code>.</li>
              <li><strong>&quot;API key&quot;</strong> refers to a credential issued by us that allows third-party parsers to submit articles.</li>
            </ul>
          </Section>

          <Section title="2. Acceptance of Terms">
            <p>
              By using the Service, you confirm that you are at least 13 years of age (or the
              age of digital consent in your state) and that you agree to these Terms. If you
              are using the Service on behalf of an organization, you represent that you have
              authority to bind that organization.
            </p>
          </Section>

          <Section title="3. Use of the Service">
            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">3.1 Permitted Use</h3>
            <p>You may:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Read, share, and link to published articles for personal, non-commercial use.</li>
              <li>Use our public API (<code className="text-amber-glow">/api/articles</code>, <code className="text-amber-glow">/api/categories</code>) to retrieve published article data.</li>
              <li>Submit articles via our ingest API (<code className="text-amber-glow">/api/ingest</code>) if you have a valid API key.</li>
            </ul>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">3.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Use the Service for any unlawful purpose or in violation of any local, state, national, or international law.</li>
              <li>Submit content that is defamatory, obscene, hateful, or that infringes on intellectual property rights.</li>
              <li>Attempt to gain unauthorized access to our systems, including admin panels, databases, or API keys.</li>
              <li>Use our API to spam, flood, or overwhelm our servers (rate limits apply).</li>
              <li>Scrape or automatically extract content from the Service except via our documented API.</li>
              <li>Submit content that contains malware, viruses, or harmful code.</li>
              <li>Impersonate another person or organization.</li>
              <li>Use the Service to engage in price manipulation, securities fraud, or market manipulation.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">4.1 Our Content</h3>
            <p>
              Original content on the Service — including AI-generated summaries, editorial
              text, design, logos, and software — is owned by ARENA USA Technology and
              protected by U.S. and international copyright laws. You may not reproduce,
              distribute, or create derivative works without our written permission, except
              for brief quotations with attribution (fair use under 17 U.S.C. § 107).
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">4.2 Third-Party Content</h3>
            <p>
              Articles submitted via our API may contain content sourced from third parties.
              We display the source name and (internally) the source URL. We do not claim
              ownership of third-party content. All third-party content remains the property of
              its respective owners.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">4.3 User Submissions</h3>
            <p>
              By submitting content through our API or admin panel, you grant ARENA USA a
              non-exclusive, royalty-free, worldwide license to use, reproduce, modify,
              publish, and distribute that content for the purpose of operating the Service.
              You represent that you have the rights to submit the content and that it does
              not violate any third-party rights.
            </p>
          </Section>

          <Section title="5. API Usage">
            <p>
              Use of our API requires a valid API key. API keys are issued at our discretion
              and may be revoked at any time. API usage is subject to rate limits (default:
              60 requests per minute per key). Exceeding rate limits results in HTTP 429
              responses.
            </p>
            <p className="mt-3">
              You are responsible for keeping your API key secure. Do not share it publicly or
              commit it to version control. If your key is compromised, contact us immediately
              at{" "}
              <a href="mailto:security@arena-usa.com" className="text-amber-glow hover:underline">
                security@arena-usa.com
              </a>{" "}
              and we will disable it.
            </p>
          </Section>

          <Section title="6. Disclaimer of Warranties">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, either express or implied, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose,
              non-infringement, or accuracy (to the extent permitted by applicable law,
              including 15 U.S.C. § 230).
            </p>
            <p className="mt-3">
              We do not warrant that the Service will be uninterrupted, error-free, or free of
              harmful components. AI-generated summaries may contain inaccuracies — always
              verify critical information with the original source.
            </p>
            <p className="mt-3">
              <strong>Financial disclaimer:</strong> Content related to investing, banking,
              and personal finance is for informational purposes only and does not constitute
              financial advice. We are not registered investment advisors under the Investment
              Advisers Act of 1940. Consult a licensed financial advisor before making
              investment decisions.
            </p>
            <p className="mt-3">
              <strong>Health disclaimer:</strong> Content related to health, wellness, and
              fitness is for informational purposes only and does not constitute medical
              advice. We are not a medical provider under HIPAA. Consult a licensed physician
              before making health decisions.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, ARENA USA Technology shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your access to or use of the Service. This
              limitation applies regardless of the legal theory (contract, tort, or
              otherwise) and even if we have been advised of the possibility of such damages.
            </p>
            <p className="mt-3">
              Some states do not allow the exclusion or limitation of certain damages, so the
              above limitation may not apply to you.
            </p>
          </Section>

          <Section title="8. Indemnification">
            <p>
              You agree to indemnify and hold harmless ARENA USA Technology, its officers,
              directors, employees, and agents from any claims, damages, losses, liabilities,
              costs, and expenses (including reasonable attorneys&apos; fees) arising out of
              your use of the Service or your violation of these Terms.
            </p>
          </Section>

          <Section title="9. DMCA / Copyright Takedown">
            <p>
              We respect the intellectual property rights of others. If you believe that
              content on the Service infringes your copyright, you may submit a takedown
              request under the Digital Millennium Copyright Act (17 U.S.C. § 512) to:
            </p>
            <div className="mt-3 p-4 rounded-md border border-bronze/15 bg-graphite/30 text-sm">
              <p><strong className="text-foreground">DMCA Agent</strong></p>
              <p>Email:{" "}
                <a href="mailto:dmca@arena-usa.com" className="text-amber-glow hover:underline">
                  dmca@arena-usa.com
                </a>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Include: (1) identification of the copyrighted work, (2) identification of
                the allegedly infringing material, (3) your contact information, (4) a
                statement that you have a good faith belief that use is not authorized, and
                (5) a statement under penalty of perjury that you are authorized to act on
                behalf of the copyright owner.
              </p>
            </div>
            <p className="mt-3">
              We will respond to valid DMCA requests within 10 business days and remove
              infringing content promptly.
            </p>
          </Section>

          <Section title="10. Advertising">
            <p>
              We may display advertisements and sponsored content. Sponsored content is clearly
              labeled as such. Advertisers purchase placements via Stripe — see our{" "}
              <Link href="/privacy" className="text-amber-glow hover:underline">Privacy Policy</Link>{" "}
              for how payment data is handled.
            </p>
            <p className="mt-3">
              Advertisers have no editorial influence. Sponsored content does not appear in
              the news feed as editorial content.
            </p>
          </Section>

          <Section title="11. Donations">
            <p>
              We accept cryptocurrency donations (BTC, ETH, USDT, USDC). Donations are
              non-refundable and processed directly on the blockchain — we do not collect or
              store donor personal information. Wallet addresses are public on the site.
            </p>
          </Section>

          <Section title="12. Account Termination">
            <p>
              You may request deletion of your account at any time by emailing{" "}
              <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                privacy@arena-usa.com
              </a>
              . We may suspend or terminate your access if you violate these Terms.
            </p>
          </Section>

          <Section title="13. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by the laws of the State of Delaware, without regard
              to its conflict of law principles. You agree to the exclusive jurisdiction of
              the state and federal courts located in Delaware for any dispute arising from
              these Terms or your use of the Service.
            </p>
            <p className="mt-3">
              <strong>Arbitration:</strong> Any dispute will be resolved by binding
              arbitration administered by the American Arbitration Association under its
              Consumer Arbitration Rules, except that you may bring small-claims court
              actions in your local jurisdiction.
            </p>
            <p className="mt-3">
              <strong>Class action waiver:</strong> You agree to resolve disputes on an
              individual basis and not as part of a class action.
            </p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material
              changes by email (if we have your email) or by a prominent notice on the
              Service at least 30 days before the changes take effect.
            </p>
          </Section>

          <Section title="15. Children">
            <p>
              The Service is not directed to children under 13. We do not knowingly collect
              personal information from children under 13 in compliance with COPPA. See our{" "}
              <Link href="/privacy" className="text-amber-glow hover:underline">Privacy Policy</Link>{" "}
              for details.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:legal@arena-usa.com" className="text-amber-glow hover:underline">
                legal@arena-usa.com
              </a>
              .
            </p>
          </Section>

          <footer className="mt-12 pt-6 border-t border-bronze/15 text-xs text-muted-foreground">
            <p>
              © 2026 ARENA USA Technology. All rights reserved. These Terms are licensed
              under{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">CC BY 4.0</a>{" "}
              — you may adapt with attribution.
            </p>
          </footer>
        </div>
      </article>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-3 pt-6 border-t border-bronze/10 first:border-t-0 first:pt-0">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
