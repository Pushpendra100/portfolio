# Pushpendra Pal — Portfolio

An animated, story-driven portfolio built as a single static site — no build step, no
framework. Just `index.html`, `styles.css`, and `main.js`, so GitHub Pages can serve it
directly.

**Concept:** an engineering-blueprint × strategy-deck aesthetic. The signature element is a
career *trajectory that climbs from 0 → 100* — intern developer → consultant → growth →
founder — plotted and drawn as you scroll.

- **Type:** Fraunces (display) · Hanken Grotesk (body) · Space Mono (data/labels)
- **Palette:** deep teal-ink · warm amber (accent) · electric mint (data line)
- **Motion:** scroll-drawn SVG curves, staggered reveals, count-up stats, cursor glow —
  all disabled automatically when the visitor prefers reduced motion.

---

## Run locally

Just open `index.html` in a browser. Or serve it (recommended, so fonts/paths behave like production):

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000

# or Node
npx serve
```

---

## Deploy to GitHub Pages

1. **Create a repo** and push these files to the `main` branch:

   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/Pushpendra100/<repo-name>.git
   git push -u origin main
   ```

   > Tip: name the repo `Pushpendra100.github.io` to get the clean root URL
   > `https://pushpendra100.github.io`. Any other name serves at
   > `https://pushpendra100.github.io/<repo-name>/`.

2. **Enable Pages:** repo → **Settings → Pages** → *Source:* **Deploy from a branch** →
   Branch **main**, folder **/ (root)** → **Save**.

3. Wait ~1 minute. Your site is live at the URL shown on that Pages screen.

The included `.nojekyll` file tells GitHub to serve the files as-is (skipping Jekyll
processing), which avoids any surprises with folders or assets.

---

## Customising

| What | Where |
|------|-------|
| Bio, experience, projects, links | `index.html` (each section is labelled with a `CH 00–07` comment) |
| Colours, fonts, spacing | the `:root` variables at the top of `styles.css` |
| Trajectory data points | the `pts` array near the top of `main.js` |
| Stat count-up numbers | `data-count` / `data-suffix` attributes on the hero `<b>` tags |

### Adding a profile photo (optional)

The design is intentionally illustrative and works without a photo. To add one, drop an image
at `assets/profile.jpg` and place an `<img>` in the hero — the layout leaves room in the
`.hero__intro` column.

---

_Content sourced from Pushpendra's Notion portfolio. Résumé and article links point to the
originals; update them in `index.html` if they move._
