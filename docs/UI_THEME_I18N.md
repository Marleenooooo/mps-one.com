Language: [English](UI_THEME_I18N.md) | [Bahasa Indonesia](id/UI_THEME_I18N.md)

# UI Theme & Internationalization

## Theme System
- Light and Dark themes with smooth transitions.
- Preferences persist via local storage; OS detection used on first load.
- Visual navigation uses module signature colors to orient users.

### Dark Mode Palette (key values)
- Background `#0A0F2D`, Surface `#1A1F3A`, Text Primary `#FFFFFF`.
- Module colors: Procurement `#00F0FF`, Finance `#FF00E5`, Inventory `#39FF14`, Reports `#FFB800`, Alerts `#FF2A50`.

### Light Mode Palette (key values)
- Background `#FFFFFF`, Surface `#F8FAFF`, Text Primary `#0A0F2D`.
- Module colors: Procurement `#0077FF`, Finance `#B84DB8`, Inventory `#00A86B`, Reports `#FF8A00`, Alerts `#FF4444`.

### Interaction Highlights
- Primary/secondary buttons use gradient fills with glow effects.
- Focus indicators: `outline: 2px solid [module-color]; outline-offset: 2px`.

## Language Preferences (i18n)
- Supported: English (`en`) and Indonesian (`id`).
- Storage keys: new `mpsone_lang` (primary), legacy `lang` maintained for compatibility.
- First-time default: geolocation hint sets `id` for Indonesia, `en` otherwise.
- Toggle language in the topbar; preference is cached locally across sessions.

## Troubleshooting
- To reset theme/language, clear local storage keys and refresh.
