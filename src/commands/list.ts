import chalk from 'chalk';
import { LANGUAGES, FRAMEWORKS, LICENSES, PACKAGE_MANAGERS } from '../config/templates';

export async function listTemplates(): Promise<void> {
  console.clear();

  console.log(chalk.cyan.bold('BlazeStart Templates & Frameworks'));
  console.log(chalk.gray(''.padEnd(50, '—')));
  
  console.log(chalk.yellow.bold('\nSUPPORTED LANGUAGES\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const languageRows: string[] = [];
  for (let i = 0; i < LANGUAGES.length; i += 3) {
    const row = LANGUAGES.slice(i, i + 3)
      .map(lang => `${chalk.white(lang.name.padEnd(12))}`)
      .join('  ');
    languageRows.push(row);
  }
  languageRows.forEach(row => console.log('  ' + row));
  
  console.log(chalk.yellow.bold('\nFRAMEWORKS BY LANGUAGE\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const frameworksByLanguage: Record<string, typeof FRAMEWORKS> = {};
  
  LANGUAGES.forEach(lang => {
    const langFrameworks = FRAMEWORKS.filter(f => f.languages.includes(lang.id));
    if (langFrameworks.length > 0) {
      frameworksByLanguage[lang.id] = langFrameworks;
    }
  });
  
  Object.entries(frameworksByLanguage).forEach(([langId, frameworks]) => {
    const lang = LANGUAGES.find(l => l.id === langId);
    if (!lang) return;
    
    console.log(chalk.cyan(`\n  ${lang.name}:`));
    
    frameworks.forEach(framework => {
      const description = chalk.gray(` - ${framework.description}`);
      console.log(`     ${chalk.white(framework.name.padEnd(15))}${description}`);
    });
  });
  
  console.log(chalk.yellow.bold('\nPACKAGE MANAGERS\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const pmByLanguage: Record<string, typeof PACKAGE_MANAGERS> = {};
  
  LANGUAGES.forEach(lang => {
    const langPMs = PACKAGE_MANAGERS.filter(pm => pm.languages.includes(lang.id));
    if (langPMs.length > 0) {
      pmByLanguage[lang.id] = langPMs;
    }
  });
  
  Object.entries(pmByLanguage).forEach(([langId, pms]) => {
    const lang = LANGUAGES.find(l => l.id === langId);
    if (!lang) return;
    
    const pmList = pms.map(pm => `${pm.name}`).join(', ');
    console.log(`  ${chalk.white(lang.name.padEnd(12))} ${chalk.gray('->')} ${pmList}`);
  });
  
  console.log(chalk.yellow.bold('\nAVAILABLE LICENSES\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const licenseRows: string[] = [];
  for (let i = 0; i < LICENSES.length; i += 3) {
    const row = LICENSES.slice(i, i + 3)
      .map(lic => `${chalk.white(lic.name.padEnd(15))}`)
      .join('  ');
    licenseRows.push(row);
  }
  licenseRows.forEach(row => console.log('  ' + row));
  
  console.log(chalk.yellow.bold('\nADDITIONAL FEATURES\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const features = [
    'ESLint, Prettier, Black, rustfmt (language-specific linters)',
    'Git hooks with Husky / pre-commit',
    'README templates (Standard, Minimal, AI-generated)',
    'Git repository initialization',
    'Automatic dependency installation',
    'Configuration profiles for repeated use',
    'Interactive CLI prompts',
    'Fast project scaffolding'
  ];
  
  features.forEach(feature => {
    console.log('  ' + chalk.white('•') + ' ' + feature);
  });
  
  console.log(chalk.yellow.bold('\nUSAGE EXAMPLES\n'));
  console.log(chalk.gray('──────────────────────────────────────────'));
  
  const examples = [
    {
      cmd: 'blazestart create my-app',
      desc: 'Interactive project creation'
    },
    {
      cmd: 'blazestart create my-api -l typescript -f express',
      desc: 'TypeScript + Express API'
    },
    {
      cmd: 'blazestart create my-site -l javascript -f react',
      desc: 'React app with JavaScript'
    },
    {
      cmd: 'blazestart init',
      desc: 'Initialize in current directory'
    },
    {
      cmd: 'blazestart config save --name fullstack',
      desc: 'Save a configuration profile'
    },
    {
      cmd: 'blazestart create my-project --config fullstack',
      desc: 'Use saved profile'
    }
  ];
  
  examples.forEach(ex => {
    console.log(`  ${chalk.green('$')} ${chalk.white(ex.cmd)}`);
    console.log(`    ${chalk.gray(ex.desc)}\n`);
  });

  console.log(chalk.gray(''.padEnd(50, '—')));
  console.log(chalk.white('Run: ') + chalk.green('blazestart create') + chalk.white(' to begin'));
}
