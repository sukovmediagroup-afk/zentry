import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { fetchMarketTicks } from "@/lib/providers";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 86400; // 24h — legal pages rarely change

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "ARENA USA Privacy Policy. How we collect, use, and protect your personal information in compliance with U.S. federal and state laws including CCPA, COPPA, and CAN-SPAM.",
  path: "/privacy",
});

const LAST_UPDATED = "October 30, 2026";
const EFFECTIVE_DATE = "October 30, 2026";

export default async function PrivacyPolicyPage() {
  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={ticks} />

      <article className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-amber-glow">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Privacy Policy</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-bronze/15">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Effective Date:</strong> {EFFECTIVE_DATE}
            <br />
            <strong className="text-foreground">Last Updated:</strong> {LAST_UPDATED}
          </p>
        </header>

        <div className="prose-legal text-foreground/90 leading-relaxed space-y-6 text-sm sm:text-base">
          <p className="text-base">
            ARENA USA ("we", "us", "our", or "the Service") is an AI-powered digital media
            platform operated by ARENA USA Technology. We are committed to protecting your
            privacy and complying with all applicable U.S. federal and state privacy laws,
            including the California Consumer Privacy Act ("CCPA"), the Children's Online
            Privacy Protection Act ("COPPA"), the CAN-SPAM Act, and similar state privacy
            statutes in Virginia, Colorado, Connecticut, Utah, and other jurisdictions.
          </p>
          <p className="text-base">
            This Privacy Policy explains what personal information we collect, how we use it,
            who we share it with, and the choices and rights you have regarding your data.
          </p>

          <Section id="information-we-collect" title="1. Information We Collect">
            <p>
              We collect information in the following categories. The specific categories of
              personal information we collect under the CCPA are listed in{" "}
              <a href="#ccpa-categories" className="text-amber-glow hover:underline">
                Section 11 (CCPA Disclosure)
              </a>
              .
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              1.1 Information You Provide Directly
            </h3>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Account information:</strong> When you register as an editor or
                administrator, we collect your email address, name, and a password (stored as
                a PBKDF2 hash, never in plaintext).
              </li>
              <li>
                <strong>Article submissions:</strong> If you submit content through our
                public API or admin panel, we collect the article title, body text, source
                URL, cover image, and metadata you provide.
              </li>
              <li>
                <strong>Image uploads:</strong> When you upload cover images via the admin
                panel, we store the image file (or a URL to it) along with alt text for
                accessibility.
              </li>
              <li>
                <strong>Password reset requests:</strong> If you request a password reset, we
                generate a one-time token (hashed with SHA-256) that is valid for 1 hour and
                sent to your email address.
              </li>
              <li>
                <strong>Advertising inquiries:</strong> If you contact us about advertising, we
                collect your name, email address, company, and campaign details.
              </li>
              <li>
                <strong>Donation information:</strong> We display cryptocurrency wallet
                addresses for donations. We do not collect or store donor information —
                transactions occur directly on the blockchain. We may display a public thank-you
                list of wallet addresses that have donated, but we do not link wallets to
                individuals.
              </li>
            </ul>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              1.2 Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Usage data:</strong> When you visit our site, we collect your IP
                address, browser type, device type, referring URL, pages viewed, and time
                spent on pages. We use this to count active visitors (displayed in the header)
                and to understand aggregate traffic patterns.
              </li>
              <li>
                <strong>Cookies and similar technologies:</strong> We use a single essential
                cookie (<code className="text-amber-glow">arena_session</code>) to maintain
                your logged-in session if you are an administrator. This cookie is
                <code className="text-amber-glow"> HttpOnly</code>,
                <code className="text-amber-glow"> Secure</code>, and
                <code className="text-amber-glow"> SameSite=Lax</code>. We do not use
                third-party tracking cookies, advertising cookies, or social media cookies.
              </li>
              <li>
                <strong>Server logs:</strong> Our hosting provider (Vercel) and database
                provider (Neon) automatically log request metadata (IP, timestamp, user agent,
                URL). These logs are retained for 30 days for security and debugging purposes.
              </li>
            </ul>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              1.3 Information Collected from Third Parties
            </h3>
            <p>
              We may receive aggregated, non-personal information from third-party data
              providers we use to display real-time market data (CoinGecko), weather forecasts
              (Open-Meteo), and U.S. holiday calendars (Nager.Date). This information is not
              linked to your identity.
            </p>
            <p>
              If you make a payment through Stripe for advertising, Stripe will collect and
              process your payment card information directly. We do not see or store your card
              number — we only receive a confirmation that the payment was successful. See{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                Stripe's Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section id="how-we-use-information" title="2. How We Use Your Information">
            <p>We use the personal information we collect for the following business purposes:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                To operate, maintain, and improve our website and services (including
                displaying articles, counting active visitors, and personalizing weather by
                location).
              </li>
              <li>
                To create and manage editor/administrator accounts and to authenticate your
                session.
              </li>
              <li>
                To process and publish articles submitted through our API or admin panel,
                including AI-assisted classification, summarization, and duplicate detection.
              </li>
              <li>
                To send you transactional emails (such as password reset links) when you
                request them. We do not send marketing emails unless you explicitly opt in.
              </li>
              <li>
                To process advertising orders and payments through Stripe, and to manage
                advertising campaigns.
              </li>
              <li>
                To detect, prevent, and address technical issues, fraud, security incidents,
                and violations of our Terms of Service.
              </li>
              <li>
                To comply with our legal obligations under U.S. federal and state laws,
                including record-keeping for audit purposes.
              </li>
              <li>
                To publish aggregated, de-identified analytics about visitor counts and
                popular categories.
              </li>
            </ul>
            <p className="mt-3">
              <strong>AI processing notice:</strong> We use AI models to classify and
              summarize article content. Article text submitted through our API is processed
              by these models to generate a title, summary, category, and sensitivity flags.
              We do not use your personal information (such as your email or IP address) for
              AI training.
            </p>
          </Section>

          <Section id="legal-basis" title="3. Legal Basis for Processing (Applicable Laws)">
            <p>
              We process personal information under the following legal bases, depending on
              the applicable jurisdiction:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>CCPA (California):</strong> We collect and use personal information for
                the business and commercial purposes described above, as permitted by
                Cal. Civ. Code § 1798.100 et seq.
              </li>
              <li>
                <strong>VCDPA (Virginia), CPA (Colorado), CTDPA (Connecticut), UCPA (Utah):</strong>{" "}
                We process personal data for the purposes described in this Policy, consistent
                with the consumer rights granted under these state privacy statutes.
              </li>
              <li>
                <strong>COPPA (Children under 13):</strong> Our service is not directed at
                children under 13. We do not knowingly collect personal information from
                children under 13. If you believe we have collected such information, please
                contact us and we will delete it.
              </li>
              <li>
                <strong>CAN-SPAM Act:</strong> We do not send commercial email without your
                consent. Transactional emails (password resets) comply with CAN-SPAM
                requirements and include a way to contact us.
              </li>
              <li>
                <strong>Consent:</strong> For activities that require affirmative consent
                (such as marketing emails), we obtain your explicit opt-in before processing.
              </li>
            </ul>
          </Section>

          <Section id="sharing" title="4. How We Share Your Information">
            <p>
              We do not sell your personal information. We do not rent or trade your data. We
              share information only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Service providers:</strong> We share data with the third-party
                service providers listed in{" "}
                <a href="#service-providers" className="text-amber-glow hover:underline">
                  Section 5
                </a>{" "}
                who help us operate the site. Each provider is bound by their own privacy
                policy and is contractually limited to using your data only to provide
                services to us.
              </li>
              <li>
                <strong>Legal compliance:</strong> We may disclose information when required
                by law, subpoena, court order, or government request, or to protect the
                rights, property, or safety of ARENA USA, our users, or others.
              </li>
              <li>
                <strong>Business transfers:</strong> If ARENA USA is involved in a merger,
                acquisition, or sale of assets, your information may be transferred. We will
                notify you by email or prominent notice on the site 30 days before any change
                in ownership or use of your information.
              </li>
              <li>
                <strong>Aggregate/de-identified data:</strong> We may share aggregated,
                de-identified statistics about visitors (such as total monthly views or
                popular categories) with partners or the public. This data cannot be used to
                identify you.
              </li>
            </ul>
          </Section>

          <Section id="service-providers" title="5. Third-Party Service Providers">
            <p>
              We use the following third-party services that may have access to limited
              personal information. Each has its own privacy policy — we encourage you to
              review them:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-bronze/15 rounded-md">
                <thead className="bg-graphite/60">
                  <tr>
                    <th className="p-3 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Purpose</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Data accessed</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/10">
                  <tr>
                    <td className="p-3 font-medium">Vercel Inc.</td>
                    <td className="p-3">Web hosting, CDN, serverless functions</td>
                    <td className="p-3">IP, request metadata, server logs</td>
                    <td className="p-3">
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Neon Database</td>
                    <td className="p-3">PostgreSQL database hosting</td>
                    <td className="p-3">All stored data (article content, account info, audit logs)</td>
                    <td className="p-3">
                      <a href="https://neon.tech/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Stripe, Inc.</td>
                    <td className="p-3">Payment processing for advertising</td>
                    <td className="p-3">Payment card data (handled by Stripe — we never see it)</td>
                    <td className="p-3">
                      <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">CoinGecko</td>
                    <td className="p-3">Live cryptocurrency prices</td>
                    <td className="p-3">None (public API, no user data sent)</td>
                    <td className="p-3">
                      <a href="https://www.coingecko.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Open-Meteo</td>
                    <td className="p-3">Weather forecasts</td>
                    <td className="p-3">None (public API, no user data sent)</td>
                    <td className="p-3">
                      <a href="https://open-meteo.com/en/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Nager.Date</td>
                    <td className="p-3">U.S. holiday calendar</td>
                    <td className="p-3">None (public API, no user data sent)</td>
                    <td className="p-3">N/A</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Google Fonts</td>
                    <td className="p-3">Web fonts (Geist, Newsreader)</td>
                    <td className="p-3">IP address (sent to load fonts)</td>
                    <td className="p-3">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Unsplash</td>
                    <td className="p-3">Cover images for articles</td>
                    <td className="p-3">IP address (sent to load images)</td>
                    <td className="p-3">
                      <a href="https://unsplash.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-glow hover:underline">Policy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Your SMTP provider</td>
                    <td className="p-3">Password reset email delivery</td>
                    <td className="p-3">Recipient email, message content</td>
                    <td className="p-3">Per your provider's policy</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              We do not use Google Analytics, Facebook Pixel, or any other cross-site tracking
              service. We do not share data with data brokers.
            </p>
          </Section>

          <Section id="data-retention" title="6. Data Retention">
            <p>We retain personal information only as long as necessary for the purposes described in this Policy:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Account information:</strong> Retained until you request deletion or
                your account is inactive for 24 months.
              </li>
              <li>
                <strong>Article content:</strong> Published articles are retained for 48 hours
                in the public feed, then moved to the archive. Archived articles are retained
                indefinitely unless an administrator deletes them. Articles marked "Pinned
                forever" remain in the public feed indefinitely.
              </li>
              <li>
                <strong>Visitor session data:</strong> Active visitor sessions are retained for
                60 seconds (heartbeat TTL). Inactive session records are retained for 24 hours
                for analytics, then automatically deleted.
              </li>
              <li>
                <strong>Audit logs:</strong> Retained for 24 months for security and legal
                compliance, then automatically deleted.
              </li>
              <li>
                <strong>Password reset tokens:</strong> Valid for 1 hour only, then
                automatically invalidated.
              </li>
              <li>
                <strong>API keys:</strong> Retained until you disable or delete them through
                the admin panel. Usage tracking (last used, total calls) is retained for the
                life of the key.
              </li>
              <li>
                <strong>Server logs (Vercel, Neon):</strong> Retained for 30 days by our
                hosting providers for security and debugging.
              </li>
              <li>
                <strong>Payment records:</strong> Retained for 7 years per U.S. tax record
                requirements (29 CFR § 516.5). Stripe retains payment card data per their
                own policy — we only store campaign metadata.
              </li>
            </ul>
          </Section>

          <Section id="security" title="7. Data Security">
            <p>We implement industry-standard technical and organizational measures to protect your personal information:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Encryption in transit:</strong> All traffic uses HTTPS with TLS 1.3.
                HSTS (<code className="text-amber-glow">Strict-Transport-Security</code>) is
                enabled with <code className="text-amber-glow">max-age=63072000</code> and{" "}
                <code className="text-amber-glow">includeSubDomains</code>.
              </li>
              <li>
                <strong>Encryption at rest:</strong> Database (Neon Postgres) is encrypted at
                rest with AES-256. Backups are encrypted.
              </li>
              <li>
                <strong>Password hashing:</strong> Admin passwords are hashed with PBKDF2
                (100,000 iterations, SHA-256, 16-byte salt). We never store plaintext
                passwords.
              </li>
              <li>
                <strong>Session tokens:</strong> Session tokens are stored as SHA-256 hashes
                in the database, never in plaintext. If the database is compromised, stolen
                tokens cannot be reused.
              </li>
              <li>
                <strong>API keys:</strong> Stored as SHA-256 hashes. Raw API keys are shown
                only once at creation and never retrievable again.
              </li>
              <li>
                <strong>Timing-safe comparisons:</strong> All credential comparisons (login,
                API key verification, cron secret) use constant-time comparison to prevent
                timing attacks.
              </li>
              <li>
                <strong>Rate limiting:</strong> Login attempts, API calls, and visitor
                heartbeats are rate-limited to prevent brute-force and DoS attacks.
              </li>
              <li>
                <strong>Content Security Policy (CSP):</strong> Admin pages enforce a strict
                CSP restricting script sources.
              </li>
              <li>
                <strong>SSRF protection:</strong> User-supplied image URLs are validated
                against a private-IP allowlist to prevent server-side request forgery.
              </li>
              <li>
                <strong>Access controls:</strong> Admin panel access requires authenticated
                session with admin or editor role. All admin actions are logged in an audit
                trail.
              </li>
              <li>
                <strong>Magic-bytes verification:</strong> Image uploads are verified by
                file content (not just Content-Type header) to prevent malicious file
                uploads.
              </li>
            </ul>
            <p className="mt-3">
              Despite these measures, no system is 100% secure. If we become aware of a
              security breach affecting your personal information, we will notify affected
              users within 72 hours, as required by state breach notification laws
              (e.g., Cal. Civ. Code § 1798.82).
            </p>
          </Section>

          <Section id="cookies" title="8. Cookies and Tracking Technologies">
            <p>
              We use only essential cookies. We do not use advertising cookies, social media
              tracking pixels, or third-party analytics cookies.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-bronze/15 rounded-md">
                <thead className="bg-graphite/60">
                  <tr>
                    <th className="p-3 text-left font-medium text-muted-foreground">Cookie name</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Purpose</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/10">
                  <tr>
                    <td className="p-3 font-mono text-amber-glow">arena_session</td>
                    <td className="p-3">Maintains your logged-in session (admin panel only)</td>
                    <td className="p-3">7 days</td>
                    <td className="p-3">Strictly necessary</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Because we only use strictly-necessary cookies, we do not display a cookie
              consent banner. Most browsers allow you to manage cookies in their settings —
              see{" "}
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                Chrome
              </a>
              ,{" "}
              <a
                href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                Firefox
              </a>
              ,{" "}
              <a
                href="https://support.apple.com/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                Safari
              </a>
              . Disabling cookies will prevent you from logging in to the admin panel but
              will not affect your ability to read articles.
            </p>
          </Section>

          <Section id="your-rights" title="9. Your Privacy Rights">
            <p>
              Depending on your state of residence, you may have the following rights under
              U.S. privacy laws:
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              9.1 Rights Under CCPA / CPRA (California)
            </h3>
            <p>California residents have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Know</strong> what personal information we have collected about you
                in the past 12 months (Cal. Civ. Code § 1798.110, § 1798.115).
              </li>
              <li>
                <strong>Delete</strong> your personal information, with certain exceptions
                (§ 1798.105).
              </li>
              <li>
                <strong>Correct</strong> inaccurate personal information (§ 1798.106).
              </li>
              <li>
                <strong>Opt out</strong> of the "sale" or "sharing" of personal information
                (§ 1798.120, § 1798.121). We do not sell or share your data, so this right
                is automatically respected — no opt-out is needed.
              </li>
              <li>
                <strong>Limit the use</strong> of sensitive personal information (§ 1798.121).
                We do not collect sensitive personal information beyond what is strictly
                necessary.
              </li>
              <li>
                <strong>Non-discrimination:</strong> We will not discriminate against you for
                exercising your privacy rights (§ 1798.125).
              </li>
            </ul>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              9.2 Rights Under VCDPA, CPA, CTDPA, UCPA (VA, CO, CT, UT)
            </h3>
            <p>Residents of Virginia, Colorado, Connecticut, and Utah have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Access and obtain a copy of their personal data.</li>
              <li>Correct inaccuracies in their personal data.</li>
              <li>Delete their personal data (with exceptions for data needed to complete a transaction or comply with law).</li>
              <li>Obtain their data in a portable, readily usable format.</li>
              <li>Opt out of targeted advertising, sale of personal data, and certain profiling.</li>
              <li>Appeal a denial of a privacy rights request.</li>
            </ul>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              9.3 COPPA (Children Under 13)
            </h3>
            <p>
              Our service is not directed to children under 13. We do not knowingly collect
              personal information from children under 13. If we learn we have collected such
              information, we will delete it promptly. Parents who believe we have collected
              information from their child can contact us at{" "}
              <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                privacy@arena-usa.com
              </a>
              .
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              9.4 How to Exercise Your Rights
            </h3>
            <p>
              To exercise any of the rights above, please contact us at{" "}
              <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                privacy@arena-usa.com
              </a>{" "}
              with the subject line "Privacy Rights Request" and include:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Your name and email address</li>
              <li>The specific right you wish to exercise (e.g., "I want to delete my account")</li>
              <li>Proof of identity (we may request additional verification)</li>
            </ul>
            <p className="mt-3">
              We will respond to your request within 45 days (CCPA requires response within 45
              days; VCDPA/CPA/CTDPA within 45 days; UCPA within 45 days). If we need more time,
              we will inform you of the reason and extension period (up to 45 additional days).
            </p>
            <p className="mt-3">
              <strong>Authorized agents:</strong> You may designate an authorized agent to
              make requests on your behalf by providing a signed permission letter. We may
              still require you to verify your identity directly.
            </p>
          </Section>

          <Section id="opt-out" title={'10. Opt-Out of "Sale" or "Sharing"'}>
            <p>
              <strong>We do not sell your personal information</strong>, as "sell" is defined
              under CCPA (§ 1798.140(ad)) and similar state laws. We also do not "share"
              your personal information for cross-context behavioral advertising.
            </p>
            <p className="mt-3">
              Because we do not engage in these practices, there is no opt-out link or "Do
              Not Sell My Personal Information" button on our site. If our practices change,
              we will update this Policy and provide an opt-out mechanism at least 30 days
              before the change takes effect.
            </p>
            <p className="mt-3">
              <strong>Do Not Track signals:</strong> Our site does not respond to "Do Not
              Track" signals from your browser because we do not engage in cross-site
              tracking. We respect your choice not to be tracked.
            </p>
          </Section>

          <Section id="ccpa-categories" title="11. CCPA Disclosure — Categories of Personal Information">
            <p>
              Under CCPA, California residents have the right to know what categories of
              personal information we collect. The table below lists each category, whether
              we collect it, the business purpose, and the source.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-bronze/15 rounded-md">
                <thead className="bg-graphite/60">
                  <tr>
                    <th className="p-2 text-left font-medium text-muted-foreground">Category</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Collected?</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Business purpose</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze/10">
                  <tr>
                    <td className="p-2">A. Identifiers (name, email, IP, device ID)</td>
                    <td className="p-2 text-emerald-400">Yes</td>
                    <td className="p-2">Account management, security, audit</td>
                    <td className="p-2">You, automated</td>
                  </tr>
                  <tr>
                    <td className="p-2">B. Personal information categories in CCPA § 1798.140(e) (commercial info)</td>
                    <td className="p-2 text-emerald-400">Yes</td>
                    <td className="p-2">Ad campaign records</td>
                    <td className="p-2">You, Stripe</td>
                  </tr>
                  <tr>
                    <td className="p-2">C. Internet/network activity (browsing history, search queries)</td>
                    <td className="p-2 text-emerald-400">Yes (limited)</td>
                    <td className="p-2">Aggregate visitor counting</td>
                    <td className="p-2">Automated</td>
                  </tr>
                  <tr>
                    <td className="p-2">D. Geolocation data</td>
                    <td className="p-2 text-muted-foreground">No</td>
                    <td className="p-2">—</td>
                    <td className="p-2">—</td>
                  </tr>
                  <tr>
                    <td className="p-2">E. Audio, electronic, visual, thermal, olfactory, or similar info</td>
                    <td className="p-2 text-emerald-400">Yes (cover images only)</td>
                    <td className="p-2">Article illustrations</td>
                    <td className="p-2">You, Unsplash</td>
                  </tr>
                  <tr>
                    <td className="p-2">F. Professional/employment info</td>
                    <td className="p-2 text-muted-foreground">No</td>
                    <td className="p-2">—</td>
                    <td className="p-2">—</td>
                  </tr>
                  <tr>
                    <td className="p-2">G. Education info</td>
                    <td className="p-2 text-muted-foreground">No</td>
                    <td className="p-2">—</td>
                    <td className="p-2">—</td>
                  </tr>
                  <tr>
                    <td className="p-2">H. Inferences (profile, preferences)</td>
                    <td className="p-2 text-muted-foreground">No</td>
                    <td className="p-2">—</td>
                    <td className="p-2">—</td>
                  </tr>
                  <tr>
                    <td className="p-2">Sensitive personal info (SSN, driver's license, financial account, health, etc.)</td>
                    <td className="p-2 text-muted-foreground">No</td>
                    <td className="p-2">—</td>
                    <td className="p-2">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="international" title="12. International Users">
            <p>
              ARENA USA is operated from the United States and is intended for users in the
              United States. If you access our site from outside the U.S., your information
              will be transferred to the U.S. and processed under U.S. laws.
            </p>
            <p className="mt-3">
              <strong>GDPR (European Economic Area, UK, Switzerland):</strong> If you are
              located in the EEA, UK, or Switzerland, you have additional rights under the
              General Data Protection Regulation (GDPR), including the right to access,
              rectify, erase, restrict processing, port your data, object to processing, and
              withdraw consent. The legal basis for our processing is legitimate interest
              (Art. 6(1)(f)) for operating the website, contract (Art. 6(1)(b)) for account
              services, and consent (Art. 6(1)(a)) for marketing (when you opt in). To
              exercise GDPR rights, contact us at{" "}
              <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                privacy@arena-usa.com
              </a>
              . We do not have a designated EU representative.
            </p>
            <p className="mt-3">
              We do not knowingly direct our service to users in jurisdictions where its
              provision would violate local law.
            </p>
          </Section>

          <Section id="minors" title="13. Minors">
            <p>
              Our service is not directed to individuals under 13 years of age (under 16 for
              California residents under CCPA). We do not knowingly collect personal
              information from minors. If you are a parent or guardian and believe your child
              has provided us with personal information, please contact us at{" "}
              <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                privacy@arena-usa.com
              </a>{" "}
              and we will delete the information within 30 days.
            </p>
            <p className="mt-3">
              Parents may review and delete their child's information by following the
              verification process described in{" "}
              <a href="#your-rights" className="text-amber-glow hover:underline">
                Section 9
              </a>
              .
            </p>
          </Section>

          <Section id="changes" title="14. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, or applicable laws. When we do, we will revise the
              "Last Updated" date at the top of this page.
            </p>
            <p className="mt-3">
              If we make material changes that affect your rights (such as new data uses or
              sharing with new categories of third parties), we will notify you by email (if
              we have your email) and post a prominent notice on the homepage at least 30
              days before the change takes effect.
            </p>
            <p className="mt-3">
              You can review the history of this Policy on our{" "}
              <a
                href="https://github.com/sukovmediagroup-afk/zentry/commits/main/src/app/privacy/page.tsx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </Section>

          <Section id="contact" title="15. Contact Us">
            <p>If you have any questions about this Privacy Policy or your personal information, please contact us:</p>
            <div className="mt-3 p-4 rounded-md border border-bronze/15 bg-graphite/30 space-y-2 text-sm">
              <p>
                <strong className="text-foreground">ARENA USA Technology</strong>
                <br />
                Privacy Team
              </p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@arena-usa.com" className="text-amber-glow hover:underline">
                  privacy@arena-usa.com
                </a>
              </p>
              <p>
                For DMCA / copyright takedown requests:{" "}
                <a href="mailto:dmca@arena-usa.com" className="text-amber-glow hover:underline">
                  dmca@arena-usa.com
                </a>
              </p>
              <p>
                For security vulnerability reports:{" "}
                <a href="mailto:security@arena-usa.com" className="text-amber-glow hover:underline">
                  security@arena-usa.com
                </a>
              </p>
              <p className="text-muted-foreground text-xs mt-3">
                Response time: We aim to respond within 5 business days. For urgent privacy
                requests (such as data deletion), we respond within 45 days as required by
                applicable law.
              </p>
            </div>
          </Section>

          <Section id="additional-disclosures" title="16. Additional Disclosures by State">
            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.1 Nevada Residents (NRS 603A)
            </h3>
            <p>
              Under Nevada Revised Statutes Chapter 603A, Nevada residents may opt out of the
              sale of certain personal information to third parties for monetary consideration.
              We do not sell your personal information, so this right is automatically respected.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.2 Florida Residents (FDBR — effective July 1, 2024)
            </h3>
            <p>
              Under the Florida Digital Bill of Rights, Florida residents have rights to
              access, correct, delete, and opt out of targeted advertising, sale of personal
              data, and profiling. We respect these rights — submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.3 Texas Residents (TDPSA — effective July 1, 2024)
            </h3>
            <p>
              Under the Texas Data Privacy and Security Act, Texas residents have rights to
              know, access, correct, delete, port, and opt out of processing. Submit requests
              as described in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.4 Oregon Residents (OCPA — effective July 1, 2024)
            </h3>
            <p>
              Under the Oregon Consumer Privacy Act, Oregon residents have rights similar to
              CCPA. Submit requests as described in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.5 Montana Residents (MCDPA — effective October 1, 2024)
            </h3>
            <p>
              Under the Montana Consumer Data Privacy Act, Montana residents have rights to
              know, access, correct, delete, port, and opt out. Submit requests as described
              in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.6 Iowa Residents (ICDPA — effective January 1, 2025)
            </h3>
            <p>
              Under the Iowa Consumer Data Protection Act, Iowa residents have rights to
              access, delete, correct, and opt out. Submit requests as described in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.7 Delaware Residents (DPDPA — effective January 1, 2025)
            </h3>
            <p>
              Under the Delaware Personal Data Privacy Act, Delaware residents have rights to
              access, correct, delete, port, and opt out. Submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.8 New Hampshire Residents (NHSRA — effective January 1, 2025)
            </h3>
            <p>
              Under the New Hampshire Privacy Act, residents have rights to access, correct,
              delete, port, and opt out. Submit requests as described in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.9 New Jersey Residents (NJDPA — effective January 15, 2025)
            </h3>
            <p>
              Under the New Jersey Data Privacy Act, New Jersey residents have rights to
              access, correct, delete, port, and opt out. Submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.10 Tennessee Residents (TIPA — effective July 1, 2025)
            </h3>
            <p>
              Under the Tennessee Information Protection Act, Tennessee residents have rights
              to access, correct, delete, port, and opt out. Submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.11 Minnesota Residents (MCDPA — effective July 31, 2025)
            </h3>
            <p>
              Under the Minnesota Consumer Data Privacy Act, Minnesota residents have rights
              to access, correct, delete, port, and opt out, with additional protections for
              sensitive data. Submit requests as described in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.12 Maryland Residents (MODPA — effective October 1, 2025)
            </h3>
            <p>
              Under the Maryland Online Data Privacy Act, Maryland residents have rights to
              access, correct, delete, port, and opt out, with enhanced protections for
              sensitive data and data minimization requirements. Submit requests as described
              in Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.13 Indiana Residents (INCDPA — effective January 1, 2026)
            </h3>
            <p>
              Under the Indiana Consumer Data Protection Act, Indiana residents have rights to
              access, correct, delete, port, and opt out. Submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.14 Kentucky Residents (KCDPA — effective January 1, 2026)
            </h3>
            <p>
              Under the Kentucky Consumer Data Protection Act, Kentucky residents have rights
              to access, correct, delete, port, and opt out. Submit requests as described in
              Section 9.
            </p>

            <h3 className="font-serif text-lg font-bold text-foreground mt-4 mb-2">
              16.15 Rhode Island Residents (RIDTPPA — effective January 1, 2026)
            </h3>
            <p>
              Under the Rhode Island Data Transparency and Privacy Protection Act, Rhode
              Island residents have rights to access, correct, delete, port, and opt out.
              Submit requests as described in Section 9.
            </p>
          </Section>

          <footer className="mt-12 pt-6 border-t border-bronze/15 text-xs text-muted-foreground">
            <p>
              This Privacy Policy is provided for informational purposes and does not
              constitute legal advice. We are not your attorneys. If you have specific legal
              questions about your rights, consult a licensed attorney in your state.
            </p>
            <p className="mt-3">
              © 2026 ARENA USA Technology. This document is licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-glow hover:underline"
              >
                CC BY 4.0
              </a>{" "}
              — you may adapt it with attribution.
            </p>
          </footer>
        </div>
      </article>

      <Footer />
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-3 pt-6 border-t border-bronze/10 first:border-t-0 first:pt-0">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
