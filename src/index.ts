
import { Command } from 'commander';
import { createCommand } from './commands/create';
import { initCommand } from './commands/init';
import { configCommand } from './commands/config';
import { printHeader } from './utils/ui';
import * as packageJson from '../package.json';

const version = packageJson.version || '1.0.0';

async function showSplashScreen(): Promise<void> {
  console.clear();
  const title = 'BlazeStart';
  const subtitle = `v${version} • Project scaffolding CLI`;
  printHeader(title, subtitle);
}

const program = new Command();

program
  .name('blazestart')
  .description('Slash project setup time to seconds')
  .version(version)
  .hook('preAction', async () => {
    if (process.argv.length === 2 || process.argv[2] === 'create') {
      await showSplashScreen();
    }
  });

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

program
  .command('init')
  .description('Initialize a project in the current directory')
  .option('-l, --language <language>', 'Programming language')
  .option('-f, --framework <framework>', 'Framework to use')
  .option('--license <license>', 'License type')
  .action(initCommand);

program
  .command('config <action>')
  .description('Manage saved configuration profiles')
  .option('-n, --name <name>', 'Profile name')
  .option('-s, --set <key=value>', 'Set a configuration value')
  .action(configCommand);

program
  .command('list')
  .alias('ls')
  .description('List all available templates and frameworks')
  .action(async () => {
    const { listTemplates } = await import('./commands/list');
    await listTemplates();
  });

program
  .command('fork <repo-url>')
  .description('Fork and customize an existing repository')
  .option('-n, --name <name>', 'New project name')
  .option('--clean', 'Remove git history', false)
  .action(async (repoUrl, options) => {
    const { forkCommand } = await import('./commands/fork');
    await forkCommand(repoUrl, options);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  showSplashScreen().then(() => {
    program.outputHelp();
  });
}
