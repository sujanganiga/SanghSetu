import { Octokit } from "@octokit/rest";
import type { Mandal } from "@/types/organization";

export const MANDAL_GITHUB_PATH = "data/mandal.json";

function getOctokit(): Octokit {
  const auth = process.env.GITHUB_TOKEN;
  if (!auth) {
    throw new Error("GITHUB_TOKEN is not configured");
  }
  return new Octokit({ auth });
}

function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!owner || !repo) {
    throw new Error("GITHUB_OWNER and GITHUB_REPO must be configured");
  }

  return { owner, repo, branch };
}

export function isGitHubStorageEnabled(): boolean {
  return !!(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO
  );
}

export async function getMandalFromGitHub(): Promise<Mandal> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getGitHubConfig();

  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: MANDAL_GITHUB_PATH,
    ref: branch,
  });

  if (Array.isArray(response.data) || !("content" in response.data)) {
    throw new Error("Invalid mandal.json response from GitHub");
  }

  const decoded = Buffer.from(response.data.content, "base64").toString("utf-8");
  return JSON.parse(decoded) as Mandal;
}

export async function saveMandalToGitHub(
  mandal: Mandal,
  message = "Update member data"
): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo, branch } = getGitHubConfig();

  const file = await octokit.repos.getContent({
    owner,
    repo,
    path: MANDAL_GITHUB_PATH,
    ref: branch,
  });

  if (Array.isArray(file.data) || !("sha" in file.data)) {
    throw new Error("Invalid mandal.json file on GitHub");
  }

  const content = Buffer.from(JSON.stringify(mandal, null, 2)).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: MANDAL_GITHUB_PATH,
    message,
    content,
    sha: file.data.sha,
    branch,
  });
}
