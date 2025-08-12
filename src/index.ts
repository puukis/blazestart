#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';
import { printHeader } from './utils/ui';
import * as packageJson from '../package.json';

const version = packageJson.version || '1.0.0';

// Polished splash screen using UI helpers
async function showSplashScreen(): Promise<void> {
  console.clear();
  const title = 'BlazeStart';
  const subtitle = `v${version} • Project scaffolding CLI`;
  printHeader(title, subtitle);
}

// Main program
const program = new Command();

program
  .name('blazestart')
  .description('Slash project setup time to seconds')
  .version(version)
  .hook('preAction', async () => {
    // Show splash screen only for main commands
    if (process.argv.length === 2 || process.argv[2] === 'create') {
      await showSplashScreen();
    }
  });

// Create command - main functionality
program
  .command('create [project-name]')
  .alias('new')
  .description('Create a new project with your chosen stack')
  .option('-l, --language <language>', 'Programming language')
  .option('-f, --framework <framework>', 'Framework to use')
  .option('--license <license>', 'License type')
  .option('-g, --git', 'Initialize git repository')
  .option('--no-git', 'Skip git initialization')
  .option('-i, --install', 'Install dependencies', true)
  .option('--no-install', 'Skip dependency installation')
  .option('-o, --open', 'Open in VS Code after creation')
  .option('--config <profile>', 'Use a saved configuration profile')
  .action(createCommand);

// Init command - initialize in current directory
program
  .command('init')
  .description('Initialize a project in the current directory')
  .option('-l, --language <language>', 'Programming language')
  .option('-f, --framework <framework>', 'Framework to use')
  .option('--license <license>', 'License type')
  .action(initCommand);

// Config command - manage saved configurations
program
  .command('config <action>')
  .description('Manage saved configuration profiles')
  .option('-n, --name <name>', 'Profile name')
  .option('-s, --set <key=value>', 'Set a configuration value')
  .action(configCommand);

// List command - show available templates
program
  .command('list')
  .alias('ls')
  .description('List all available templates and frameworks')
  .action(async () => {
    const { listTemplates } = await import('./commands/list');
    await listTemplates();
  });

// Fork command - fork and customize existing repos
program
  .command('fork <repo-url>')
  .description('Fork and customize an existing repository')
  .option('-n, --name <name>', 'New project name')
  .option('--clean', 'Remove git history', false)
  .action(async (repoUrl, options) => {
    const { forkCommand } = await import('./commands/fork');
    await forkCommand(repoUrl, options);
  });

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  showSplashScreen().then(() => {
    program.outputHelp();
  });
}
