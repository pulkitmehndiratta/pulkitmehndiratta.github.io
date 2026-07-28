document.getElementById("repo-name-display").textContent =
  `${SITE_CONFIG.githubOwner}/${SITE_CONFIG.githubRepo}`;

let token = sessionStorage.getItem("gh_token") || "";
let currentType = "blog";

const loginView = document.getElementById("login-view");
const adminView = document.getElementById("admin-view");

function ghHeaders(){
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
  };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
document.getElementById("login-btn").addEventListener("click", async () => {
  const val = document.getElementById("token-input").value.trim();
  const statusEl = document.getElementById("login-status");
  if(!val){ statusEl.textContent = "Paste a token first."; statusEl.className="status-msg err"; return; }

  statusEl.textContent = "Checking access…";
  statusEl.className = "status-msg";
  token = val;

  try{
    const res = await fetch(contentsApiUrl(), { headers: ghHeaders() });
    if(res.status === 401){ throw new Error("Token was rejected — check it's valid and hasn't expired."); }
    if(res.status === 404){ throw new Error(`Couldn't find ${SITE_CONFIG.postsPath} in ${SITE_CONFIG.githubOwner}/${SITE_CONFIG.githubRepo}. Check js/config.js matches your repo, and that the file exists on the "${SITE_CONFIG.branch}" branch.`); }
    if(res.status === 403){ throw new Error("Token doesn't have write access to this repo's contents. Recreate it with Contents: Read and write permission."); }
    if(!res.ok){ throw new Error(`GitHub returned status ${res.status}.`); }

    sessionStorage.setItem("gh_token", token);
    statusEl.textContent = "";
    showAdmin();
  }catch(err){
    statusEl.textContent = err.message;
    statusEl.className = "status-msg err";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("gh_token");
  token = "";
  adminView.style.display = "none";
  loginView.style.display = "block";
});

function showAdmin(){
  loginView.style.display = "none";
  adminView.style.display = "block";
  loadExistingPosts();
}

if(token){ showAdmin(); }

// ---------------------------------------------------------------------------
// Post type toggle (blog vs linkedin)
// ---------------------------------------------------------------------------
document.querySelectorAll(".type-toggle button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-toggle button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    const isLinkedin = currentType === "linkedin";
    document.getElementById("linkedin-url-field").style.display = isLinkedin ? "block" : "none";
    document.getElementById("embed-field").style.display = isLinkedin ? "block" : "none";
    document.getElementById("blog-link-field").style.display = isLinkedin ? "none" : "block";
  });
});

// ---------------------------------------------------------------------------
// Fetch + read current posts.json (with its sha, needed to commit an update)
// ---------------------------------------------------------------------------
async function fetchPostsFile(){
  const res = await fetch(contentsApiUrl(), { headers: ghHeaders() });
  if(!res.ok) throw new Error(`Couldn't read ${SITE_CONFIG.postsPath} (status ${res.status}).`);
  const data = await res.json();
  const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
  return { posts: content, sha: data.sha };
}

async function writePostsFile(posts, sha, message){
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2)))),
    sha,
    branch: SITE_CONFIG.branch,
  };
  const res = await fetch(contentsApiUrl(), {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if(!res.ok){
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `GitHub returned status ${res.status}.`);
  }
}

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------
document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const publishBtn = document.getElementById("publish-btn");
  const statusEl = document.getElementById("publish-status");
  publishBtn.disabled = true;
  statusEl.textContent = "Publishing…";
  statusEl.className = "status-msg";

  try{
    const title = document.getElementById("f-title").value.trim();
    const image = document.getElementById("f-image").value.trim();
    const content = document.getElementById("f-content").value.trim();
    const link = currentType === "linkedin"
      ? document.getElementById("f-linkurl").value.trim()
      : document.getElementById("f-bloglink").value.trim();
    const embedHtml = currentType === "linkedin"
      ? document.getElementById("f-embed").value.trim()
      : "";

    const newPost = {
      id: `${Date.now()}`,
      type: currentType,
      title,
      date: new Date().toISOString().slice(0,10),
      image,
      excerpt: content,
      content,
      link,
      embedHtml,
    };

    const { posts, sha } = await fetchPostsFile();
    posts.push(newPost);
    await writePostsFile(posts, sha, `Publish post: ${title}`);

    statusEl.textContent = "Published! It'll appear on the site within a few seconds.";
    statusEl.className = "status-msg ok";
    document.getElementById("post-form").reset();
    loadExistingPosts();
  }catch(err){
    statusEl.textContent = `Couldn't publish: ${err.message}`;
    statusEl.className = "status-msg err";
  }finally{
    publishBtn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
// List + delete existing posts
// ---------------------------------------------------------------------------
async function loadExistingPosts(){
  const list = document.getElementById("existing-posts");
  list.innerHTML = `<p class="field-hint">Loading…</p>`;
  try{
    const { posts } = await fetchPostsFile();
    if(posts.length === 0){
      list.innerHTML = `<p class="field-hint">No posts yet.</p>`;
      return;
    }
    list.innerHTML = posts
      .slice()
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .map(p => `
        <div class="existing-post" data-id="${p.id}">
          <div>
            <div class="existing-post-title">${escapeHtml(p.title)}</div>
            <div class="existing-post-meta">${p.type} · ${p.date}</div>
          </div>
          <button class="icon-btn" data-delete="${p.id}">Delete</button>
        </div>
      `).join("");

    list.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => deletePost(btn.dataset.delete));
    });
  }catch(err){
    list.innerHTML = `<p class="field-hint">Couldn't load posts: ${err.message}</p>`;
  }
}

async function deletePost(id){
  if(!confirm("Delete this post? This can't be undone.")) return;
  try{
    const { posts, sha } = await fetchPostsFile();
    const filtered = posts.filter(p => p.id !== id);
    await writePostsFile(filtered, sha, `Delete post ${id}`);
    loadExistingPosts();
  }catch(err){
    alert(`Couldn't delete: ${err.message}`);
  }
}

function escapeHtml(str){
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
