# Friend Hub 🎲

A cozy, character-select-style introduction site for your Discord server. Everyone can add their own card — no sign-up needed. You (the owner) handle edits/deletes yourself from the Supabase dashboard, so nobody can mess with someone else's card.

No PHP/MySQL server needed — this is a static site (plain HTML/CSS/JS) backed by **Supabase** (free tier), which is why it can live on GitHub Pages and still remember data between visitors.

## What's in here

```
index.html          → roster / character-select grid
profile.html         → one member's full profile page
add.html              → "add your card" form
css/style.css         → all styling
js/                       → page logic + Supabase client
supabase-schema.sql  → run this once in Supabase to create the database
```

## 1. Create your Supabase project (~3 minutes)

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**.
2. Once it's created, open the **SQL Editor** (left sidebar) → **New query**.
3. Paste in the entire contents of `supabase-schema.sql` from this repo and click **Run**.
   This creates the `cards` table and a public `avatars` storage bucket, with the rules already set so:
   - anyone can **view** all cards ✅
   - anyone can **add** a new card ✅
   - **nobody** can edit or delete a card through the website — only you, from the Table Editor ✅

## 2. Connect the site to your project

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/supabase-config.js` and paste them in:

```js
const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

That's it — the anon key is meant to be public, it can only do what the schema's rules allow (view + add, nothing else).

## 3. Try it locally

Just open `index.html` in a browser, or run a tiny local server so relative paths behave:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## 4. Push to GitHub and get a shareable link

```bash
git init
git add .
git commit -m "Friend hub site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then turn on GitHub Pages:
1. On GitHub, open your repo → **Settings → Pages**.
2. Under **Source**, pick the `main` branch, folder `/ (root)` → **Save**.
3. After a minute, your site is live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

Share that link in the server. 🎉

## Editing or removing a card

Since members can only *add* cards (not edit them), when someone wants a change:
1. Open your Supabase project → **Table Editor → cards**.
2. Find their row, edit the fields directly (or delete the row to remove them).
3. To swap a profile picture, upload the new image in **Storage → avatars**, copy its public URL, and paste it into that row's `avatar_url` column.

No SQL knowledge needed for this — it's a normal spreadsheet-style table.

## Customizing

- **Colors/fonts**: all in `css/style.css` under the `:root` block at the top.
- **Stat labels** (activeness / gaming / gayness): search each file for those words if you want to rename or add a 4th stat — you'd add a matching column in Supabase too (`alter table cards add column stat_whatever int default 50;`).
- **Site name**: change "Friend Hub" in the `<nav class="brand">` block of each HTML file.
