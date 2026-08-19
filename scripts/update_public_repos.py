from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

ORG_NAME = "slopindustries"
API_URL = f"https://api.github.com/orgs/{ORG_NAME}/repos?type=public&per_page=100"
OUTPUT_FILE = Path(__file__).resolve().parents[1] / "data" / "repos.json"


def get_next_url(link_header: str | None) -> str | None:
    if not link_header:
        return None

    links = [part.strip() for part in link_header.split(",")]
    for link in links:
        if 'rel="next"' in link:
            raw_url = link.split(";")[0].strip()
            return raw_url[1:-1]
    return None


def normalize_repo(repo: dict) -> dict:
    return {
        "name": repo.get("name", ""),
        "description": repo.get("description") or "",
        "url": repo.get("html_url", ""),
        "language": repo.get("language") or "",
        "stars": int(repo.get("stargazers_count", 0)),
        "updated_at": repo.get("updated_at", ""),
    }


def fetch_repositories() -> list[dict]:
    token = os.getenv("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "slopindustries-repo-page-bot",
    }
    if token:
        headers["Authorization"] = "Bearer " + token

    repos: list[dict] = []
    next_url: str | None = API_URL

    while next_url:
        request = Request(next_url, headers=headers)
        with urlopen(request, timeout=30) as response:
            page_data = json.loads(response.read().decode("utf-8"))
            repos.extend(normalize_repo(item) for item in page_data)
            next_url = get_next_url(response.headers.get("Link"))

    repos.sort(key=lambda repo: repo["name"].lower())
    return repos


def write_repositories(repos: list[dict]) -> None:
    payload = {
        "org": ORG_NAME,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(repos),
        "repositories": repos,
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    try:
        repositories = fetch_repositories()
    except HTTPError as error:
        raise SystemExit(f"GitHub API request failed: {error.code} {error.reason}") from error

    write_repositories(repositories)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
