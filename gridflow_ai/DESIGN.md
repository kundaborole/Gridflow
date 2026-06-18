---
name: GridFlow AI
colors:
  surface: '#0f141a'
  surface-dim: '#0f141a'
  surface-bright: '#353941'
  surface-container-lowest: '#0a0e15'
  surface-container-low: '#181c23'
  surface-container: '#1c2027'
  surface-container-high: '#262a32'
  surface-container-highest: '#31353d'
  on-surface: '#dfe2ec'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dfe2ec'
  inverse-on-surface: '#2d3038'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#d7ffc5'
  on-secondary: '#053900'
  secondary-container: '#2ff801'
  on-secondary-container: '#0f6d00'
  tertiary: '#ffe9d9'
  on-tertiary: '#4c2700'
  tertiary-container: '#ffc594'
  on-tertiary-container: '#864a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#79ff5b'
  secondary-fixed-dim: '#2ae500'
  on-secondary-fixed: '#022100'
  on-secondary-fixed-variant: '#095300'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#ffb778'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6c3a00'
  background: '#0f141a'
  on-background: '#dfe2ec'
  surface-variant: '#31353d'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-uppercase:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  panel-padding: 20px
---

## Brand & Style

The design system establishes a sophisticated, "Command Center" aesthetic tailored for high-stakes energy management. The brand personality is technical, precise, and authoritative, evoking a sense of future-forward infrastructure control. 

The visual style merges **Glassmorphism** with **Minimalist Professionalism**. Surfaces are treated as semi-transparent obsidian glass panes, layered over a deep, atmospheric void. High information density is prioritized, using clean lines and subtle glows to guide the eye through complex datasets without visual fatigue. The emotional response is one of calm, absolute control over massive energy flows.

## Colors

The palette is rooted in a "Deep Space" hierarchy to ensure maximum contrast for data visualization. 

- **Base Surfaces:** The primary background uses `#0A0E14` (Void), while floating panels and secondary containers use `#14181F` (Charcoal).
- **Primary Action (Electric Blue):** Reserved for active state indicators, primary CTA buttons, and interactive data nodes. It should emit a subtle outer glow (bloom) in high-priority contexts.
- **Status Indicators:** Neon Green signifies peak efficiency and "Healthy" status. Orange is used for predictive maintenance warnings, and Red is strictly reserved for critical failures or grid disconnects.
- **Data Layers:** Use low-opacity tints of the neutral color for grid lines and axis markers to keep the focus on the vibrant data signals.

## Typography

This design system utilizes **Geist** for its technical, monospaced-adjacent proportions which excel in data-heavy environments. **Inter** is utilized for micro-labels and auxiliary metadata to ensure legibility at small scales.

- **Data Presentation:** All numerical values should utilize the `data-mono` style to ensure tabular alignment in streaming data views.
- **Hierarchy:** Use `label-uppercase` for category headers above charts and panel sections to create a clear structural anchor.
- **Scale:** On mobile devices, `display-lg` scales down to 32px to maintain layout integrity while preserving the bold, technical impact.

## Layout & Spacing

The layout follows a **Fluid Grid** model designed for high-resolution mission control displays. 

- **Grid System:** A 12-column grid with tight 16px gutters to maximize screen real estate for charts and maps.
- **Density:** Elements are packed with a 4px base unit. Vertical rhythm is tight, allowing for more "at-a-glance" information without scrolling.
- **Responsive Behavior:** On desktop, the sidebar is persistent and collapsed to icons to save space. On mobile, the layout reflows into a single-column stack, prioritizing the "Live Grid Map" and "Critical Alerts" at the top of the viewport.

## Elevation & Depth

Depth is communicated through **Glassmorphism** and luminosity rather than traditional drop shadows.

- **Surface Treatment:** Panels use a 10% opacity white fill with a 20px backdrop blur. 
- **Borders:** Instead of shadows, use a 1px inner stroke with 15% opacity white on the top and left edges to simulate light hitting the edge of a glass pane.
- **Z-Axis:** 
    - **Level 0 (Background):** Pure `#0A0E14`.
    - **Level 1 (Panels):** Glass effect with subtle `#14181F` tint.
    - **Level 2 (Overlays/Modals):** Increased blur (40px) and a slightly thicker border (`primary_color_hex` at 20% opacity) to denote active focus.

## Shapes

The design system uses a **Soft** geometry to balance the coldness of the dark theme. 

- **Primary Corners:** A consistent 4px (0.25rem) radius is applied to panels and input fields.
- **Interactive Elements:** Buttons and tags use an 8px radius (`rounded-lg`) to distinguish them from structural containers.
- **Status Pips:** Status indicators for "Online/Offline" are perfect circles to stand out against the linear geometry of the rest of the UI.

## Components

### Buttons & Inputs
- **Primary Action:** Solid `primary_color_hex` background with black text. Features a 10px outer glow (bloom) of the same color.
- **Ghost Input:** Transparent background with a 1px border. On focus, the border glows Electric Blue and the background opacity increases slightly.

### Cards & Panels
- **Data Cards:** No solid background. Use the glassmorphism treatment with a "Label" at the top-left in `label-uppercase`. 
- **Charts:** Use thin 0.5px grid lines. Data lines should be 2px thick with a subtle gradient area fill underneath.

### Status & Feedback
- **Live Feed Chips:** Small, condensed chips with a blinking dot indicator (0.8s pulse) to show real-time connectivity.
- **Alert Banners:** Full-width at the top of a panel. Use a high-saturation red or orange with white text for maximum urgency.

### Specialized Components
- **The "Power Flow" Gauge:** A custom radial or linear progress component using the primary color to show load vs. capacity.
- **Node Toggle:** A refined switch that feels like a physical breaker, using the neon green for the "On" state.