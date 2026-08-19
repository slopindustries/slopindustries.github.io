const listNode = document.getElementById("repo-list");
const updatedNode = document.getElementById("last-updated");

const formatDate = (raw) => {
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
};

const renderRepositories = (payload) => {
  const repos = Array.isArray(payload.repositories) ? payload.repositories : [];
  const generatedAt = payload.generated_at || "";
  updatedNode.textContent = `마지막 갱신: ${formatDate(generatedAt)}`;

  if (repos.length === 0) {
    listNode.innerHTML = `<li class="empty">표시할 공개 저장소가 없습니다.</li>`;
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
        <p class="repo-description">${repo.description || "설명이 없습니다."}</p>
        <p class="repo-meta">★ ${repo.stars} · 마지막 업데이트 ${formatDate(repo.updated_at)}</p>
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
    listNode.innerHTML = `<li class="empty">저장소 정보를 불러오지 못했습니다.</li>`;
    updatedNode.textContent = "마지막 갱신: 확인 불가";
  });
