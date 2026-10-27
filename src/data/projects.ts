export type ProjectVisual = 'credit-card' | 'corporate-site' | 'invoice' | 'vault';

export interface Project {
  id: string;
  title: string;
  category: string;
  status?: string;
  visual?: ProjectVisual;
  summary?: string;
  description?: string[];
  highlights?: string[];
  stack?: string[];
  link?: string;
  linkLabel?: string;
  secondaryLink?: string;
  secondaryLinkLabel?: string;
}

export const projects: Project[] = [
  {
    id: 'dashboard',
    title: 'CodeSolve Dashboard Showcase',
    category: 'Web App',
    status: 'Live',
    visual: 'credit-card',
    summary: 'Client analytics and management platform with reactive data visualisations.',
    description: [
      'A high-end client analytics and management infrastructure platform featuring reactive data visualizations, real-time performance tracking, and dynamic security access protocols.',
      'Built to demonstrate advanced state management optimization and seamless backend data architecture, with fully responsive layouts and fluid animations tuned for performance on every device.',
    ],
    highlights: [
      'Reactive charts and live performance tracking',
      'Role-based security access flows',
      'Optimised state management for large data sets',
      'Responsive layouts from mobile to widescreen',
    ],
    link: 'https://codesolve-dashboard-showcase.web.app',
    linkLabel: 'Open Dashboard',
  },
  {
    id: 'corporate',
    title: 'CodeSolve Corporate Website',
    category: 'Corporate Website',
    status: 'Live',
    visual: 'corporate-site',
    summary: 'The CodeSolve storefront: services, cloud architecture map and a guided project-scoping funnel.',
    description: [
      'The public storefront for CodeSolve, built on the Next.js App Router and pre-rendered for global CDN delivery on Firebase Hosting. It presents the studio\'s engineering pillars, from Microsoft ecosystem work to hybrid mobile apps and custom storefronts.',
      'Its centrepiece is a multi-step project scoping wizard. Each submission is written to Cloud Firestore, where a Cloud Function trigger picks it up for follow-up. An interactive architecture map explains the delivery stack, and a POPIA-compliant consent banner and privacy pages cover South African data-protection requirements.',
    ],
    highlights: [
      'Multi-step lead funnel with budget tiers and currency mapping',
      'Firestore writes that trigger a Cloud Function on each new lead',
      'Interactive cloud architecture map',
      'Animated POPIA cookie consent and privacy pages',
      'Responsive glassmorphic navigation and mobile menu',
    ],
    stack: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Framer Motion', 'Firestore', 'Cloud Functions', 'Firebase Hosting'],
    link: 'https://codesolve.co.za',
    linkLabel: 'Visit Website',
  },
  {
    id: 'invoicing',
    title: 'CodeSolve Invoicing',
    category: 'Business Web App',
    status: 'Live',
    visual: 'invoice',
    summary: 'Invoicing, quoting and time tracking for running a studio, with branded PDF export.',
    description: [
      'An invoicing and quoting platform built to run the day-to-day finances of CodeSolve. It tracks revenue and recent activity by tax year, and keeps clients, products and pricing in reusable catalogues so a new invoice takes seconds.',
      'Time tracking is built in: a persistent timer survives page reloads, entries use each client\'s hourly rate, and a weekly view shows hours per client at a glance. Unbilled time can be invoiced by period, and timesheets export as PDFs with client sign-off lines.',
      'Invoices and quotes are designed in a template editor with a live preview and exported as PDFs, then followed through to payment. Payments and status changes are tracked per invoice, and a bulk action bar updates or records payment for many invoices at once, with a single undo for the whole batch.',
    ],
    highlights: [
      'Dashboard with revenue analytics by tax year',
      'Invoices and quotes: create, duplicate, track payments and status',
      'Bulk status changes and payments with one-click undo',
      'Timesheets with a persistent timer, weekly view and per-client rates',
      'Invoice unbilled time by period; timesheet PDFs with sign-off',
      'Template editor with live preview and PDF export',
      'Client and product catalogues for quick autofill',
      'Dark, light and system themes',
    ],
    stack: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS 4', 'Firebase Auth', 'Firestore', 'React PDF', 'React Router', 'Firebase Hosting'],
    link: 'https://invoicing.codesolve.co.za/',
    linkLabel: 'Open Invoicing',
  },
  {
    id: 'aegis',
    title: 'Aegis Vault',
    category: 'Security SaaS',
    status: 'Live preview',
    visual: 'vault',
    summary: 'A zero-knowledge, end-to-end encrypted password manager with its own marketing site.',
    description: [
      'Aegis Vault is a zero-knowledge password manager: everything is encrypted in the browser before it is synced, so the server only ever stores ciphertext. Keys are derived from the master password and a separate Secret Key using PBKDF2-HMAC-SHA256 with 650,000 iterations, and every item is sealed with AES-256-GCM under a fresh random IV.',
      'The vault holds logins, secure notes, cards and identities, generates 2FA codes, and scores password health with a breach check. It auto-locks and wipes keys from memory, and ships with an emergency kit, CSV import, encrypted backups and a guided first-run tour.',
      'In production the Fastify API runs on Cloud Run behind Firebase Hosting, so the app and the API share one origin under a strict Content Security Policy. Only the API\'s own service account can reach Firestore; every client rule is closed. A separate marketing site covers features, security, pricing, help and free password tools. The project is a pnpm monorepo with around 270 tests, including full-stack end-to-end runs.',
    ],
    highlights: [
      'Zero-knowledge design: plaintext and keys never leave the device',
      'Two-secret key derivation (master password + Secret Key)',
      'AES-256-GCM per item with a fresh 96-bit IV',
      'Password health, breach check and 2FA codes',
      'Sign-in alerts, persistent rate limits and strict security headers',
      'Cloud Run API on the same origin as the app; Firestore closed to clients',
      'About 270 unit and end-to-end tests',
    ],
    stack: ['TypeScript', 'React', 'Vite', 'Fastify', 'Web Crypto API', 'Firestore', 'Cloud Run', 'Firebase Hosting', 'Vitest', 'pnpm workspaces'],
    link: 'https://codesolve-password-manager.web.app/',
    linkLabel: 'Visit Website',
    secondaryLink: 'https://codesolve-pm-vault.web.app/',
    secondaryLinkLabel: 'Open the Vault',
  },
  {
    id: 'next',
    title: 'Next Project',
    category: 'In the works',
  },
];
