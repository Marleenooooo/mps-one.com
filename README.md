# MPS One — B2B Procurement Web App

This is a React + Vite + TypeScript single‑page application targeting mining companies in Kalimantan. We operate with manual deployments (no CI/CD).

## Project Structure

- `webapp/` — Vite app source
  - `src/` — React components, pages, styles
  - `public/.htaccess` — SPA routing fallback bundled into `dist`
  - `vite.config.ts` — includes `base: './'` for relative asset paths

## Development

- Start dev server: `npm run dev` (in `webapp/`)
- Preview production build locally: `npm run preview`

## Build & Package (Manual Deployment)

- Build: `npm run build`
- Build and zip (Windows): `npm run build:zip` → produces `webapp/dist.zip`

## Deploy (Manual, Hostinger)

1. Open hPanel File Manager or connect via FTP.
2. Upload the contents of `webapp/dist/` (or `dist.zip`) to `/public_html/`.
3. Ensure `index.html`, `assets/`, and `.htaccess` are at the root of `/public_html/`.
4. Hard refresh the site and verify no 404s for assets.

Details are in `DEPLOY.md`.

## Backend/API & Database
- See `docs/DB_SETUP.md` for MySQL setup (DB: `mpsonedatabase`, User: `mpsone`) and backend environment configuration.

## Environment

- Set `webapp/.env.production`:
  - `VITE_APP_URL=https://mps-one.com/`
  - `VITE_API_BASE=/api` (proxy to backend)
- Set `webapp/.env.development`:
  - `VITE_APP_URL=http://localhost:5173`
  - `VITE_API_BASE=http://localhost:3000`

## Theming

- Light and Dark themes with corporate palette with  Neon accent variant.
- Colors are defined in `webapp/src/index.css` via CSS variables.
- MUST IMPLEMENT BOTH DARK & LIGHT THEMES WITH PROFESSIONAL CORPORATE DESIGN:
 
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


## Product Specification

The full product spec and UI/UX requirements are appended to `DEPLOY.md` under “Product Spec: B2B Procurement Webapp”.


