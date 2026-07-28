document.getElementById("year").textContent = new Date().getFullYear();

// Wire up every profile link (there are a few duplicated placements: hero, pubs, footer)
function setLinks(id, url){
  document.querySelectorAll(`#${id}`).forEach(el => el.href = url);
}
setLinks("linkedin-link", SITE_CONFIG.linkedinUrl);
setLinks("linkedin-link-2", SITE_CONFIG.linkedinUrl);
setLinks("scholar-link", SITE_CONFIG.scholarUrl);
setLinks("scholar-link-2", SITE_CONFIG.scholarUrl);
setLinks("scholar-link-3", SITE_CONFIG.scholarUrl);
setLinks("github-link", SITE_CONFIG.githubProfileUrl);
setLinks("github-link-2", SITE_CONFIG.githubProfileUrl);
setLinks("orcid-link", SITE_CONFIG.orcidUrl);

// ---------------------------------------------------------------------------
// Blog / LinkedIn post feed
// Reads data/posts.json straight from GitHub's raw CDN so updates published
// from the admin panel show up immediately, without waiting on a full
// GitHub Pages rebuild.
// ---------------------------------------------------------------------------
async function loadPosts(){
  const feed = document.getElementById("posts-feed");
  try{
    const res = await fetch(rawPostsUrl());
    if(!res.ok) throw new Error(`Could not load posts (status ${res.status})`);
    const posts = await res.json();

    if(!Array.isArray(posts) || posts.length === 0){
      feed.innerHTML = `<p class="post-empty">No posts yet — check back soon.</p>`;
      return;
    }

    // newest first
    posts.sort((a,b) => new Date(b.date) - new Date(a.date));
    feed.innerHTML = posts.map(renderPost).join("");
  }catch(err){
    feed.innerHTML = `<p class="post-error">Couldn't load posts right now (${err.message}). If you just published one, GitHub's CDN can take a minute to catch up — refresh shortly.</p>`;
  }
}

function renderPost(post){
  const dateStr = post.date ? new Date(post.date).toLocaleDateString(undefined, {year:"numeric", month:"long", day:"numeric"}) : "";
  const kindLabel = post.type === "linkedin" ? "LinkedIn post" : "Blog post";

  // Images always render first, per the brief, followed by the short text.
  const imageHtml = post.image
    ? `<img class="post-image" src="${escapeAttr(post.image)}" alt="" onerror="this.remove()">`
    : "";

  const linkHtml = post.link
    ? `<a class="post-link" href="${escapeAttr(post.link)}" target="_blank" rel="noopener">${post.type === "linkedin" ? "View original post on LinkedIn →" : "Read more →"}</a>`
    : "";

  // Optional raw LinkedIn embed code, shown below the summary card if provided.
  const embedHtml = post.embedHtml
    ? `<div class="post-embed">${post.embedHtml}</div>`
    : "";

  return `
    <article class="post-card">
      ${imageHtml}
      <div class="post-body">
        <p class="post-meta">${kindLabel} · ${dateStr}</p>
        <h3 class="post-title">${escapeHtml(post.title || "")}</h3>
        <p class="post-excerpt">${escapeHtml(post.excerpt || post.content || "")}</p>
        ${linkHtml}
        ${embedHtml}
      </div>
    </article>
  `;
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escapeAttr(str){
  return String(str).replace(/"/g,"&quot;");
}

loadPosts();
