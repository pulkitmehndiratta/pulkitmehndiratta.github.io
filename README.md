# pulkitmehndiratta.github.io

A static portfolio site with an admin panel for publishing blog posts and
LinkedIn-post cards, no separate backend required.

## 1. Deploy

1. Create a GitHub repo named exactly **`pulkitmehndiratta.github.io`** under your account.
2. Push all these files to the `main` branch (root of the repo, not a subfolder).
3. In the repo, go to **Settings → Pages** and confirm the source is the `main` branch, root.
4. Your site will be live at `https://pulkitmehndiratta.github.io` within a minute or two.
5. Add your photo at `assets/profile.jpg` (square, ~800×800px works well) and commit it —
   it wasn't included automatically in this build.

## 2. Configure

Open `js/config.js` and double check:
- `githubOwner` / `githubRepo` match your repo.
- `branch` matches your default branch (`main` unless you changed it).
- The LinkedIn / Scholar / GitHub / ORCID URLs are correct.

## 3. How the admin panel works (and its limits)

GitHub Pages only serves static files — there's no server to run a real login
system or database. So `admin.html` works like a lightweight Git-based CMS:

- You sign in with a **GitHub Personal Access Token** instead of a password.
- Publishing a post commits an updated `data/posts.json` straight to your repo
  using GitHub's API.
- The public site (`index.html`) reads that same file from
  `raw.githubusercontent.com`, so new posts appear within seconds — no full
  site rebuild needed.

**Create the token safely:**
GitHub → Settings → Developer settings → Personal access tokens →
**Fine-grained tokens** → New token →
- Repository access: **only this repository**
- Permissions: **Contents → Read and write**
- Set a short expiration (e.g. 90 days) and regenerate when it lapses.

This token is a real credential — anyone who has it can edit this repo. It's
only kept in the browser tab's memory (`sessionStorage`) for this session, and
is never written to any file. Don't paste it anywhere else, and don't commit
it to the repo. Because of this, treat `admin.html` as "admin-only by
obscurity + token possession," not as a hardened login system — anyone who
finds the page can attempt to sign in, they just won't get anywhere without a
valid token in hand.

## 4. About the LinkedIn post feature

LinkedIn doesn't offer a public, keyless API for pulling a post's image and
text automatically, and their official embed is a fixed iframe that LinkedIn
controls the internal layout of — it can't be reordered to put the image
above the text.

So the admin panel takes a more reliable approach: when you add a
**LinkedIn post**, you paste the post's link and add its image and a short
excerpt yourself. The site then renders that as its own card — image on top,
excerpt below, with a "View original post on LinkedIn" link — matching the
same layout as regular blog posts. If you also want LinkedIn's native embed
visible underneath, open the post's **⋯ menu → Embed this post** on
LinkedIn, copy the `<iframe>` code it gives you, and paste it into the
optional "LinkedIn embed code" field.

## 5. File structure

```
index.html          Public portfolio page
admin.html           Admin panel (token login, publish/delete posts)
css/style.css         All styling
js/config.js          Repo + profile link config — edit this after setup
js/main.js            Renders the public post feed
js/admin.js           Publishing/deleting logic (GitHub API)
data/posts.json       Post data — edited via the admin panel, or by hand
assets/profile.jpg    Your photo (add this yourself)
```
