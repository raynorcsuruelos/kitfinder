My Personal Tool Kit — PWA
Files: index.html, manifest.webmanifest, sw.js, icons/
1. Upload ALL files, keeping the folder layout, to any HTTPS static host
   (GitHub Pages, Netlify, Cloudflare Pages, Vercel). PWAs will not install from file:// or plain http.
2. Open the site once while online, then use the browser's Install / Add to Home Screen.
   First online visit also caches the fonts and libraries (ARP Calc, FAQs) for offline use.
3. After editing index.html, change VERSION in sw.js so installed copies update.
Note: data lives in each browser's local storage; use the in-app Admin backup to move it between devices.
