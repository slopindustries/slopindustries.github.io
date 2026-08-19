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

  listNode.innerHTML = repos
    .map(
      (repo) => `
      <li class="repo-item">
        <div class="repo-title">
          <a href="${repo.url}" target="_blank" rel="noreferrer noopener">${repo.name}</a>
          ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ""}
        </div>
        <p class="repo-description">${repo.description || "No description available."}</p>
        <p class="repo-meta">★ ${repo.stars} · Updated ${formatDate(repo.updated_at)}</p>
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
