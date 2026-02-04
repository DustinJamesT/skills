import { SourceInfo } from './types';

const DEFAULT_REPO = 'sendaifun/skills';

export function parseSource(source?: string): SourceInfo {
  // Default to sendaifun/skills if no source provided
  if (!source) {
    return {
      type: 'github',
      owner: 'sendaifun',
      repo: 'skills',
      branch: 'main'
    };
  }

  // Local path
  if (source.startsWith('./') || source.startsWith('/') || source.startsWith('..')) {
    return {
      type: 'local',
      path: source
    };
  }

  // Full GitHub URL
  const githubUrlMatch = source.match(
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+)(?:\/(.+))?)?/
  );
  if (githubUrlMatch) {
    return {
      type: 'github',
      owner: githubUrlMatch[1],
      repo: githubUrlMatch[2].replace(/\.git$/, ''),
      branch: githubUrlMatch[3] || 'main',
      path: githubUrlMatch[4]
    };
  }

  // GitLab URL
  const gitlabUrlMatch = source.match(
    /^https?:\/\/gitlab\.com\/([^\/]+)\/([^\/]+)/
  );
  if (gitlabUrlMatch) {
    return {
      type: 'gitlab',
      owner: gitlabUrlMatch[1],
      repo: gitlabUrlMatch[2].replace(/\.git$/, ''),
      branch: 'main'
    };
  }

  // Git URL (git@github.com:owner/repo.git)
  const gitUrlMatch = source.match(
    /^git@([^:]+):([^\/]+)\/([^\.]+)(?:\.git)?$/
  );
  if (gitUrlMatch) {
    return {
      type: 'git',
      url: source,
      owner: gitUrlMatch[2],
      repo: gitUrlMatch[3]
    };
  }

  // GitHub shorthand with skill specifier (owner/repo@skill-name)
  const shorthandWithSkillMatch = source.match(/^([^\/]+)\/([^@]+)@(.+)$/);
  if (shorthandWithSkillMatch) {
    return {
      type: 'github',
      owner: shorthandWithSkillMatch[1],
      repo: shorthandWithSkillMatch[2],
      branch: 'main',
      path: `skills/${shorthandWithSkillMatch[3]}`
    };
  }

  // GitHub shorthand (owner/repo)
  const shorthandMatch = source.match(/^([^\/]+)\/([^\/]+)$/);
  if (shorthandMatch) {
    return {
      type: 'github',
      owner: shorthandMatch[1],
      repo: shorthandMatch[2],
      branch: 'main'
    };
  }

  // Just a skill name - use default repo
  return {
    type: 'github',
    owner: 'sendaifun',
    repo: 'skills',
    branch: 'main',
    path: `skills/${source}`
  };
}

export function getCloneUrl(info: SourceInfo): string {
  if (info.type === 'local') {
    throw new Error('Cannot clone local path');
  }
  if (info.type === 'git' && info.url) {
    return info.url;
  }
  if (info.type === 'github') {
    return `https://github.com/${info.owner}/${info.repo}.git`;
  }
  if (info.type === 'gitlab') {
    return `https://gitlab.com/${info.owner}/${info.repo}.git`;
  }
  throw new Error('Unknown source type');
}

export function getDisplayName(info: SourceInfo): string {
  if (info.type === 'local') {
    return info.path || 'local';
  }
  return `${info.owner}/${info.repo}`;
}
