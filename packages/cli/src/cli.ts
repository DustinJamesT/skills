#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addCommand } from './add';
import { findCommand } from './find';
import { initCommand } from './init';
import { listCommand } from './list';
import { getAgentNames } from './agents';
import { showAsciiBanner, showStaticBanner } from './banner';

const VERSION = '1.0.0';
const DEFAULT_REPO = 'sendaifun/skills';

const program = new Command();

program
  .name('solana-skills')
  .description('CLI for Solana Agent Skills - Install skills for AI coding agents')
  .version(VERSION);

// Add command
program
  .command('add [source]')
  .alias('a')
  .alias('i')
  .alias('install')
  .description(`Install skills from a repository (default: ${DEFAULT_REPO})`)
  .option('-g, --global', 'Install to user directory instead of project')
  .option('-a, --agent <agents...>', `Target specific agents (${getAgentNames().slice(0, 5).join(', ')}...)`)
  .option('-s, --skill <skills...>', 'Install specific skills by name')
  .option('-l, --list', 'List available skills without installing')
  .option('-y, --yes', 'Skip all confirmation prompts')
  .option('--all', 'Install all skills to all agents without prompts')
  .action(async (source, options) => {
    await showAsciiBanner();
    await addCommand(source, options);
  });

// Find command
program
  .command('find [query]')
  .alias('search')
  .description('Search for skills interactively or by keyword')
  .option('-l, --list', 'List skills in simple format')
  .action(async (query, options) => {
    await showAsciiBanner();
    await findCommand(query, options);
  });

// Init command
program
  .command('init [name]')
  .description('Create a new SKILL.md template')
  .option('-d, --description <desc>', 'Skill description')
  .option('-c, --category <category>', 'Skill category')
  .option('-a, --author <author>', 'Skill author')
  .option('-y, --yes', 'Skip prompts, use defaults')
  .action(async (name, options) => {
    await showAsciiBanner();
    await initCommand(name, options);
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List installed skills')
  .option('-g, --global', 'Show only global installations')
  .option('-a, --agent <agents...>', 'Show skills for specific agents')
  .option('-p, --path <path>', 'List skills at a specific path')
  .action(async (options) => {
    await showAsciiBanner();
    await listCommand(options);
  });

// Default action when no command specified
program
  .action(async () => {
    await showAsciiBanner();
    
    console.log(chalk.gray(`  The CLI for Solana Agent Skills`));
    console.log(chalk.gray(`  Default repository: ${DEFAULT_REPO}\n`));
    
    console.log(chalk.cyan('Quick start:\n'));
    console.log('  Install all skills:');
    console.log(chalk.white('    npx solana-skills add --all\n'));
    console.log('  Install specific skills:');
    console.log(chalk.white('    npx solana-skills add --skill solana-agent-kit --skill drift\n'));
    console.log('  Browse available skills:');
    console.log(chalk.white('    npx solana-skills find\n'));
    console.log('  Create a new skill:');
    console.log(chalk.white('    npx solana-skills init my-skill\n'));
    
    console.log(chalk.gray('Run "solana-skills --help" for all commands.\n'));
  });

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  throw err;
});

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error: any) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.help') {
      process.exit(0);
    }
    if (error.code === 'commander.version') {
      process.exit(0);
    }
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main();
