# Deploying Minto to Cloudflare Pages

This guide walks you through deploying your polished, high-contrast, fully client-side splitwise-style trip calculator and settlement application (**Minto**) to **Cloudflare Pages**.

---

## ⚡ Quick Start: Zero-Config CLI Deploy

We have added a custom script to your `package.json` to make deployment incredibly easy with a single terminal command.

1. **Log in to your Cloudflare account** in your local command-line interface:
   ```bash
   npx wrangler login
   ```

2. **Deploy directly with one command**:
   ```bash
   npm run deploy
   ```

Wrangler will build your static assets, automatically read your `wrangler.toml` configuration, ask you to confirm your project, and deploy it to a live `.pages.dev` subdomain instantly!

---

## 🌐 Alternative: Git-Connected Deploy (Recommended)

Connecting your GitHub repository to Cloudflare Pages is the best long-term option, as it provides **automatic preview deployments for every branch** and **instant production deployments on main branch pushes**.

### Step 1: Push your project to GitHub
If you haven't already, initialize a repository and push your code to GitHub, GitLab, or Bitbucket.

### Step 2: Set up Cloudflare Pages Dashboard
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create** > **Pages** > **Connect to Git**.
3. Select your GitHub repository.

### Step 3: Configure Build Settings
Configure the build settings as follows:
- **Framework Preset**: `Vite` (or `None`)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Compatibility Date**: `2024-01-01` or later

Click **Save and Deploy**. Cloudflare will compile and host your app!

---

## ⚙️ How Cloudflare Configuration Works

Your project includes two key assets specifically designed for seamless Cloudflare integration:

### 1. `wrangler.toml` (Configuration)
Located at the root of your project:
```toml
name = "minto-trip-split"
pages_build_output_dir = "dist"
compatibility_date = "2024-01-01"
```
This tells Wrangler exactly where your compiled static files live (`dist`) and keeps your project parameters synchronized.

### 2. `/public/_redirects` (SPA Routing Support)
For Single Page Applications (SPAs), direct visits to sub-routes (e.g., refreshing `yoursite.com/profile`) can result in a 404 error if they are not explicitly configured. 
The `/public/_redirects` file is copied directly into your compiled `dist/` directory on build with the rule:
```text
/*    /index.html   200
```
This forces all navigation queries to route through `index.html` where React can mount routes correctly.

---

## 🛠️ Verifying Locally Before Deploy

Before deploying, you can run a local test to make sure everything builds correctly and check the compiled assets:

```bash
# Verify there are no type errors
npm run lint

# Build static assets locally
npm run build

# Preview the local build
npm run preview
```
