import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import CheckboxPlusPrompt from 'inquirer-checkbox-plus-prompt';
import { parseSource, getDisplayName } from './source-parser';
import { cloneRepository } from './git';
import { discoverSkills, formatSkillList } from './skills';
import { installSkillsToAgents } from './installer';
import { detectInstalledAgents, getAgentById, AGENTS } from './agents';
import { InstallOptions, Skill, Agent, SourceInfo } from './types';

// Register the checkbox-plus prompt type
inquirer.registerPrompt('checkbox-plus', CheckboxPlusPrompt);

export interface AddCommandOptions {
  global?: boolean;
  agent?: string[];
  skill?: string[];
  list?: boolean;
  yes?: boolean;
  all?: boolean;
}

export async function addCommand(
  source: string | undefined,
  options: AddCommandOptions
): Promise<void> {
  const spinner = ora();

  try {
    // Parse the source (default to sendaifun/skills)
    const sourceInfo = parseSource(source);
    const displayName = getDisplayName(sourceInfo);

    console.log(chalk.blue(`\n📦 Solana Skills CLI`));
    console.log(chalk.gray(`   Repository: ${displayName}\n`));

    // Clone or use local path
    let repoPath: string;
    
    if (sourceInfo.type === 'local') {
      repoPath = path.resolve(sourceInfo.path!);
      if (!fs.existsSync(repoPath)) {
        console.error(chalk.red(`Error: Local path does not exist: ${repoPath}`));
        process.exit(1);
      }
    } else {
      spinner.start(`Fetching skills from ${displayName}...`);
      repoPath = await cloneRepository(sourceInfo);
      spinner.succeed(`Fetched ${displayName}`);
    }

    // Discover skills
    spinner.start('Discovering skills...');
    const allSkills = await discoverSkills(repoPath, sourceInfo.path);
    spinner.succeed(`Found ${allSkills.length} skill(s)`);

    if (allSkills.length === 0) {
      console.log(chalk.yellow('\nNo skills found in this repository.'));
      console.log(chalk.gray('Skills must have a SKILL.md file with name and description in frontmatter.'));
      return;
    }

    // List mode - just show skills and exit
    if (options.list) {
      console.log(chalk.cyan('\nAvailable skills:\n'));
      for (const skill of allSkills) {
        console.log(`  ${chalk.bold(skill.name)}`);
        console.log(`    ${chalk.gray(skill.description)}`);
        if (skill.metadata.category) {
          console.log(`    ${chalk.blue(`[${skill.metadata.category}]`)}`);
        }
        console.log();
      }
      return;
    }

    // Filter skills if specific ones requested
    let selectedSkills: Skill[];
    
    if (options.skill && options.skill.length > 0) {
      if (options.skill.includes('*')) {
        selectedSkills = allSkills;
      } else {
        selectedSkills = allSkills.filter(s => 
          options.skill!.some(name => 
            s.name.toLowerCase() === name.toLowerCase() ||
            s.name.toLowerCase().includes(name.toLowerCase())
          )
        );
        
        if (selectedSkills.length === 0) {
          console.error(chalk.red(`\nNo skills found matching: ${options.skill.join(', ')}`));
          console.log(chalk.gray('\nAvailable skills:'));
          for (const skill of allSkills) {
            console.log(`  - ${skill.name}`);
          }
          return;
        }
      }
    } else if (options.all || options.yes) {
      selectedSkills = allSkills;
    } else {
      // Interactive skill selection with search
      console.log(chalk.cyan('\n? Select skills to install:'));
      console.log(chalk.gray('  (Type to search, <space> to select, <enter> to confirm)\n'));

      const { skills: chosenSkills } = await inquirer.prompt([
        {
          type: 'checkbox-plus',
          name: 'skills',
          message: 'Search:',
          pageSize: 10,
          highlight: true,
          searchable: true,
          source: async (answersSoFar: any, input: string) => {
            const searchTerm = (input || '').toLowerCase();
            const filtered = allSkills.filter(s =>
              !searchTerm ||
              s.name.toLowerCase().includes(searchTerm) ||
              s.description.toLowerCase().includes(searchTerm)
            );
            return filtered.map(s => {
              // Truncate description to ~60 chars for one-liner
              const maxLen = 60;
              const desc = s.description.length > maxLen
                ? s.description.substring(0, maxLen) + '...'
                : s.description;
              return {
                name: `${chalk.bold(s.name)} ${chalk.gray('- ' + desc)}`,
                value: s,
                short: s.name
              };
            });
          },
          validate: (answer: any) => answer.length > 0 || 'Please select at least one skill, use <space> to select'
        }
      ]);
      selectedSkills = chosenSkills;
    }

    // Detect or select agents
    let selectedAgents: Agent[];
    
    if (options.agent && options.agent.length > 0) {
      if (options.agent.includes('*')) {
        selectedAgents = AGENTS;
      } else {
        selectedAgents = options.agent
          .map(id => getAgentById(id))
          .filter((a): a is Agent => a !== undefined);
        
        if (selectedAgents.length === 0) {
          console.error(chalk.red(`\nNo valid agents specified. Available agents:`));
          for (const agent of AGENTS) {
            console.log(`  - ${agent.id} (${agent.name})`);
          }
          return;
        }
      }
    } else {
      // Auto-detect installed agents
      spinner.start('Detecting installed agents...');
      const detected = await detectInstalledAgents();
      spinner.stop();

      if (detected.length > 0) {
        console.log(chalk.green(`\nDetected ${detected.length} agent(s): ${detected.map(a => a.name).join(', ')}`));
        
        if (options.yes || options.all) {
          selectedAgents = detected;
        } else {
          const { agents: chosenAgents } = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'agents',
              message: 'Select agents to install to:',
              choices: detected.map(a => ({
                name: a.name,
                value: a,
                checked: true
              })),
              validate: (answer) => answer.length > 0 || 'Please select at least one agent, use <space> to select'
            }
          ]);
          selectedAgents = chosenAgents;
        }
      } else {
        // No agents detected, let user choose
        console.log(chalk.yellow('\nNo agents automatically detected.'));
        
        const { agents: chosenAgents } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'agents',
            message: 'Select agents to install to:',
            choices: AGENTS.map(a => ({
              name: a.name,
              value: a,
              checked: false
            })),
            validate: (answer) => answer.length > 0 || 'Please select at least one agent, use <space> to select'
          }
        ]);
        selectedAgents = chosenAgents;
      }
    }

    // Select installation method
    let installMethod: 'symlink' | 'copy' = 'symlink';
    
    if (!options.yes && !options.all) {
      const { method } = await inquirer.prompt([
        {
          type: 'list',
          name: 'method',
          message: 'Installation method:',
          choices: [
            { name: 'Symlink (recommended) - Single source, easy updates', value: 'symlink' },
            { name: 'Copy - Independent copies for each agent', value: 'copy' }
          ],
          default: 'symlink'
        }
      ]);
      installMethod = method;
    }

    // Confirm installation
    if (!options.yes && !options.all) {
      console.log(chalk.cyan('\nInstallation summary:'));
      console.log(`  Skills: ${selectedSkills.map(s => s.name).join(', ')}`);
      console.log(`  Agents: ${selectedAgents.map(a => a.name).join(', ')}`);
      console.log(`  Scope: ${options.global ? 'Global (user-level)' : 'Project (local)'}`);
      console.log(`  Method: ${installMethod}`);
      
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with installation?',
          default: true
        }
      ]);
      
      if (!confirm) {
        console.log(chalk.yellow('\nInstallation cancelled.'));
        return;
      }
    }

    // Install skills
    const installOptions: InstallOptions = {
      global: options.global || false,
      agents: selectedAgents.map(a => a.id),
      skills: selectedSkills.map(s => s.name),
      list: false,
      yes: options.yes || false,
      all: options.all || false,
      method: installMethod
    };

    console.log(chalk.cyan('\nInstalling skills...'));
    const result = await installSkillsToAgents(selectedSkills, selectedAgents, installOptions);

    // Colorful success summary
    console.log('\n' + chalk.bgGreen.black.bold(' SUCCESS ') + chalk.green(' Installation complete!\n'));

    // Show installed skills with checkmarks
    console.log(chalk.bold('  Installed Skills:'));
    for (const skill of selectedSkills) {
      console.log(chalk.green('    ✔ ') + chalk.bold(skill.name) + chalk.gray(` - ${skill.description.substring(0, 50)}${skill.description.length > 50 ? '...' : ''}`));
    }

    // Show target agents
    console.log(chalk.bold('\n  Target Agents:'));
    for (const agent of selectedAgents) {
      const location = options.global ? agent.globalPath : agent.projectPath;
      console.log(chalk.green('    ✔ ') + chalk.bold(agent.name) + chalk.gray(` → ${location}`));
    }

    // Show failures if any
    if (result.failed > 0) {
      console.log(chalk.yellow(`\n  ⚠ ${result.failed} skill(s) failed to install`));
    }

    // Footer
    console.log(chalk.gray('\n  ─────────────────────────────────────────────────'));
    console.log(chalk.gray('  Run ') + chalk.cyan('solana-skills list') + chalk.gray(' to see all installed skills'));
    console.log(chalk.gray('  Run ') + chalk.cyan('solana-skills remove <skill>') + chalk.gray(' to uninstall\n'));

  } catch (error: any) {
    spinner.fail('Installation failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
