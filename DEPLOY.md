# Deployment to Hostinger (Manual Upload — No CI/CD)

We deploy manually without GitHub Actions. Build locally, then upload the contents of `webapp/dist/` to Hostinger `public_html/` using hPanel File Manager or an FTP client.

## Prerequisites

- Local machine with Node.js LTS installed.
- Hostinger account with domain configured and SSL enabled (Let’s Encrypt).
- Access to hPanel File Manager or FTP credentials.

## Repository (reference)

- Primary repo: https://github.com/Marleenooooo/mps-one.com
- The app lives in `webapp/`. CI workflows exist in the repo but are not used operationally.

## Build Locally

1. Open a terminal in `webapp`.
2. Install dependencies: `npm ci`.
3. Build production bundle: `npm run build`.
4. Verify output in `webapp/dist/` (includes `index.html`, `assets/`, and `.htaccess`).

Optional: Package for upload as a single archive (Windows):
- Use File Explorer to create `dist.zip` from the contents of `webapp/dist/`.
- Or PowerShell: `Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip -Force`.

## Upload to Hostinger

You can deploy via either hPanel File Manager or an FTP client.

### Option A — hPanel File Manager

1. Log in to Hostinger hPanel.
2. Open File Manager and navigate to `/public_html/` (document root).
3. Upload `dist.zip` (or the contents of `webapp/dist/`).
4. If you uploaded `dist.zip`, extract it so that `index.html`, `assets/`, and `.htaccess` sit directly under `/public_html/`.
5. Remove old assets if necessary (back up first; see Rollback).

### Option B — FTP client (FileZilla/WinSCP)

- Host: `153.92.11.36` (explicit TLS, port 21)
- Username: `u485208858`
- Password: your FTP account password
- Remote directory: `/public_html/`

Steps:
1. Connect with explicit TLS.
2. Upload the contents of `webapp/dist/` (not the `dist` folder itself) into `/public_html/`.
3. Confirm that `index.html` and `.htaccess` are present at the root.

## Environment Configuration

- Ensure `webapp/.env.production` is correct:
  - `VITE_APP_URL=https://mps-one.com/` (or your staging domain)
- `vite.config.ts` has `base: './'` so asset paths are relative and work from `public_html/`.

## SPA Routing (Apache)

`webapp/public/.htaccess` is included in the build to support client-side routing:

```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

This allows deep links like `/admin` or `/procurement/quote-builder` to resolve to `index.html`.

## Post-Deployment Checks

- Visit your domain and hard-refresh (Ctrl+Shift+R).
- Open DevTools and confirm no 404s for `assets/*` and no console errors.
- Test a few deep links and page refresh to verify `.htaccess` routing.

## Rollback & Versioning

- Before replacing files, back up current `public_html` to a dated folder (e.g., `/backup_YYYYMMDD/`).
- Keep local `dist.zip` archives with version/date labels.
- To roll back, re-upload a previous `dist.zip` and extract over `public_html` (or restore your backup).

## Staging (optional)

- If using a staging subdomain, upload to its directory (e.g., `/staging/`).
- Set `VITE_APP_URL` accordingly in `.env.production` before building.

## Notes

- We’re not using CI/CD; deployments are manual from local builds.
- No backend integration is included yet; the app is a front-end SPA ready for future API wiring.

---

## Product Spec: B2B Procurement Webapp (Colors aligned to current theme)

BUILD A B2B PROCUREMENT WEBAPP WITH THESE SPECIFICATIONS:
 
TARGET: Mining companies in Kalimantan with multi-user corporate accounts integrating email workflows and supply chain management.
 
MUST IMPLEMENT BOTH DARK & LIGHT THEMES WITH PROFESSIONAL CORPORATE DESIGN:
 
NEON CORPORATE COLOR PALETTE - VISUAL NAVIGATION SYSTEM

🌙 DARK MODE PALETTE

BASE COLORS:
Background: #0A0F2D (Midnight Blue)
Surface: #1A1F3A (Elevated Card)
Surface2: #252A45 (Secondary Card)
Text Primary: #FFFFFF
Text Secondary: #A0A8D0
Text Disabled: #5A6180
Border: #2D3250

MODULE SIGNATURE COLORS:
🟦 PROCUREMENT: #00F0FF (Neon Cyan)
🟪 FINANCE: #FF00E5 (Neon Magenta)
🟩 INVENTORY: #39FF14 (Neon Green)
🟨 REPORTS: #FFB800 (Neon Amber)
🔴 ALERTS: #FF2A50 (Neon Red)

DARK MODE GRADIENTS:
PRIMARY BUTTON: linear-gradient(135deg, #00F0FF 0%, #0077FF 100%)
SECONDARY BUTTON: linear-gradient(135deg, #FFB800 0%, #FF5E00 100%)
SUCCESS: linear-gradient(135deg, #39FF14 0%, #00CC66 100%)
DANGER: linear-gradient(135deg, #FF2A50 0%, #CC0000 100%)

DARK MODE INTERACTION STATES:
🟦 PRIMARY BUTTON:
- Normal: Gradient Cyan (#00F0FF → #0077FF)
- Hover: Glow effect + scale(1.02) + box-shadow: 0 0 15px #00F0FF
- Active: Darker gradient (#0088CC → #0055AA)
- Disabled: #2D3250 with 40% opacity

🟪 SECONDARY BUTTON:
- Normal: Gradient Magenta (#FF00E5 → #CC00B8)
- Hover: Glow + pulse animation + box-shadow: 0 0 15px #FF00E5
- Active: Darker magenta (#AA0099)

OUTLINE BUTTONS:
- Border: Gradient sesuai module
- Background: Transparent
- Hover: Fill dengan gradient + 20% opacity

☀️ LIGHT MODE PALETTE

BASE COLORS:
Background: #FFFFFF
Surface: #F8FAFF (Very Light Blue)
Surface2: #F0F5FF (Light Blue Grey)
Text Primary: #0A0F2D (Midnight Blue)
Text Secondary: #5A6178 (Blue Grey)
Text Disabled: #A0A8C0
Border: #E5E9F0

LIGHT MODE SIGNATURE COLORS:
🟦 PROCUREMENT: #0077FF (Professional Blue)
🟪 FINANCE: #B84DB8 (Soft Magenta)
🟩 INVENTORY: #00A86B (Emerald Green)
🟨 REPORTS: #FF8A00 (Warm Orange)
🔴 ALERTS: #FF4444 (Alert Red)

LIGHT MODE GRADIENTS:
PRIMARY BUTTON: linear-gradient(135deg, #0077FF 0%, #0055CC 100%)
SECONDARY BUTTON: linear-gradient(135deg, #FF8A00 0%, #FF5E00 100%)
SUCCESS: linear-gradient(135deg, #00A86B 0%, #008855 100%)
DANGER: linear-gradient(135deg, #FF4444 0%, #CC0000 100%)

LIGHT MODE INTERACTION STATES:
🟦 PRIMARY BUTTON:
- Normal: Gradient Blue (#0077FF → #0055CC)
- Hover: Soft glow + scale(1.02) + box-shadow: 0 0 10px rgba(0,119,255,0.3)
- Active: Darker blue (#0044AA → #003388)
- Disabled: #E5E9F0 with 40% opacity

🟪 SECONDARY BUTTON:
- Normal: Gradient Orange (#FF8A00 → #FF5E00)
- Hover: Soft glow + box-shadow: 0 0 10px rgba(255,138,0,0.3)
- Active: Darker orange (#CC5500)

🎨 VISUAL NAVIGATION SYSTEM

PAGE HEADER GRADIENTS (Dark Mode):
PROCUREMENT: linear-gradient(90deg, #0A1F4D 0%, #0A0F2D 100%)
FINANCE: linear-gradient(90deg, #2D0A4D 0%, #0A0F2D 100%)
INVENTORY: linear-gradient(90deg, #0A4D2A 0%, #0A0F2D 100%)

PAGE HEADER GRADIENTS (Light Mode):
PROCUREMENT: linear-gradient(90deg, #E3F2FD 0%, #F8FAFF 100%)
FINANCE: linear-gradient(90deg, #F3E5F5 0%, #F8FAFF 100%)
INVENTORY: linear-gradient(90deg, #E8F5E8 0%, #F8FAFF 100%)

ACCENT BORDERS:
Border Image: linear-gradient(90deg, [module-color], [module-gradient-end]) 1

SIDEBAR ACTIVE STATES:
ACTIVE MENU ITEM:
- Background: rgba([module-color], 0.15)
- Border Left: 3px solid [module-color]
- Icon Color: [module-color]
- Text Color: [module-color]

HOVER MENU ITEM:
- Background: rgba([module-color], 0.08)
- Transition: all 0.2s ease

✨ EFFECTS & ANIMATIONS

GLOW EFFECTS:
NEON GLOW (Dark Mode): box-shadow: 0 0 10px [module-color], 0 0 20px [module-color]
SOFT GLOW (Light Mode): box-shadow: 0 0 5px rgba([module-rgb], 0.3)

MICRO-INTERACTIONS:
BUTTON HOVER:
- transform: scale(1.02)
- box-shadow: 0 4px 12px rgba([module-rgb], 0.4)
- transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

CARD HOVER:
- transform: translateY(-2px)
- box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15)

LOADING STATES:
SKELETON LOADING:
background: linear-gradient(90deg, #2D3250 25%, #3A4060 50%, #2D3250 75%)
background-size: 200% 100%
animation: loading 1.5s infinite

PROGRESS BARS:
background: linear-gradient(90deg, [module-color] 0%, [module-gradient-end] 100%)

🎯 COLOR USAGE RULES

MAXIMUM COLOR PER PAGE:
1 PRIMARY MODULE COLOR (60%)
1 SECONDARY ACCENT (30%)
1 NEUTRAL BASE (10%)
+ Success/Error states when needed

ACCESSIBILITY:
CONTRAST RATIOS:
- Text Primary: 7:1 (AAA)
- Text Secondary: 4.5:1 (AA)
- Interactive Elements: 3:1 (Minimum)

FOCUS INDICATORS:
outline: 2px solid [module-color]
outline-offset: 2px

🔄 THEME TRANSITION

SMOOTH THEME SWITCHING:
transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease

PERSISTENT USER PREFERENCE:
localStorage theme preference
OS theme detection
Manual toggle with instant preview

✅ SYSTEM FEATURES:
- Visual clarity tanpa overwhelming
- Intuitive navigation melalui color coding
- Professional feel dengan sentuhan modern
- Accessibility yang memenuhi standar
- Brand memorability yang kuat
- Consistent across seluruh aplikasi
 
=== CORE FEATURES TO IMPLEMENT ===
 
1. MULTI-USER CORPORATE ONBOARDING
   - Company registration with hierarchy setup
   - Role-based permissions (Admin, PIC Operational, PIC Procurement, PIC Finance)
   - Department and budget allocation interface
 
2. PROCUREMENT WORKFLOW SYSTEM
   - Purchase Request (PR) creation with rich form
   - Quote generation and management
   - PO conversion and tracking
   - Status pipeline visualization (PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid)
 
3. EMAIL INTEGRATION DASHBOARD
   - Two-way sync visualization between app and email
   - Threaded communication view
   - Automated email template management
   - CC/BCC configuration per client type
 
4. SUPPLY CHAIN TRACKING
   - Real-time order status with timeline
   - Logistics integration interface
   - Document management hub (quotes, POs, invoices, delivery proofs)
   - Emergency order channel with priority tagging
 
5. ADVANCED DASHBOARDS
 
=== ADMIN DASHBOARD (Your Team) ===
 - Overview cards: Pending Quotes, Active POs, Unpaid Invoices
 - Recent activity feed with user actions
 - Quick action buttons for common tasks
 - Performance metrics with charts
 - Client communication center
 
=== CLIENT DASHBOARD (Corporate Users) ===
 - Personalized welcome with company name
 - Quick PR creation widget
 - Order tracking with visual progress bars
 - Document repository with quick access
 - Budget utilization indicators
 
=== UI/UX REQUIREMENTS ===
 
NAVIGATION:
 - Fixed sidebar with collapsible menu
 - Breadcrumb navigation for deep workflows
 - Quick search across all modules
 - Notification bell with unread counts
 
DATA TABLES:
 - Sortable, filterable, paginated tables
 - Bulk action controls
 - Row selection with context actions
 - Export functionality (CSV, PDF)
 
FORMS:
 - Multi-step forms for complex processes
 - Real-time validation with helpful errors
 - Auto-save functionality
 - File upload with drag & drop
 - Rich text editors for descriptions
 
CARDS & WIDGETS:
 - Elevated cards with subtle shadows
 - Hover effects with smooth transitions
 - Status badges with color coding
 - Progress indicators with percentages
 
MICRO-INTERACTIONS:
 - Smooth page transitions (fade in/out)
 - Button loading states with spinners
 - Toast notifications for actions
 - Tooltips on hover for icons
 - Skeleton loading for data fetching
 
RESPONSIVE BEHAVIOR:
 - Mobile-first approach but desktop-optimized
 - Collapsible columns on tablets
 - Touch-friendly buttons on mobile
 - Adaptive layouts for all screen sizes
 
=== SPECIFIC COMPONENTS TO CREATE ===
 
1. QUOTE BUILDER
   - Item table with quantity, price, total
   - Tax and discount calculations
   - Template selection
   - Preview mode before sending
 
2. ORDER TRACKER
   - Visual pipeline with status dots
   - Estimated delivery countdown
   - Shipping information display
   - Delivery proof upload zone
 
3. DOCUMENT MANAGER
   - Thumbnail preview for files
   - Version history tracking
   - Bulk download capability
   - Access permission controls
 
4. COMMUNICATION HUB
   - In-app messaging with read receipts
   - Email thread mirroring
   - @mentions for team members
   - File sharing in conversations
 
5. REPORTING MODULE
   - Spending analytics charts
   - Vendor performance scores
   - Budget utilization graphs
   - Export-ready reports
 
=== TECHNICAL REQUIREMENTS ===
 
 - Implement theme switching with persistence
 - Use CSS variables for easy theme management
 - Ensure WCAG AA accessibility compliance
 - Optimize for fast loading (lazy load non-critical components)
 - Implement proper error boundaries
 - Add offline capability indicators
 
=== SUCCESS CRITERIA ===
 
The final webapp must feel like an enterprise SaaS product, not a simple prototype. It should have:
 
 - Professional aesthetics that build trust
 - Intuitive workflows that reduce training needs
 - Robust functionality that handles real business scenarios
 - Polished interactions that delight users
 - Scalable architecture that can grow with business needs
 
Build this with attention to detail that makes it production-ready. Focus on creating a superior user experience for both Client and Suplier that mining companies and Suplier companies will adopt willingly because it genuinely improves their procurement process.
 
Remember: This is for corporate users who expect professional, reliable tools. The design should reflect that expectation in every pixel and interaction.