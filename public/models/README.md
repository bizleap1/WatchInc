# WatchInc 3D Watch Asset Specification

This directory holds the production 3D asset (`watch-38mm.glb`) for WatchInc's cinematic architectural hero.

## File Placement
- **Target File:** `/public/models/watch-38mm.glb`
- **Format:** Binary glTF 2.0 (`.glb`)
- **Optimization:** Draco or meshopt compression recommended
- **Target Budget:** Under 4.0 MB for mobile web performance

---

## Technical Specifications (Provisional Dimensions)

> **Note:** Dimensions are based on the Overflow reference model and are provisional for interactive digital presentation (not claimed as CAD manufacturing blueprints).

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Case Diameter** | 38.0 mm | Symmetrical three-piece circular case |
| **Case Thickness** | ~9.5 mm | Including domed sapphire crystal |
| **Lug-to-Lug** | ~45.0 mm | Smooth downward ergonomics |
| **Lug Width** | 20.0 mm | Solid end-link connection |
| **Crown** | At 3 o'clock | Fluted knurling, embossed logo facet |
| **Bracelet** | Refined metal link | 3-link brushed steel with polished bevels |

---

## Mesh Hierarchy & Material Slot Naming

The React Three Fiber dynamic shader loader identifies submeshes by name. Ensure the GLB exports named nodes or material slots adhering to:

1. **`Dial` / `Dial_Face`** (Material: `Dial_Stone`):
   - **Crucial:** Must have planar circular UV mapping (0.0 to 1.0) with center at (0.5, 0.5) so that the six natural stone dial macro textures (`/images/dial-macro-*.webp`) map seamlessly.
2. **`Glass` / `Crystal`** (Material: `Sapphire_Glass`):
   - Domed front crystal with subtle bevel.
3. **`Hands`** (`Hands_Hour`, `Hands_Minute`, `Hands_Seconds`):
   - Polished rhodium steel finish.
4. **`Indices`** (`Indices_Baton`):
   - 12 applied polished metal baton markers.
5. **`Case`** (`Case_Bezel`, `Case_Middle`, `Case_Lugs`):
   - Brushed 316L stainless steel with mirror-polished chamfer edges.
6. **`Crown`**:
   - Polished knurled steel.
7. **`Bracelet`** (`Bracelet_EndLinks`, `Bracelet_Links`, `Clasp`):
   - Articulated link bracelet.
8. **`Caseback`**:
   - Circular brushed caseback with perimeter limited-edition engraving.

---

## Automated Dynamic Texture Swapping

When `watch-38mm.glb` is placed in this directory, the React Three Fiber system automatically maps the active slide's stone texture dynamically:
- **Overflow** &rarr; Citrine matrix (`/images/dial-macro-overflow.webp`)
- **Cherish** &rarr; Rose Quartz matrix (`/images/dial-macro-cherish.webp`)
- **Hush** &rarr; Amethyst matrix (`/images/dial-macro-hush.webp`)
- **Ascent** &rarr; Tiger's Eye matrix (`/images/dial-macro-ascent.webp`)
- **Wildfire** &rarr; Sunstone matrix (`/images/dial-macro-wildfire.webp`)
- **Cadence** &rarr; Sodalite matrix (`/images/dial-macro-cadence.webp`)
