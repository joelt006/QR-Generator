# Quick QR Code Generator

A free, instant QR code generator that runs **entirely in your browser**. Paste a
link, Wi-Fi password, or contact card and download the QR code as PNG or SVG.
No server, no tracking, nothing uploaded.

## Features

- **Link / Text** — turn any URL or text into a QR code
- **Wi-Fi** — share your network so people can join by scanning (SSID, password, security type)
- **Contact** — generate a vCard QR for name, phone, email, and organization
- Custom **colors** and **size** (256 / 512 / 1024 px)
- Download as **PNG** or crisp **SVG**
- Works **offline** — the QR library is vendored locally

## Run locally

Just open `index.html` in a browser. (Opening via a local server also works:
`python -m http.server` then visit http://localhost:8000.)

## Host free on GitHub Pages

1. Create a new GitHub repository and push these files to it:
   ```bash
   git init
   git add .
   git commit -m "Quick QR Code Generator"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select branch **main** and folder **/ (root)**, then **Save**.
5. After a minute your site is live at `https://<you>.github.io/<repo>/`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `styles.css` | Styling |
| `app.js` | App logic (builds payloads, renders SVG, handles downloads) |
| `qrcode.min.js` | Vendored [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library (MIT) |

## License

Your app code is yours to use freely. The bundled `qrcode-generator` library is
MIT licensed by Kazuhiko Arase.
