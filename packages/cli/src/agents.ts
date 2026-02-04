import { Agent } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const home = os.homedir();

export const AGENTS: Agent[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    projectPath: '.claude/skills/',
    globalPath: path.join(home, '.claude/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.claude')) ||
             fs.existsSync('.claude');
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    projectPath: '.cursor/skills/',
    globalPath: path.join(home, '.cursor/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.cursor')) ||
             fs.existsSync('.cursor');
    }
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    projectPath: '.opencode/skills/',
    globalPath: path.join(home, '.config/opencode/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.config/opencode')) ||
             fs.existsSync('.opencode');
    }
  },
  {
    id: 'codex',
    name: 'Codex',
    projectPath: '.codex/skills/',
    globalPath: path.join(home, '.codex/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.codex')) ||
             fs.existsSync('.codex');
    }
  },
  {
    id: 'cline',
    name: 'Cline',
    projectPath: '.cline/skills/',
    globalPath: path.join(home, '.cline/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.cline')) ||
             fs.existsSync('.cline');
    }
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    projectPath: '.windsurf/skills/',
    globalPath: path.join(home, '.codeium/windsurf/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.codeium/windsurf')) ||
             fs.existsSync('.windsurf');
    }
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    projectPath: '.github/skills/',
    globalPath: path.join(home, '.copilot/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.copilot')) ||
             fs.existsSync('.github');
    }
  },
  {
    id: 'goose',
    name: 'Goose',
    projectPath: '.goose/skills/',
    globalPath: path.join(home, '.config/goose/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.config/goose')) ||
             fs.existsSync('.goose');
    }
  },
  {
    id: 'continue',
    name: 'Continue',
    projectPath: '.continue/skills/',
    globalPath: path.join(home, '.continue/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.continue')) ||
             fs.existsSync('.continue');
    }
  },
  {
    id: 'roo',
    name: 'Roo Code',
    projectPath: '.roo/skills/',
    globalPath: path.join(home, '.roo/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.roo')) ||
             fs.existsSync('.roo');
    }
  },
  {
    id: 'amp',
    name: 'Amp',
    projectPath: '.agents/skills/',
    globalPath: path.join(home, '.config/agents/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.config/agents')) ||
             fs.existsSync('.agents');
    }
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    projectPath: '.gemini/skills/',
    globalPath: path.join(home, '.gemini/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.gemini')) ||
             fs.existsSync('.gemini');
    }
  },
  {
    id: 'kilo',
    name: 'Kilo Code',
    projectPath: '.kilocode/skills/',
    globalPath: path.join(home, '.kilocode/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.kilocode')) ||
             fs.existsSync('.kilocode');
    }
  },
  {
    id: 'trae',
    name: 'Trae',
    projectPath: '.trae/skills/',
    globalPath: path.join(home, '.trae/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.trae')) ||
             fs.existsSync('.trae');
    }
  },
  {
    id: 'zencoder',
    name: 'Zencoder',
    projectPath: '.zencoder/skills/',
    globalPath: path.join(home, '.zencoder/skills/'),
    detect: async () => {
      return fs.existsSync(path.join(home, '.zencoder')) ||
             fs.existsSync('.zencoder');
    }
  }
];

export async function detectInstalledAgents(): Promise<Agent[]> {
  const detected: Agent[] = [];
  for (const agent of AGENTS) {
    if (await agent.detect()) {
      detected.push(agent);
    }
  }
  return detected;
}

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}

export function getAgentNames(): string[] {
  return AGENTS.map(a => a.id);
}
