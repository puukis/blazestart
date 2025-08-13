import inquirer from 'inquirer';
import chalk from 'chalk';
import terminalLink from 'terminal-link';
import { printHeader, boxed, divider } from '../utils/ui';

export async function interactiveMenu(version: string): Promise<void> {
  console.clear();
  printHeader('BlazeStart', `v${version} • Project scaffolding CLI`);

  const choices = [
    { name: '🚀 Create a new project', value: 'create' },
    { name: '🧭 Initialize in current directory', value: 'init' },
    { name: '📚 Explore templates & frameworks', value: 'list' },
    { name: '⚙️  Manage config profiles', value: 'config' },
    new inquirer.Separator(divider()),
    { name: '❓ Show CLI help', value: 'help' },
    { name: '🔗 Open GitHub repository', value: 'github' },
    { name: '✖ Exit', value: 'exit' },
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.white('What would you like to do?'),
      choices,
      pageSize: 8,
    },
  ]);

  switch (action) {
    case 'create': {
      const { createCommand } = await import('./create');
      await createCommand();
      break;
    }
    case 'init': {
      const { initCommand } = await import('./init');
      await initCommand();
      break;
    }
    case 'list': {
      const { listTemplates } = await import('./list');
      await listTemplates();
      break;
    }
    case 'config': {
      const { configCommand } = await import('./config');
      await configCommand();
      break;
    }
    case 'help': {
      // Re-print header and a compact help snippet
      console.log(boxed(`${chalk.white('Usage:')} blazestart <command> [options]\n\n` +
        `${chalk.white('Commands:')}\n` +
        `  create   Create a new project\n` +
        `  init     Initialize a project in the current directory\n` +
        `  config   Manage saved configuration profiles\n` +
        `  list     List available templates and frameworks\n\n` +
        `${chalk.white('Tip:')} Run ${chalk.green('blazestart create')} to get started!`, 'CLI Help'));
      break;
    }
    case 'github': {
      const url = 'https://github.com/';
      const link = terminalLink('Open GitHub', url);
      console.log(boxed(`${chalk.white('Repository:')}\n${url}\n\n${chalk.gray('Hint: Ctrl/Cmd + click the link in supported terminals.')}\n${link}`, 'GitHub'));
      break;
    }
    case 'exit':
    default:
      console.log(chalk.gray('Goodbye!'));
      return;
  }

  // After completing an action, ask if the user wants to return to the menu
  const { again } = await inquirer.prompt([
    { type: 'confirm', name: 'again', message: 'Back to main menu?', default: true },
  ]);
  if (again) {
    await interactiveMenu(version);
  }
}
