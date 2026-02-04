import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { Skill, SkillMetadata } from './types';
import { glob } from 'glob';

// Directories where skills may be found
const SKILL_SEARCH_PATHS = [
  'skills',
  'skills/.curated',
  'skills/.experimental',
  'skills/.system',
  '.agents/skills',
  '.agent/skills',
  '.claude/skills',
  '.cline/skills',
  '.codex/skills',
  '.commandcode/skills',
  '.continue/skills',
  '.crush/skills',
  '.cursor/skills',
  '.factory/skills',
  '.gemini/skills',
  '.github/skills',
  '.goose/skills',
  '.kilocode/skills',
  '.kiro/skills',
  '.mcpjam/skills',
  '.opencode/skills',
  '.openhands/skills',
  '.pi/skills',
  '.qoder/skills',
  '.qwen/skills',
  '.roo/skills',
  '.trae/skills',
  '.windsurf/skills',
  '.zencoder/skills',
  '.neovate/skills'
];

export async function discoverSkills(repoPath: string, specificPath?: string): Promise<Skill[]> {
  const skills: Skill[] = [];

  // If specific path provided, only search there
  if (specificPath) {
    const fullPath = path.join(repoPath, specificPath);
    if (fs.existsSync(fullPath)) {
      const skill = await parseSkillFromDirectory(fullPath);
      if (skill) {
        skills.push(skill);
      }
    }
    return skills;
  }

  // Check if root directory has SKILL.md
  const rootSkillPath = path.join(repoPath, 'SKILL.md');
  if (fs.existsSync(rootSkillPath)) {
    const skill = await parseSkillFromDirectory(repoPath);
    if (skill) {
      skills.push(skill);
    }
  }

  // Search standard paths
  for (const searchPath of SKILL_SEARCH_PATHS) {
    const fullSearchPath = path.join(repoPath, searchPath);
    if (fs.existsSync(fullSearchPath)) {
      const found = await findSkillsInDirectory(fullSearchPath);
      skills.push(...found);
    }
  }

  // If no skills found, do recursive search
  if (skills.length === 0) {
    const pattern = path.join(repoPath, '**/SKILL.md');
    const files = await glob(pattern, { 
      ignore: ['**/node_modules/**', '**/.git/**'],
      dot: true
    });
    
    for (const file of files) {
      const skillDir = path.dirname(file);
      const skill = await parseSkillFromDirectory(skillDir);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  // Remove duplicates based on name
  const uniqueSkills = new Map<string, Skill>();
  for (const skill of skills) {
    if (!uniqueSkills.has(skill.name)) {
      uniqueSkills.set(skill.name, skill);
    }
  }

  return Array.from(uniqueSkills.values());
}

async function findSkillsInDirectory(dirPath: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return skills;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = path.join(dirPath, entry.name);
      const skill = await parseSkillFromDirectory(skillPath);
      if (skill) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

async function parseSkillFromDirectory(dirPath: string): Promise<Skill | null> {
  const skillMdPath = path.join(dirPath, 'SKILL.md');
  
  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const { data, content: body } = matter(content);

    if (!data.name || !data.description) {
      console.warn(`Warning: ${skillMdPath} missing required fields (name, description)`);
      return null;
    }

    return {
      name: data.name,
      description: data.description,
      path: dirPath,
      metadata: {
        name: data.name,
        description: data.description,
        category: data.category,
        author: data.author,
        version: data.version,
        tags: data.tags
      }
    };
  } catch (error) {
    console.warn(`Warning: Failed to parse ${skillMdPath}:`, error);
    return null;
  }
}

export function formatSkillList(skills: Skill[]): string {
  if (skills.length === 0) {
    return 'No skills found.';
  }

  const lines: string[] = [];
  lines.push(`Found ${skills.length} skill(s):\n`);

  // Group by category if available
  const byCategory = new Map<string, Skill[]>();
  for (const skill of skills) {
    const cat = skill.metadata.category || 'General';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(skill);
  }

  for (const [category, categorySkills] of byCategory) {
    lines.push(`\n${category}:`);
    for (const skill of categorySkills) {
      lines.push(`  • ${skill.name}`);
      lines.push(`    ${skill.description}`);
    }
  }

  return lines.join('\n');
}
