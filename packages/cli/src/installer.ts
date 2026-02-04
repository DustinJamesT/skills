import * as fs from 'fs';
import * as path from 'path';
import { Skill, Agent, InstallOptions } from './types';

export async function installSkill(
  skill: Skill,
  agent: Agent,
  options: InstallOptions
): Promise<boolean> {
  const targetPath = options.global ? agent.globalPath : agent.projectPath;
  const skillTargetPath = path.join(targetPath, skill.name);

  try {
    // Ensure target directory exists
    fs.mkdirSync(targetPath, { recursive: true });

    // Check if skill already exists
    if (fs.existsSync(skillTargetPath)) {
      if (!options.yes) {
        console.log(`  Skill "${skill.name}" already exists at ${skillTargetPath}`);
        return false;
      }
      // Remove existing skill
      fs.rmSync(skillTargetPath, { recursive: true, force: true });
    }

    if (options.method === 'symlink') {
      // Create symlink
      fs.symlinkSync(skill.path, skillTargetPath, 'dir');
    } else {
      // Copy directory
      copyDirectorySync(skill.path, skillTargetPath);
    }

    return true;
  } catch (error: any) {
    // Symlink might fail on some systems, fallback to copy
    if (options.method === 'symlink' && error.code === 'EPERM') {
      console.log(`  Symlink failed, falling back to copy...`);
      try {
        copyDirectorySync(skill.path, skillTargetPath);
        return true;
      } catch (copyError) {
        console.error(`  Failed to install skill: ${copyError}`);
        return false;
      }
    }
    console.error(`  Failed to install skill: ${error.message}`);
    return false;
  }
}

export async function installSkillsToAgents(
  skills: Skill[],
  agents: Agent[],
  options: InstallOptions
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const agent of agents) {
    console.log(`\nInstalling to ${agent.name}...`);
    
    for (const skill of skills) {
      const installed = await installSkill(skill, agent, options);
      if (installed) {
        console.log(`  ✓ ${skill.name}`);
        success++;
      } else {
        failed++;
      }
    }
  }

  return { success, failed };
}

function copyDirectorySync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function listInstalledSkills(agent: Agent, global: boolean): Promise<string[]> {
  const targetPath = global ? agent.globalPath : agent.projectPath;
  return listInstalledSkillsAtPath(targetPath);
}

export async function listInstalledSkillsAtPath(targetPath: string): Promise<string[]> {
  if (!fs.existsSync(targetPath)) {
    return [];
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const skills: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() || entry.isSymbolicLink()) {
      const skillMdPath = path.join(targetPath, entry.name, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        skills.push(entry.name);
      }
    }
  }

  return skills;
}

export async function uninstallSkill(
  skillName: string,
  agent: Agent,
  global: boolean
): Promise<boolean> {
  const targetPath = global ? agent.globalPath : agent.projectPath;
  const skillPath = path.join(targetPath, skillName);

  if (!fs.existsSync(skillPath)) {
    return false;
  }

  try {
    fs.rmSync(skillPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Failed to uninstall ${skillName}:`, error);
    return false;
  }
}
