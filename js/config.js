// ---------------------------------------------------------------------------
// Site configuration. Edit these two values after you fork/create the repo.
// ---------------------------------------------------------------------------
const SITE_CONFIG = {
  githubOwner: "pulkitmehndiratta",   // your GitHub username
  githubRepo: "pulkitmehndiratta.github.io", // this repo's name
  branch: "main",                      // change to "master" if that's your default branch
  postsPath: "data/posts.json",        // where posts are stored inside the repo
  linkedinUrl: "https://www.linkedin.com/in/pulkit-mehndiratta-59335445/",
  scholarUrl: "https://scholar.google.com/citations?user=LoUdggcAAAAJ&hl=en",
  githubProfileUrl: "https://github.com/pulkitmehndiratta",
  orcidUrl: "https://orcid.org/0000-0001-7634-6575",
  researchgateUrl: "https://www.researchgate.net/profile/Pulkit_Mehndiratta",
};

// Raw file URL used to READ posts (works instantly, no auth, no Pages rebuild wait)
function rawPostsUrl() {
  return `https://raw.githubusercontent.com/${SITE_CONFIG.githubOwner}/${SITE_CONFIG.githubRepo}/${SITE_CONFIG.branch}/${SITE_CONFIG.postsPath}?t=${Date.now()}`;
}

// Contents API URL used to WRITE posts (needs an authenticated request)
function contentsApiUrl() {
  return `https://api.github.com/repos/${SITE_CONFIG.githubOwner}/${SITE_CONFIG.githubRepo}/contents/${SITE_CONFIG.postsPath}`;
}
