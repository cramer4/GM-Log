# GM Logbook

A campaign manager for tabletop RPG game masters. Runs entirely in the browser — no server, no accounts, no sync. Data is saved locally on each device.

Works on **Android**, **iOS**, **Windows**, **Mac**, and **Linux**. Friends can install it to their home screen like a native app.

---

## Sharing with Friends — GitHub Pages Setup

This takes about 10 minutes and gives everyone a permanent URL they can visit and install.

### Step 1 — Create a GitHub account

Go to [github.com](https://github.com) and sign up if you don't have one. Free.

### Step 2 — Create a new repository

1. Click the **+** in the top right → **New repository**
2. Name it `gm-logbook` (or anything you like)
3. Set it to **Public** ← required for free GitHub Pages
4. Click **Create repository**

### Step 3 — Upload the files

On the new repo page, click **uploading an existing file** (or drag files in).

Upload all of these files:
```
index.html
manifest.json
sw.js
icon-192.png
icon-512.png
```

Click **Commit changes**.

### Step 4 — Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Set branch to **main**, folder to **/ (root)**
4. Click **Save**

GitHub will show a green banner with your URL in about 60 seconds:
```
https://YOUR-USERNAME.github.io/gm-logbook/
```

### Step 5 — Share the link

Send that URL to your friends. That's it.

---

## Installing on a Phone

### Android (Chrome)
1. Open the URL in Chrome
2. Tap the **⋮** menu → **Add to Home screen**
3. Tap **Install**

### iOS (Safari)
1. Open the URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow)
3. Scroll down → **Add to Home Screen**
4. Tap **Add**

### Desktop (Chrome / Edge)
Look for the install icon (⊕) in the address bar, or go to the browser menu → **Install GM Logbook**.

---

## Important Notes

**Data is local.** Each person's campaign data lives on their own device — in their browser's localStorage. There is no shared cloud. If someone clears their browser data, their campaigns are gone. Use the Export feature to back up.

**Updates.** When you upload a new `index.html` to GitHub, everyone gets the update automatically on their next visit. If the app is already installed, they may need to close and reopen it once.

**Offline.** Once installed, the app works fully offline. The service worker caches everything it needs.

---

## Running Locally (Optional)

If you want to test before uploading, you need a local server (opening index.html directly won't work due to browser security rules):

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```
