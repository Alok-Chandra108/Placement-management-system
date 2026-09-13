# UI Redesign Instructions: Liquid Glass

These instructions are intended to guide the generation of the new UI using the "Liquid Glass" (glassmorphism) aesthetic, fully responsive for Android, while maintaining the existing color theme.

## 1. Overall Aesthetic & Design Trend
- **Primary Style:** Liquid Glass / Glassmorphism (iOS inspired).
- **Target Platforms:** iOS and Android. The design should be **identical** on Android, meaning the glassmorphism look should be fully responsive and adapt to Android viewports without switching to Material Design.
- **Theme:** Light Mode only.
- **Background:** A clean, subtle solid or gradient background blending the brand colors (Orange `#FEF0E3` and Blue `#EBF3FC`) to make the glass effect visible without being overly distracting.

## 2. Color Palette
The existing brand and neutral colors must be strictly maintained. Use these values in the generated CSS/Tailwind configuration:

**Brand Colors:**
- Brand Orange: `#F48120` (Use for primary actions/accents)
- Brand Orange Light: `#FEF0E3` (Use for subtle backgrounds)
- Brand Blue: `#09529B` (Use for headings, strong UI elements)
- Brand Blue Dark: `#063872` (Use for hover states)
- Brand Blue Light: `#EBF3FC` (Use for subtle backgrounds)

**Neutral Colors:**
- `#F8F9FA` (50) to `#1A1D21` (900). Use darker neutrals (`#343A40` to `#1A1D21`) for text on light glass backgrounds to ensure high contrast.

**Semantic Colors:**
- Success: `#1A7F4B`
- Error: `#C0392B`
- Warning: `#D97706`

## 3. "Liquid Glass" Implementation Details
- **Glass Cards/Containers:**
  - Background: Semi-transparent white (`rgba(255, 255, 255, 0.6)` or `bg-white/60`).
  - Backdrop Filter: Blur effect (`backdrop-filter: blur(16px)` or `backdrop-blur-md`/`backdrop-blur-lg`).
  - Border: A 1px solid, semi-transparent white inner border (`border border-white/40`) to simulate the reflection on the edge of the glass.
  - Shadow: Soft, multi-layered drop shadows (`box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05)`).
- **Typography:** Use the `Inter` font family. Ensure text is highly legible against the frosted glass by using solid, dark text colors (`#1A1D21` or `#343A40`).
- **Corner Radii:** Use generous rounding (`1rem` to `1.5rem` / `rounded-2xl` or `rounded-3xl`) for cards, buttons, and input fields to mimic the soft iOS aesthetic.

## 4. Mobile & Android Responsiveness
- **Fluid Layouts:** Ensure all glass containers use percentage-based widths or flexbox/grid layouts that adapt perfectly to narrow Android screens.
- **Touch Targets:** All interactive elements (buttons, links, inputs) must be at least `48x48dp` to accommodate touch interactions on mobile devices comfortably.
- **Spacing:** Maintain consistent padding, ensuring content does not touch the edges of the mobile screen. Use a minimum of `16px` padding around the screen edges.
- **Bottom Navigation (Optional but recommended for mobile):** For mobile devices, consider placing primary navigation in a floating glassmorphic bar at the bottom of the screen.

## 5. Components
- **Buttons:** 
  - Primary buttons should be solid `#09529B` or `#F48120` with a subtle drop shadow to stand out from the glass.
  - Secondary buttons can use the glassmorphic style (frosted background, white border).
- **Inputs:** Semi-transparent white backgrounds (`rgba(255, 255, 255, 0.4)`) with a slightly darker inner shadow to look recessed. When focused, add a subtle brand-colored border.
- **Modals/Dialogs:** Must also use the glassmorphism effect, blurring the content behind them to create depth.
