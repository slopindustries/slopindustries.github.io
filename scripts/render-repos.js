const listNode = document.getElementById("repo-list");
const updatedNode = document.getElementById("last-updated");

const formatDate = (raw) => {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString("en-US", { timeZone: "Asia/Seoul" });
};

const renderRepositories = (payload) => {
  const repos = Array.isArray(payload.repositories) ? payload.repositories : [];
  const generatedAt = payload.generated_at || "";
  updatedNode.textContent = `Last updated: ${formatDate(generatedAt)}`;

  if (repos.length === 0) {
    listNode.innerHTML = `<li class="empty">No public repositories to display.</li>`;
    return;
  }

  const sortedRepos = [...repos].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  const maxStars = Math.max(...sortedRepos.map((repo) => repo.stars || 0), 1);

  listNode.innerHTML = sortedRepos
    .map(
      (repo) => `
      <li class="repo-item">
        <div class="repo-top">
          <a href="${repo.url}" target="_blank" rel="noreferrer noopener">${repo.name}</a>
          <span class="repo-stars">★ ${repo.stars || 0}</span>
        </div>
        <div class="repo-bar" aria-hidden="true">
          <span style="width: ${Math.max(8, Math.round(((repo.stars || 0) / maxStars) * 100))}%"></span>
        </div>
        <p class="repo-meta">${repo.language || "Unknown"} · Updated ${formatDate(repo.updated_at)}</p>
      </li>
    `,
    )
    .join("");
};

fetch("./data/repos.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch repository data");
    }
    return response.json();
  })
  .then((payload) => renderRepositories(payload))
  .catch(() => {
    listNode.innerHTML = `<li class="empty">Failed to load repository data.</li>`;
    updatedNode.textContent = "Last updated: Unavailable";
  });
