import * as path from 'path';
import chalk from 'chalk';
import { detectInstalledAgents, getAgentById, AGENTS } from './agents';
import { listInstalledSkills, listInstalledSkillsAtPath } from './installer';
import { Agent } from './types';

export interface ListCommandOptions {
  global?: boolean;
  agent?: string[];
  path?: string;
}

export async function listCommand(options?: ListCommandOptions): Promise<void> {
  try {
    console.log(chalk.blue(`\n📋 Installed Solana Skills\n`));

    // If a custom path is provided, use that instead of agent paths
    if (options?.path) {
      const customPath = path.resolve(options.path);
      const skills = await listInstalledSkillsAtPath(customPath);

      if (skills.length === 0) {
        console.log(chalk.yellow('No skills found at specified path.'));
        console.log(chalk.gray(`  Path: ${customPath}\n`));
      } else {
        console.log(chalk.cyan(`Skills at ${customPath}:`));
        for (const skill of skills) {
          console.log(chalk.green('  ✔ ') + skill);
        }
        console.log(chalk.green(`\nTotal: ${skills.length} skill(s)\n`));
      }
      return;
    }

    let agentsToCheck: Agent[];

    if (options?.agent && options.agent.length > 0) {
      agentsToCheck = options.agent
        .map(id => getAgentById(id))
        .filter((a): a is Agent => a !== undefined);
    } else {
      // Check all agents
      agentsToCheck = AGENTS;
    }

    let totalSkills = 0;
    let agentsWithSkills = 0;

    for (const agent of agentsToCheck) {
      const globalSkills = await listInstalledSkills(agent, true);
      const projectSkills = await listInstalledSkills(agent, false);
      
      const allSkills = new Set([...globalSkills, ...projectSkills]);
      
      if (allSkills.size > 0) {
        agentsWithSkills++;
        console.log(chalk.cyan(`${agent.name}:`));
        
        if (globalSkills.length > 0 && (!options || !options.global || options.global === undefined)) {
          console.log(chalk.gray(`  Global (${agent.globalPath}):`));
          for (const skill of globalSkills) {
            console.log(`    • ${skill}`);
            totalSkills++;
          }
        }
        
        if (projectSkills.length > 0 && (!options?.global)) {
          console.log(chalk.gray(`  Project (${agent.projectPath}):`));
          for (const skill of projectSkills) {
            if (!globalSkills.includes(skill)) {
              console.log(`    • ${skill}`);
              totalSkills++;
            } else {
              console.log(`    • ${skill} ${chalk.gray('(also global)')}`);
            }
          }
        }
        
        console.log();
      }
    }

    if (totalSkills === 0) {
      console.log(chalk.yellow('No skills installed yet.'));
      console.log(chalk.gray('\nTo install skills, run:'));
      console.log(chalk.white('  npx solana-skills add\n'));
    } else {
      console.log(chalk.green(`Total: ${totalSkills} skill(s) across ${agentsWithSkills} agent(s)`));
    }

  } catch (error: any) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
