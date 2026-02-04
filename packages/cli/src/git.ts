import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SourceInfo } from './types';
import { getCloneUrl } from './source-parser';

const CACHE_DIR = path.join(os.tmpdir(), 'solana-skills-cache');

export async function cloneRepository(source: SourceInfo): Promise<string> {
  // Create cache directory if it doesn't exist
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const repoName = `${source.owner}-${source.repo}`;
  const targetPath = path.join(CACHE_DIR, repoName);

  // If already exists, pull latest
  if (fs.existsSync(targetPath)) {
    try {
      const git: SimpleGit = simpleGit(targetPath);
      await git.fetch();
      await git.checkout(source.branch || 'main');
      await git.pull();
      return targetPath;
    } catch (error) {
      // If pull fails, remove and re-clone
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  }

  const cloneUrl = getCloneUrl(source);
  const git: SimpleGit = simpleGit();
  
  await git.clone(cloneUrl, targetPath, {
    '--branch': source.branch || 'main',
    '--depth': '1'
  });

  return targetPath;
}

export async function getLatestCommitHash(repoPath: string): Promise<string> {
  const git: SimpleGit = simpleGit(repoPath);
  const log = await git.log({ maxCount: 1 });
  return log.latest?.hash || '';
}

export function clearCache(): void {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
  }
}
