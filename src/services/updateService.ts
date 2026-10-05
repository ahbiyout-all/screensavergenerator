import { APP_VERSION, GITHUB_OWNER, GITHUB_REPO, GITHUB_REPO_URL, GITHUB_API_LATEST_RELEASE } from '../version';

export interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
  content_type: string;
}

export interface ReleaseInfo {
  tagName: string;
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  htmlUrl: string;
  downloadUrl: string;
  repoUrl: string;
  hasUpdate: boolean;
}

/**
 * Compare two semver strings: '1.0.9' vs '1.1.0'
 * Returns:
 *  1 if a > b
 * -1 if a < b
 *  0 if a === b
 */
export function compareSemver(a: string, b: string): number {
  const cleanA = a.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const cleanB = b.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);

  const length = Math.max(cleanA.length, cleanB.length);
  for (let i = 0; i < length; i++) {
    const numA = cleanA[i] || 0;
    const numB = cleanB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Fetch latest release from GitHub API
 */
export async function checkGitHubRelease(): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(GITHUB_API_LATEST_RELEASE, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // 404 means no release created yet, or 403 rate limit
      console.warn(`[UpdateChecker] GitHub API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const tagName = data.tag_name || '';
    const releaseVersion = tagName.replace(/^v/, '');

    // Look for Windows .exe asset in the release
    let downloadUrl = data.html_url;
    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const exeAsset = data.assets.find((asset: ReleaseAsset) => asset.name.toLowerCase().endsWith('.exe'));
      if (exeAsset) {
        downloadUrl = exeAsset.browser_download_url;
      }
    }

    const hasUpdate = compareSemver(releaseVersion, APP_VERSION) > 0;

    return {
      tagName,
      version: releaseVersion,
      name: data.name || tagName,
      body: data.body || '최신 기능 개선 및 안정성 향상이 포함되어 있습니다.',
      publishedAt: data.published_at || new Date().toISOString(),
      htmlUrl: data.html_url,
      downloadUrl,
      repoUrl: GITHUB_REPO_URL,
      hasUpdate,
    };
  } catch (error) {
    console.warn('[UpdateChecker] Network error while checking update:', error);
    return null;
  }
}
