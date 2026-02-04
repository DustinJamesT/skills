import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { parseSource, getDisplayName } from './source-parser';
import { cloneRepository } from './git';
import { discoverSkills } from './skills';
import { Skill } from './types';

export interface FindCommandOptions {
  list?: boolean;
}

export async function findCommand(
  query?: string,
  options?: FindCommandOptions
): Promise<void> {
  const spinner = ora();

  try {
    console.log(chalk.blue(`\n🔍 Solana Skills Search`));
    console.log(chalk.gray(`   Repository: sendaifun/skills\n`));

    // Fetch from default repo
    const sourceInfo = parseSource();
    
    spinner.start('Fetching skills catalog...');
    const repoPath = await cloneRepository(sourceInfo);
    spinner.succeed('Skills catalog loaded');

    // Discover all skills
    const allSkills = await discoverSkills(repoPath);

    if (allSkills.length === 0) {
      console.log(chalk.yellow('\nNo skills found in the repository.'));
      return;
    }

    // Filter by query if provided
    let filteredSkills = allSkills;
    
    if (query) {
      const queryLower = query.toLowerCase();
      filteredSkills = allSkills.filter(s =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description.toLowerCase().includes(queryLower) ||
        (s.metadata.category?.toLowerCase().includes(queryLower)) ||
        (s.metadata.tags?.some(t => t.toLowerCase().includes(queryLower)))
      );

      if (filteredSkills.length === 0) {
        console.log(chalk.yellow(`\nNo skills found matching "${query}".`));
        console.log(chalk.gray('\nTry a different search term or browse all skills:'));
        console.log(chalk.gray('  npx solana-skills find'));
        return;
      }

      console.log(chalk.green(`\nFound ${filteredSkills.length} skill(s) matching "${query}":\n`));
    } else {
      console.log(chalk.green(`\nFound ${filteredSkills.length} skill(s):\n`));
    }

    // Group by category
    const byCategory = new Map<string, Skill[]>();
    for (const skill of filteredSkills) {
      const cat = skill.metadata.category || 'General';
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(skill);
    }

    // Display skills
    if (options?.list) {
      // Simple list format
      for (const skill of filteredSkills) {
        console.log(`  ${skill.name}`);
      }
      return;
    }

    // Rich display by category
    for (const [category, categorySkills] of byCategory) {
      console.log(chalk.cyan(`📁 ${category}`));
      for (const skill of categorySkills) {
        console.log(`   ${chalk.bold(skill.name)}`);
        console.log(`      ${chalk.gray(skill.description)}`);
      }
      console.log();
    }

    // Interactive selection if not in list mode
    if (!query) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Install a skill', value: 'install' },
            { name: 'Search by keyword', value: 'search' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);

      if (action === 'install') {
        const { skill } = await inquirer.prompt([
          {
            type: 'list',
            name: 'skill',
            message: 'Select a skill to install:',
            choices: filteredSkills.map(s => ({
              name: `${s.name} - ${s.description}`,
              value: s.name
            }))
          }
        ]);

        console.log(chalk.cyan(`\nTo install "${skill}", run:`));
        console.log(chalk.white(`  npx solana-skills add --skill ${skill}\n`));
      } else if (action === 'search') {
        const { searchQuery } = await inquirer.prompt([
          {
            type: 'input',
            name: 'searchQuery',
            message: 'Enter search term:'
          }
        ]);
        
        if (searchQuery) {
          await findCommand(searchQuery, options);
        }
      }
    } else {
      // Show install hint
      console.log(chalk.gray('To install a skill:'));
      console.log(chalk.white(`  npx solana-skills add --skill <skill-name>\n`));
    }

  } catch (error: any) {
    spinner.fail('Search failed');
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
