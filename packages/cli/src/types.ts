export interface SkillMetadata {
  name: string;
  description: string;
  category?: string;
  author?: string;
  version?: string;
  tags?: string[];
}

export interface Skill {
  name: string;
  description: string;
  path: string;
  metadata: SkillMetadata;
}

export interface Agent {
  id: string;
  name: string;
  projectPath: string;
  globalPath: string;
  detect: () => Promise<boolean>;
}

export interface InstallOptions {
  global: boolean;
  agents: string[];
  skills: string[];
  list: boolean;
  yes: boolean;
  all: boolean;
  method: 'symlink' | 'copy';
}

export interface SourceInfo {
  type: 'github' | 'gitlab' | 'local' | 'git';
  owner?: string;
  repo?: string;
  path?: string;
  branch?: string;
  url?: string;
}
