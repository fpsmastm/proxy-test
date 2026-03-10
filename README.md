# 🌐 Nova Browser

> A fully-featured web proxy browser that runs in your browser. Supports tab cloaking, about:blank hiding, Cloudflare Worker proxying, and panic keys. Designed to work on **school-managed Chromebooks**.

![Nova Browser](https://img.shields.io/badge/Nova-Browser-7c5cfc?style=for-the-badge)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)

---

## 📖 Table of Contents

- [What is Nova Browser?](#-what-is-nova-browser)
- [Features](#-features)
- [Deployment Guide](#-deployment-guide)
  - [Option A: Cloudflare Pages (No GitHub needed)](#option-a-cloudflare-pages-direct-upload--no-github-needed)
  - [Option B: GitHub + Cloudflare Pages (Auto-updates)](#option-b-github--cloudflare-pages-auto-updates)
- [Setting Up the Proxy Worker](#-setting-up-the-proxy-worker-required-for-unblocking)
- [Connecting Nova to Your Worker](#-connecting-nova-to-your-worker)
- [Using Nova Browser](#-using-nova-browser)
- [Staying Hidden (Stealth Tips)](#-staying-hidden-stealth-tips)
- [Troubleshooting](#-troubleshooting)
- [Custom Domain (Optional)](#-custom-domain-advanced)
- [FAQ](#-faq)

---

## 🌟 What is Nova Browser?

Nova Browser is a **web-based proxy browser** — a website that acts like a browser inside your browser. It lets you:

- Browse websites through a **Cloudflare Worker proxy** (bypasses school filters)
- **Cloak your tab** to look like Google Classroom, Drive, Docs, etc.
- **Hide in about:blank** so monitoring software can't see what you're doing
- Use a **panic key** to instantly switch to a safe page

It's built with React and deploys as a **static site** — no server needed for the frontend.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Auto-detects URLs vs. search queries. Supports Google, DuckDuckGo, Bing, Brave |
| 📑 **Tabs** | Open multiple tabs, switch between them, close them |
| ⭐ **Bookmarks** | Save and manage your favorite sites |
| 🕐 **History** | Full browsing history with timestamps |
| 🛡️ **Tab Cloak** | Disguise the tab as Google Classroom, Drive, Docs, Canvas, Khan Academy, Clever |
| 🚀 **about:blank Cloak** | Launch Nova inside an `about:blank` tab — invisible to extensions and history |
| 🚨 **Panic Key** | `Ctrl + backtick` instantly redirects to Google Classroom |
| ☁️ **Cloudflare Worker Proxy** | Routes traffic through your own proxy worker for full site unblocking |
| 🌐 **Multiple Proxy Modes** | Direct, AllOrigins, CodeTabs, or custom Cloudflare Worker |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+T` (new tab), `Ctrl+E` (address bar), `Ctrl+backtick` (panic) |
| 🎨 **Dark Theme** | Sleek purple-accented dark UI that looks professional |
| 💾 **Persistent Storage** | Bookmarks, history, and settings saved to localStorage |

---

## 🚀 Deployment Guide

You need to deploy **two things**:
1. **Nova Browser** (the website/frontend) → Cloudflare Pages
2. **Nova Proxy Worker** (the proxy backend) → Cloudflare Workers

Both are **free** on Cloudflare's free tier.

---

### Option A: Cloudflare Pages (Direct Upload — No GitHub needed)

This is the simplest method. You upload the built files directly.

#### Step 1: Build the project

If you're on a computer where you can run commands:

```bash
npm install
npm run build
```

This creates a `dist/` folder with the built site.

> **Don't have Node.js?** You can use an online IDE like [StackBlitz](https://stackblitz.com) or [CodeSandbox](https://codesandbox.io) to build it. Or ask a friend to build it and send you the `dist` folder.

#### Step 2: Create a Cloudflare account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with a **personal email** (not your school email!)
3. Verify your email

#### Step 3: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Create"**
4. Click the **"Pages"** tab
5. Click **"Upload assets"**
6. Give your project a name (e.g., `nova-browser` or something inconspicuous like `study-helper`)
7. **Drag and drop** the entire `dist/` folder contents
8. Click **"Deploy site"**

Your site will be live at: `https://your-project-name.pages.dev`

> 💡 **Tip:** Name it something boring like `study-notes` or `class-resources` so it doesn't attract attention.

---

### Option B: GitHub + Cloudflare Pages (Auto-updates)

This method uses GitHub to host the code and Cloudflare Pages to auto-deploy it.

#### Step 1: Create a GitHub account (if needed)

1. Go to [https://github.com/signup](https://github.com/signup)
2. Use a **personal email** (not school email)
3. Create your account

#### Step 2: Create a new repository

1. Click the **"+"** button → **"New repository"**
2. Name it something like `study-tools` (keep it boring)
3. Set it to **Private** (important!)
4. Click **"Create repository"**

#### Step 3: Upload the code

**Option 1: Upload via GitHub web interface**
1. On your repo page, click **"uploading an existing file"**
2. Drag and drop ALL the project files
3. Click **"Commit changes"**

**Option 2: Use Git (if available)**
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

#### Step 4: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Workers & Pages"** → **"Create"**
3. Click the **"Pages"** tab
4. Click **"Connect to Git"**
5. Authorize Cloudflare to access your GitHub
6. Select your repository
7. Set the build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
8. Click **"Save and Deploy"**

Now every time you push changes to GitHub, Cloudflare will automatically rebuild and deploy!

Your site will be live at: `https://your-project-name.pages.dev`

---

## ☁️ Setting Up the Proxy Worker (REQUIRED for unblocking)

This is the **most important part**. Without the worker, Nova can only load sites that allow iframe embedding (most sites don't).

#### Step 1: Go to Cloudflare Workers

1. In [Cloudflare Dashboard](https://dash.cloudflare.com), click **"Workers & Pages"**
2. Click **"Create"**
3. Click **"Create Worker"**
4. Name it something like `study-api` or `proxy-worker`
5. Click **"Deploy"** (deploys the default Hello World worker)

#### Step 2: Edit the Worker code

1. After deploying, click **"Edit code"**
2. **Delete everything** in the editor
3. **Copy and paste** the entire contents of the `worker/proxy-worker.js` file from this project
4. Click **"Deploy"**

#### Step 3: Test your worker

Visit your worker URL: `https://your-worker-name.workers.dev`

You should see the Nova Proxy Worker landing page. Try clicking the test links!

Test with a URL: `https://your-worker-name.workers.dev/?url=https://example.com`

If you see example.com's content — it works! 🎉

---

## 🔗 Connecting Nova to Your Worker

1. Open Nova Browser in your browser
2. Click the **⚙️ Settings** icon (gear icon, far right of address bar)
3. Under **Proxy Mode**, select **"☁️ Cloudflare Worker (Best)"**
4. Under **Cloudflare Worker URL**, enter:
   ```
   https://your-worker-name.workers.dev/?url={url}
   ```
   (Replace `your-worker-name` with your actual worker subdomain)
5. Close settings
6. Try navigating to a website — it should load through your proxy!

---

## 🖥️ Using Nova Browser

### Browsing
- Type a **URL** in the address bar (e.g., `youtube.com`) and press Enter
- Type a **search query** (e.g., `cat videos`) and press Enter to search
- Use the ◀ ▶ buttons to go back/forward
- Click 🏠 to go back to the new tab page
- Click ⟳ to refresh

### Tabs
- Click **+** to open a new tab
- Click a tab to switch to it
- Click the **X** on a tab to close it
- `Ctrl + T` — new tab

### Bookmarks
- Click the **⭐** icon to bookmark the current page
- Click the **📖** icon to view all bookmarks
- Click a bookmark to navigate to it

### History
- Click the **🕐** icon to view browsing history
- Click any entry to revisit it
- Click the trash icon to clear all history

---

## 🕵️ Staying Hidden (Stealth Tips)

### 1. Use the about:blank Cloak (BEST method)
1. Open Settings → scroll to **"about:blank Cloak"**
2. Click **"Launch in about:blank"**
3. A new tab opens with the URL showing `about:blank`
4. **Close the original Nova tab**
5. The about:blank tab is invisible to:
   - Browser history
   - Most monitoring extensions (like GoGuardian)
   - URL-based filters

### 2. Enable Tab Cloaking
1. Open Settings → **Tab Cloak** → toggle it ON
2. Choose a preset (Classroom, Drive, Docs, Canvas, Khan Academy, Clever)
3. The tab's title and favicon will change to match
4. To a teacher walking by, it looks like you're on Google Classroom

### 3. Use the Panic Key
- Press **`Ctrl + `` `** (backtick, the key above Tab) at any time
- Instantly redirects the entire page to Google Classroom
- Everything is gone — no trace left

### 4. Name your deployments wisely
- Name your Cloudflare Pages project something boring: `study-notes`, `class-resources`, `homework-helper`
- Name your Worker something innocent: `study-api`, `class-tools`
- The URLs will look like: `study-notes.pages.dev` — nobody will suspect a thing

### 5. Clear your data
- Settings → **"Clear All Data"** button (red, at the bottom)
- Or just close the about:blank tab — nothing is saved to browser history

---

## 🔧 Troubleshooting

### "The site won't load / shows a blank page"
- Make sure you've set up the **Cloudflare Worker** and connected it in Settings
- Try switching proxy modes (Settings → Proxy Mode)
- Some sites (like Google, Netflix) have very strict anti-proxy measures and may not work

### "I can see the site but it looks broken"
- CSS and images may not load correctly through the proxy for some complex sites
- Try refreshing or loading a simpler version of the site

### "My worker URL got blocked"
- Your school may have blocked `workers.dev`
- **Solution:** Set up a custom domain (see below)
- Or try renaming your worker to something new

### "pages.dev got blocked"
- Same as above — set up a custom domain
- You can get a free domain from [Freenom](https://www.freenom.com) or a cheap one from [Namecheap](https://www.namecheap.com) ($1-2/year for .xyz domains)

### "GoGuardian/Securly can see what I'm doing"
- Use the **about:blank cloak** — this is the #1 defense
- The monitoring extension sees `about:blank` as the URL, which is not flagged
- Combined with tab cloaking, you're virtually invisible

### "I can't install Node.js to build the project"
- Use **Option A** (direct upload) — ask a friend with a computer to build it
- Or use [StackBlitz](https://stackblitz.com) — it runs Node.js in the browser:
  1. Go to stackblitz.com
  2. Create a new Node.js project
  3. Upload the project files
  4. Run `npm run build` in the terminal
  5. Download the `dist` folder
  6. Upload to Cloudflare Pages

---

## 🌍 Custom Domain (Advanced)

If `workers.dev` or `pages.dev` gets blocked, you can use your own domain:

### For Cloudflare Pages:
1. Buy a cheap domain (`.xyz` domains are $1-2/year on Namecheap)
2. In Cloudflare Dashboard → your Pages project → **Custom Domains**
3. Add your domain
4. Update your domain's nameservers to Cloudflare's (they'll tell you which ones)

### For Cloudflare Workers:
1. In Cloudflare Dashboard → your domain → **DNS**
2. Add a CNAME record pointing to your worker
3. Or go to your Worker → **Settings** → **Triggers** → **Custom Domains** → add your domain

Now your proxy is at `https://yourdomain.xyz` — way harder to block!

---

## ❓ FAQ

**Q: Is this free?**
A: Yes! Cloudflare's free tier includes 100,000 worker requests/day and unlimited Pages sites.

**Q: Will this work on my school Chromebook?**
A: Yes, as long as your school hasn't blocked the specific domain you deploy to. Use a custom domain if they block `pages.dev` or `workers.dev`.

**Q: Can my school see that I'm using this?**
A: If you use the **about:blank cloak**, monitoring extensions will only see `about:blank` — which is not suspicious. Without the cloak, they can see the `pages.dev` URL.

**Q: Will YouTube/Discord/TikTok work?**
A: Through the Cloudflare Worker proxy, many sites will load. Very complex sites (heavy JavaScript apps) may have issues. YouTube works for basic video viewing. Discord's web app is very complex and may not work perfectly.

**Q: Can I use this on my phone?**
A: Yes! Just visit your `pages.dev` URL on your phone browser. The UI is responsive.

**Q: What if my worker runs out of free requests?**
A: Cloudflare gives you 100,000 requests per day on the free tier. That's a LOT. You'd have to browse very heavily to hit that limit.

**Q: I don't have a GitHub account anymore. Can I still use this?**
A: Yes! Use **Option A** (direct upload to Cloudflare Pages). No GitHub needed. Or create a new GitHub account with a personal email.

**Q: How do I update Nova Browser?**
A: 
- **Option A users:** Rebuild and re-upload the `dist` folder to Cloudflare Pages
- **Option B users:** Push changes to GitHub and Cloudflare auto-deploys

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + `` ` | 🚨 **PANIC** — Instantly go to Google Classroom |
| `Ctrl + T` | Open new tab |
| `Ctrl + E` | Focus address bar |
| `Enter` | Navigate / Search |

---

## 🏗️ Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Proxy:** Cloudflare Workers
- **Hosting:** Cloudflare Pages
- **Icons:** Lucide React

---

## ⚠️ Disclaimer

This tool is provided for educational purposes. Use it responsibly. Be aware of your school's acceptable use policies. The developers are not responsible for any consequences of using this software.

---

**Made with 💜 by Nova Browser**
