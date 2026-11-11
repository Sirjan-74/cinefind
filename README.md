# 🎬 CineFind — "Where to Watch" Movie & Streaming Guide

CineFind is a modern, high-performance web platform that helps movie lovers discover where to stream, rent, or buy movies legally across Netflix, Amazon Prime Video, Disney+, Max, Paramount+, and Apple TV.

---

## 💰 Built-in Monetization Features

1. **Streaming Affiliate Referrals:**
   * Every movie card has direct "Stream Now" or "Rent" buttons.
   * When users click through to subscribe or rent a movie (e.g. Amazon Prime Video, Max, Paramount+), you earn an affiliate commission ($1.50 – $3.00 per signup or 4%–10% per rental).
   * Built-in `/api/track-click` tracks real-time clicks and estimated earnings in the **Earnings Dashboard**.

2. **Google AdSense / Sponsor Slots:**
   * Includes high-converting ad units: Top responsive leaderboard banner, in-feed native deal cards, and modal sponsor callouts.
   * Add your Google AdSense Publisher ID in Settings or directly in `public/index.html`.

3. **Email Newsletter Capture:**
   * Captures interested moviegoers for weekly release alerts, allowing you to build an email list to recommend new streaming deals and earn recurring commissions.

---

## 🚀 How to Run Locally

### Method 1: Start the Node.js Server (Recommended)
Open PowerShell or Terminal in this folder:
```bash
cd "C:\Users\SIRJAN NISHAD\.gemini\antigravity\scratch\cinefind"
node server.js
```
Then open your browser to: **`http://localhost:3000`**

### Method 2: Open Directly (Zero Server Required)
Simply double-click:
`C:\Users\SIRJAN NISHAD\.gemini\antigravity\scratch\cinefind\public\index.html`
in your Windows File Explorer! It works standalone in any browser with instant offline seed data.

---

## ⚙️ Configuration & Free TMDB API

1. Click the **⚙️ Settings** icon in the top right of the website.
2. Enter your:
   * **Google AdSense ID** (`ca-pub-...`)
   * **Amazon Associates Tag** (e.g., `cinefind-20`)
   * **TMDB API Key** (Free from [themoviedb.org](https://www.themoviedb.org/settings/api))

---

## 🌐 Free Deployment Guide

You can host this site for **$0/month**:
* **Vercel / Netlify:** Drag and drop the `public/` folder for instant global CDN hosting.
* **Render / Railway:** Connect your repository to run `server.js` with zero server management fees.

