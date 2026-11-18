# BRAND NAME — Crystal Watch Launch Platform

A complete, premium crystal-watch launch website built with **Next.js App Router**, **JavaScript** (no TypeScript), **Tailwind CSS**, and **Motion (Framer Motion)**.

Inspired by dreamy pastel editorial aesthetics, the design captures powder blue, misty lavender, soft blush, and warm ivory hues with floating mineral objects, authentic macro stone textures, glowing discoverable hotspots, and an accessible modal experience.

---

## Visual & Design System

- **Palette**:
  - Warm Ivory: `#F7F4ED`
  - Powder Blue: `#CCDDE3`
  - Misty Lavender: `#D9D3E3`
  - Soft Blush: `#EEDCE0`
  - Ink Charcoal: `#242321`
  - Muted Editorial: `#696560`
- **Subtle Stone Accents**:
  - Citrine (Overflow): Honey (`#D49E35`)
  - Rose Quartz (Cherish): Soft Rose (`#D9889A`)
  - Amethyst (Hush): Misty Violet (`#8F7CA8`)
  - Tiger's Eye (Ascent): Amber-Brown (`#A6743A`)
  - Sunstone (Wildfire): Radiant Peach (`#D97B5F`)
  - Sodalite (Cadence): Muted Indigo Blue (`#4C6B85`)
- **Typography**:
  - Display & Headings: *Cormorant Garamond* (light editorial serif)
  - Navigation, UI & Functional Text: *Instrument Sans* (clean modern grotesque)
- **Atmosphere**: Subtle organic gradients, floating mineral drift, fine SVG grain overlay (`/textures/grain.svg`), generous whitespace, and restrained card borders.

---

## The Debut Collection

| Piece | Stone | Traditional Intention | Role / Concept | Accent Tone |
| :--- | :--- | :--- | :--- | :--- |
| **Overflow** | Natural Citrine Quartz | *“Worn for abundance.”* | The wealth piece | Honey Amber |
| **Cherish** | Crystalline Rose Quartz | *“Worn for the love you give yourself.”* | The self-love piece | Soft Rose |
| **Hush** | Natural Amethyst Quartz | *“Worn for a quieter mind.”* | The peace piece | Misty Violet |
| **Ascent** | Tiger’s Eye | *“Worn for the next step up.”* | The career piece | Amber-Brown |
| **Wildfire** | Oligoclase Sunstone | *“Worn to be seen.”* | The fame piece | Terracotta Peach |
| **Cadence** | Tectosilicate Sodalite | *“Worn for words that land.”* | The communication piece | Denim Blue |

*Note: All stone associations are rooted in cultural tradition and personal symbolism. No outcome claims are made.*

---

## Key Architecture & Features

### 1. Interactive Hero Scene
- Full viewport height (`h-[100svh]`) matching the exact dreamy pastel reference visual composition.
- Frosted botanical flora framing all four corners with delicate frosted glass texture.
- Luminous diffuse white emblem centered above the headline.
- Exact editorial typography:
  - **Headline**: *“Something new is taking shape.”*
  - **Supporting copy**: *“Four new pieces, each with a story of its own. / Be the first to discover what’s coming.”*
- Single soft translucent pill button: *“Join the Waitlist”* with gentle backdrop blur.
- Four interactive glowing hotspots matching the exact reference coordinates:
  - Top-Left (`19.8%, 13.6%`): Overflow (Citrine)
  - Bottom-Left (`20.0%, 86.0%`): Cherish (Rose Quartz)
  - Top-Right (`83.5%, 12.4%`): Hush (Amethyst)
  - Bottom-Right (`74.8%, 90.8%`): Ascent (Tiger's Eye)
- Discreet bottom-right circular control (`···`) that opens an elegant slide-out navigation menu.
- The top header remains hidden across the hero section and smoothly fades in only when the user scrolls down to the collection and lower sections, preserving the unencumbered editorial purity of the hero.

### 2. Product Modal Dialog
- Viewport-constrained, internally scrollable modal on mobile and desktop.
- Full accessibility: focus trapping, focus restoration to opener, `Escape` key dismissal, backdrop click dismissal, and `body` scroll locking.
- Product-specific pastel CTA button (*"Join the Waitlist for [Watch]"*) which pre-fills the waitlist form.
- Quiet link to the individual dedicated product route.

### 3. Dedicated Product Routes (`/collection/[slug]`)
- Reusable page template for all six pieces.
- High-definition watch illustration, geological origin details, macro stone inclusions, practitioner attestation preview, and individual waitlist reservation.
- Unknown slugs return an editorial 404 page (`notFound()`).

### 4. Unique-Dial Story & Practitioner Ritual
- Section 5 showcases natural crystalline variation with illustrative sample **“Dial no. 0147”**.
- Section 6 illustrates the 4 proofs of practitioner dedication:
  1. Individual sequential dial number.
  2. Practitioner's name (*“Energized by Elena V. before it ships.”*).
  3. Dedication date (*“Autumn 2026”*).
  4. Physical dated card mockup accompanying the watch.

### 5. Selenite Resting Plate
- Section 7 features a still-life composition of the optional carved selenite companion plate.
- Explicitly documented as an optional checkout add-on that does not alter the watch mechanism.

### 6. Server-Side Waitlist & Honest Availability State
- **Server Persistence**: Signups are securely stored server-side with deduplication and timestamps (defaulting to zero-credential local file persistence at `data/waitlist-records.json`).
- **Abuse Protection**: Client IP rate limiting (maximum 5 requests per minute) and invisible honeypot field (`website_trap`).
- **Honest State**: If backend credentials are missing or mode is set to `disabled`, the system returns `503 Service Unavailable` with an honest notice: *"Waitlist registration is currently in preview mode. Server-side database integration is pending configuration."* No fake successes are ever displayed.

---

## Analytics: Selenite Plate Interest Calculation

Waitlist analytics can be queried via `GET /api/waitlist`. To protect client privacy, **no email addresses or individual identities are ever exposed**.

The interest share for the Selenite Resting Plate is calculated strictly as:

$$\text{Plate Interest Share (\%)} = \left( \frac{\text{Count of "Yes" Responses}}{\text{Count of "Yes"} + \text{Count of "No"} + \text{Count of "Maybe"}} \right) \times 100$$

### Methodology:
- **Exclusion of Unanswered**: Respondents who leave the question blank or choose to skip it are classified as `"unanswered"`. Unanswered records are tracked in their own category and are strictly **excluded from the denominator**.
- **Accuracy**: If 10 people choose "Yes", 5 choose "No", 5 choose "Maybe", and 30 leave it blank:
  - Answered total = $10 + 5 + 5 = 20$
  - Plate Interest Share = $10 / 20 = 50.0\%$
  - Unanswered count = $30$

---

## Project Structure

```
src/
  app/
    layout.js                 # Global HTML, head metadata, noise overlay, Header & Footer
    page.js                   # Homepage composing all six sections & product modal
    globals.css               # Tailwind CSS, color variables, custom scrollbars
    collection/[slug]/page.js # Reusable dynamic product routes with generateStaticParams
    not-found.js              # Editorial 404 handler
    api/waitlist/route.js     # POST (signup with rate limiting) & GET (privacy-safe analytics)
  components/
    layout/
      Header.jsx              # Responsive navigation with temporary wordmark
      Footer.jsx              # Links, concierge contact placeholder, and tradition statement
    home/
      HeroScene.jsx           # Dreamy pastel canvas, central headline, mobile discover drawer
      ProductHotspots.jsx     # Responsive glowing hotspot pins with hover/focus cards
      CollectionSection.jsx   # 3-column desktop / 1-column mobile product cards
      UniqueDialSection.jsx   # Macro stone dial and Dial no. 0147 sample story
      PractitionerRitualSection.jsx # Dedication narrative and sample physical card mockup
      SeleniteSection.jsx     # Selenite resting plate still-life and add-on info
      WaitlistSection.jsx     # Waitlist section container with ambient lighting
    product/
      ProductModal.jsx        # Rounded modal with pastel CTA, trap focus, body lock
      ProductCard.jsx         # Editorial card with stone glow and quick view
      ProductDetails.jsx      # Full-page product layout with geological metadata
    forms/
      WaitlistForm.jsx        # Form with validation, plate radios, consent, honeypot
    ui/
      Button.jsx              # Polymorphic accessible button with loading spinner
      Modal.jsx               # Framer motion dialog with keyboard navigation
      Reveal.jsx              # Scroll-triggered viewport entrance animations
  data/
    products.js               # Central catalog of all 6 watches, stones, colors & coordinates
    site.js                   # Central brand configuration ("BRAND NAME")
  lib/
    validation.js             # RFC email regex, watch slug check, honeypot validation
    waitlist.js               # Server-side persistent storage, deduplication & rate limiting
    analytics.js              # Privacy-safe aggregate plate share metric calculation
public/
  images/
    hero/                     # Organic floating crystal SVGs
    products/                 # Detailed vector dials, macro stone textures & selenite plate
    rituals/                  # Sample practitioner attestation card mockup
  textures/
    grain.svg                 # Lightweight fractal noise grain overlay
.env.example                  # Environment configuration documentation
README.md                     # Architecture, metrics, and developer guide
```

---

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   pnpm install
   # or npm install
   ```

2. **Run the Development Server**:
   ```bash
   pnpm run dev
   # or npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production Build**:
   ```bash
   pnpm run build
   pnpm run start
   ```

---

## Configurable Brand & Assets

- **Brand Wordmark**: Change `brandName: "BRAND NAME"` in `src/data/site.js` to immediately update all navigation, footers, card mockups, and metadata.
- **Production Photography**: Replace the vector SVGs in `public/images/products/` with high-resolution photography keeping the matching filenames or updating paths in `src/data/products.js`.
