# BARAKS DINE — Premium Hotel & Fine Dining Concept Website

A responsive static HTML/CSS/JavaScript showcase with GSAP/ScrollTrigger, Lenis and a progressive Three.js decorative scene.

## Project files

```text
baraks-dine-premium/
├── index.html
├── 404.html
├── README.md
├── assets/
│   └── favicon.svg
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── config.js
    └── three-scene.js
```

## Run locally

No Node.js or build process is required. Open `index.html` directly for a basic preview, or run a local server from this folder:

```powershell
py -m http.server 5500
```

Then open http://localhost:5500.

VS Code + Live Server also works.

## Publish on GitHub Pages

1. Create a public GitHub repository.
2. Upload the *contents* of this project folder to the repository root (so `index.html` is at the root, not inside an extra nested folder).
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then save.
6. Wait for GitHub Pages to finish publishing. The site URL is shown in Settings → Pages.

## Important before using this as a real hotel website

This is a design/demo front end, not a reservation or property-management system. Room availability, table reservations, contact form submissions, newsletter delivery and live chat are not connected to a backend. The forms validate locally and show demo messages only. Sample prices, staff names, guest testimonials, room counts and business details are fictional placeholders. Do not represent them as verified facts.

Edit `js/config.js` to set a verified WhatsApp phone number, map query and currency display rates. Verify live exchange rates before using currency conversions commercially. Replace the map with the verified property location and update email, social links, prices, legal details, SEO metadata and structured data.

## Assets and dependencies

Fonts, photos, video and animation libraries load from external providers (Google Fonts, Unsplash, Pexels and jsDelivr). An internet connection is needed for those assets. The Three.js effect is optional and is skipped on smaller screens or when reduced motion is enabled; the regular website remains available without WebGL.

Before commercial use, confirm that externally hosted media is licensed for the intended usage and retain attribution where required.
