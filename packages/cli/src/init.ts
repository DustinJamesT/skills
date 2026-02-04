import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const SKILL_TEMPLATE = `---
name: {{name}}
description: {{description}}
category: {{category}}
author: {{author}}
---

# {{title}}

{{description}}

## Overview

Describe what this skill helps accomplish and when it should be used.

## Instructions

1. First step the agent should follow
2. Second step
3. Third step

## Examples

### Example 1: Basic Usage

\`\`\`typescript
// Example code demonstrating the skill
\`\`\`

### Example 2: Advanced Usage

\`\`\`typescript
// More complex example
\`\`\`

## Guidelines

- Best practice 1
- Best practice 2
- Edge cases to handle

## Resources

- [Documentation Link](https://example.com)
- [API Reference](https://example.com/api)
`;

export interface InitCommandOptions {
  name?: string;
  description?: string;
  category?: string;
  author?: string;
  yes?: boolean;
}

export async function initCommand(
  skillName?: string,
  options?: InitCommandOptions
): Promise<void> {
  try {
    console.log(chalk.blue(`\n🆕 Create New Solana Skill\n`));

    let name: string;
    let description: string;
    let category: string;
    let author: string;

    if (options?.yes && skillName) {
      // Non-interactive mode
      name = skillName;
      description = options.description || 'A new Solana skill';
      category = options.category || 'General';
      author = options.author || '';
    } else {
      // Interactive mode
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Skill name (lowercase, hyphens for spaces):',
          default: skillName,
          validate: (input) => {
            if (!input) return 'Skill name is required';
            if (!/^[a-z0-9-]+$/.test(input)) {
              return 'Skill name must be lowercase with hyphens only';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description:',
          default: options?.description,
          validate: (input) => input ? true : 'Description is required'
        },
        {
          type: 'list',
          name: 'category',
          message: 'Category:',
          choices: [
            'DeFi',
            'NFT & Tokens',
            'Program Development',
            'Client Development',
            'Infrastructure',
            'Oracles',
            'Security',
            'Cross-Chain',
            'Trading',
            'Data & Analytics',
            'DevOps',
            'AI Agents',
            'General'
          ],
          default: options?.category || 'General'
        },
        {
          type: 'input',
          name: 'author',
          message: 'Author (optional):',
          default: options?.author
        }
      ]);

      name = answers.name;
      description = answers.description;
      category = answers.category;
      author = answers.author;
    }

    // Create skill directory
    const skillDir = skillName ? path.join(process.cwd(), name) : process.cwd();
    
    if (skillName && fs.existsSync(skillDir)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory "${name}" already exists. Overwrite?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('\nCancelled.'));
        return;
      }
    }

    if (skillName) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // Generate SKILL.md content
    const title = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    let content = SKILL_TEMPLATE
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{title\}\}/g, title)
      .replace(/\{\{description\}\}/g, description)
      .replace(/\{\{category\}\}/g, category)
      .replace(/\{\{author\}\}/g, author);

    // Write SKILL.md
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(skillMdPath, content);

    // Create optional subdirectories
    const subdirs = ['docs', 'examples', 'resources', 'templates'];
    
    if (!options?.yes) {
      const { createSubdirs } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'createSubdirs',
          message: 'Create additional directories?',
          choices: subdirs.map(d => ({ name: d, value: d, checked: false }))
        }
      ]);

      for (const subdir of createSubdirs) {
        fs.mkdirSync(path.join(skillDir, subdir), { recursive: true });
        fs.writeFileSync(path.join(skillDir, subdir, '.gitkeep'), '');
      }
    }

    console.log(chalk.green(`\n✓ Skill created successfully!`));
    console.log(chalk.gray(`\n  Location: ${skillDir}`));
    console.log(chalk.gray(`  Edit: ${skillMdPath}`));
    
    console.log(chalk.cyan('\nNext steps:'));
    console.log('  1. Edit SKILL.md with your skill instructions');
    console.log('  2. Add example code and documentation');
    console.log('  3. Test the skill with your AI agent');
    console.log('  4. Submit a PR to sendaifun/skills!');
    console.log();

  } catch (error: any) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
