# Design System Document: The Pitch & The Podium

## 1. Overview & Creative North Star
**Creative North Star: "The Stadium Lights"**
This design system moves away from the "standard" dashboard aesthetics and embraces the cinematic intensity of a World Cup final under the floodlights. We are not just building a betting tool; we are building a digital arena. The experience is defined by **High-Contrast Editorial Layouts** and **Layered Tonal Depth**. 

By breaking the rigid grid with intentional asymmetry—such as oversized typography overlapping container edges and "Ghost" elements that bleed into the background—we create a sense of momentum. The design system prioritizes a premium, "VIP box" feel that balances professional data visualization with the raw energy of the pitch.

---

## 2. Colors: Depth Over Definition
Our palette is rooted in the "Deep Stadium" experience. It avoids flat, artificial colors in favor of a sophisticated hierarchy of dark greens and trophy-grade golds.

*   **Primary (`#88D982`):** The "Pitch Green." Use this for success states and primary action highlights. 
*   **Secondary (`#FFF9EF`):** "The Clean Sheet." An off-white that provides a softer, more premium feel than pure hex white.
*   **Gold Accents (`secondary_container`: `#FFDB3C`):** Used sparingly to denote "The Podium"—first-place rankings, high-stakes bets, and winning moments.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
*   Instead of a border, place a `surface_container_low` card on a `surface` background.
*   For table rows, use a subtle shift to `surface_container_high` on hover rather than a dividing line.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of glass and turf. 
1.  **Base:** `surface` (`#131313`) – The dark stadium atmosphere.
2.  **Sectioning:** `surface_container_low` – Subtle grouping for main content areas.
3.  **Elevation:** `surface_container_highest` – Use for active "Match Details" cards or "Prediction Inputs."

### The "Glass & Gradient" Rule
To evoke the polish of a trophy, use Glassmorphism. Floating match cards should utilize a backdrop-blur (12px–20px) combined with a semi-transparent `surface_variant`. 
**Signature Texture:** Main CTAs should use a linear gradient from `primary` (`#88D982`) to `primary_container` (`#004E10`) at a 135-degree angle to create a "metallic sheen" effect.

---

## 3. Typography: The Editorial Edge
We pair the aggressive, technical precision of **Space Grotesk** with the fluid, modern readability of **Plus Jakarta Sans**.

*   **Display & Headlines (Space Grotesk):** These are your "Scoreboard" fonts. Use `display-lg` for tournament titles and `headline-lg` for match scores. The wide tracking and geometric shapes feel high-tech and competitive.
*   **Body & Titles (Plus Jakarta Sans):** These handle the "Commentary." Use `body-md` for betting odds and descriptions. The high x-height ensures readability in data-heavy tables.
*   **Labels (Lexend):** Used exclusively for "Team Stats" and "User Rankings." Lexend’s hyper-readability is perfect for micro-copy and secondary data points.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "software-like." We use **Ambient Light** and **Tonal Stacking**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` input field inside a `surface_container_high` card to create a "carved-in" look.
*   **Ambient Shadows:** For "floating" elements like Prediction Modals, use a shadow with a 40px blur at 6% opacity, tinted with `primary` (`#88D982`). This mimics the green glow of the stadium turf reflecting onto the interface.
*   **The "Ghost Border" Fallback:** If a separation is strictly required for accessibility, use the `outline_variant` token at 15% opacity. Never use 100% opaque lines.

---

## 5. Components

### Match Details Cards
*   **Visual Style:** Forbid divider lines. Use `surface_container_high` for the card body. Use vertical whitespace (32px) to separate the "Home Team" and "Away Team" blocks.
*   **Score Highlight:** The score should be in `display-md` (Space Grotesk) centered, using a `surface_bright` background to make it "pop."

### Ranking Tables (The Leaderboard)
*   **Row Styling:** No horizontal lines. Use a `surface_container_low` background for the entire table. The "Top 3" players should have a `secondary_container` (Gold) left-accent bar (4px width).
*   **Hover State:** Row background shifts to `surface_container_highest`.

### Prediction Inputs
*   **Base State:** `surface_container_lowest` with a "Ghost Border" (15% `outline_variant`).
*   **Focus State:** The border vanishes, replaced by a 2px `surface_tint` (Primary Green) glow and a slight `surface_bright` lift.

### Buttons
*   **Primary:** Gradient (`primary` to `primary_container`), `label-md` (All Caps, Bold), `XL` roundedness (0.75rem).
*   **Secondary:** Ghost style. Transparent background with a `primary` "Ghost Border."
*   **Tertiary:** No container. Pure `primary` text with a 1px underline that appears only on hover.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use oversized "Space Grotesk" numbers for rankings (e.g., a giant "01" behind the player name at 10% opacity).
*   **DO** use `full` roundedness (9999px) for "Live" status chips to create a "pill" aesthetic.
*   **DO** embrace "Dark Mode" as the only mode. This is a night-time tournament experience.

### Don’t:
*   **DON'T** use standard grey shadows. It makes the "Stadium Green" look muddy.
*   **DON'T** use tight margins. Sports data needs room to breathe to avoid looking like a spreadsheet.
*   **DON'T** use 1px dividers between table columns. Use 24px of horizontal padding to define the columns visually.

### Accessibility Note:
While we utilize "Ghost Borders" and Tonal Layering, ensure that all interactive elements maintain a contrast ratio of at least 4.5:1 against their immediate background. Use the `on_surface` (`#E5E2E1`) for all critical data points.