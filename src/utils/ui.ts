import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import gradient from 'gradient-string';

export const divider = (width: number = process.stdout.columns || 60): string => {
  return chalk.gray('─'.repeat(Math.max(20, Math.min(width, 80))));
};

export const printHeader = (title: string, subtitle?: string): void => {
  console.log();
  const banner = gradient.morning.multiline(
    `\n  ${title}\n`
  );
  console.log(banner);

  if (subtitle) {
    const content = `${chalk.gray(subtitle)}`;
    console.log(
      boxen(content, {
        padding: { top: 0, right: 2, bottom: 0, left: 2 },
        margin: { top: 0, right: 0, bottom: 1, left: 0 },
        borderStyle: 'round',
        borderColor: 'cyan',
      })
    );
  }
  console.log(divider());
  console.log();
};

export const makeSpinner = (text: string) =>
  ora({
    text: chalk.gray(text),
    spinner: 'dots',
  });

export const logInfo = (msg: string) => console.log(chalk.cyan(`ℹ ${msg}`));
export const logSuccess = (msg: string) => console.log(chalk.green(`✔ ${msg}`));
export const logWarn = (msg: string) => console.log(chalk.yellow(`⚠ ${msg}`));
export const logError = (msg: string) => console.log(chalk.red(`✖ ${msg}`));

export const boxed = (msg: string, title?: string) =>
  boxen(msg, {
    title,
    padding: 1,
    margin: { top: 0, right: 0, bottom: 1, left: 0 },
    borderStyle: 'round',
    borderColor: 'cyan',
  });

export const printSection = (title: string, help?: string) => {
  console.log('\n' + chalk.bold.cyan(title));
  if (help) console.log(chalk.gray(help));
  console.log(divider());
};
