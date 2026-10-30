import Link from "next/link";
import { Github, Twitter, Send, Mail, Rss } from "lucide-react";
import { PROJECT_DEFAULTS } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-bronze/15 bg-espresso">
      <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-glow to-bronze flex items-center justify-center">
                <span className="font-serif font-black text-espresso">A</span>
              </div>
              <span className="font-serif font-bold text-foreground">
                ARENA <span className="arena-text-gradient">USA</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              AI-powered American digital media. Curated by AI agents, reviewed by editors, published for everyone in the United States.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="https://t.me/arenausa" label="Telegram"><Send size={15} /></SocialLink>
              <SocialLink href="https://twitter.com/arenausa" label="Twitter / X"><Twitter size={15} /></SocialLink>
              <SocialLink href="https://github.com/arena-usa" label="GitHub"><Github size={15} /></SocialLink>
              <SocialLink href="/rss.xml" label="RSS feed"><Rss size={15} /></SocialLink>
              <SocialLink href="mailto:hello@arena-usa.com" label="Email"><Mail size={15} /></SocialLink>
            </div>
          </div>

          <FooterColumn title="Sections">
            <FooterLink href="/category/politics">Politics</FooterLink>
            <FooterLink href="/category/investing-banking">Investing & Banking</FooterLink>
            <FooterLink href="/category/personal-finance">Personal Finance</FooterLink>
            <FooterLink href="/category/technology-ai">Technology & AI</FooterLink>
            <FooterLink href="/category/health-wellness">Health & Wellness</FooterLink>
          </FooterColumn>

          <FooterColumn title="Discover">
            <FooterLink href="/archive">Archive</FooterLink>
            <FooterLink href="/search">Search</FooterLink>
            <FooterLink href="/about">About ARENA USA</FooterLink>
            <FooterLink href="/editorial-policy">Editorial Policy</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
          </FooterColumn>

          <FooterColumn title="Developers">
            <FooterLink href="/api/docs">API Documentation</FooterLink>
            <FooterLink href="/admin">Admin Panel</FooterLink>
            <FooterLink href="/admin/api-keys">API Keys</FooterLink>
            <FooterLink href="/admin/sources">Sources</FooterLink>
            <FooterLink href="/api/health">System Status</FooterLink>
          </FooterColumn>
        </div>

        <div className="pt-6 border-t border-bronze/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} {PROJECT_DEFAULTS.siteName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            "{PROJECT_DEFAULTS.siteTagline}"
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-amber-glow mb-3">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-xs text-muted-foreground hover:text-amber-glow transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-md border border-bronze/20 flex items-center justify-center text-muted-foreground hover:text-amber-glow hover:border-amber-glow/50 transition-colors"
    >
      {children}
    </a>
  );
}
