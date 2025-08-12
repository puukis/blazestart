import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import path from 'path';
import fs from 'fs-extra';
import { simpleGit } from 'simple-git';
import { execSync } from 'child_process';
import { generateProject } from '../utils/generator';
import { LANGUAGES, FRAMEWORKS, LICENSES, PACKAGE_MANAGERS } from '../config/templates';
import { boxed } from '../utils/ui';
import { getConfig, loadProfile } from '../utils/config';

export async function initCommand(options?: any): Promise<void> {
  try {
    const currentDir = process.cwd();
    const dirName = path.basename(currentDir);
    
    // Check if directory is empty
    const files = await fs.readdir(currentDir);
    const isEmpty = files.length === 0 || 
                   (files.length === 1 && files[0] === '.git');
    
    if (!isEmpty) {
      const proceed = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: chalk.yellow(`⚠️  Current directory is not empty. Continue initialization?`),
          default: false
        }
      ]);
      
      if (!proceed.continue) {
        console.log(chalk.red('✖ Initialization cancelled'));
        return;
      }
    }
    
    console.log(chalk.cyan(`\n📂 Initializing project in: ${currentDir}\n`));
    
    // Silently load default profile to prefill defaults (if configured)
    let profile: any = {};
    try {
      const appConfig = await getConfig();
      if (appConfig.defaultProfile) {
        profile = await loadProfile(appConfig.defaultProfile);
        console.log(chalk.cyan(`📋 Loaded default profile: ${appConfig.defaultProfile}`));
      }
    } catch {
      // ignore
    }
    const profileActive = Object.keys(profile).length > 0;

    // Interactive wizard
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: '💻 Choose your language:',
        choices: LANGUAGES.map(lang => ({
          name: `${lang.icon} ${lang.name}`,
          value: lang.id
        })),
        default: options?.language || profile.language || 'typescript',
        when: !options?.language && !profileActive
      },
      {
        type: 'list',
        name: 'framework',
        message: '🚀 Choose your framework:',
        choices: (answers: any) => {
          const lang = options?.language || answers.language;
          const frameworks = FRAMEWORKS.filter(f => f.languages.includes(lang));
          return [
            { name: '⚡ None (vanilla)', value: 'none' },
            ...frameworks.map(f => ({
              name: `${f.icon} ${f.name}`,
              value: f.id
            }))
          ];
        },
        default: options?.framework || profile.framework || 'none',
        when: !options?.framework && !profileActive
      },
      {
        type: 'list',
        name: 'license',
        message: '📜 Choose a license:',
        choices: LICENSES.map(lic => ({
          name: `${lic.icon} ${lic.name}`,
          value: lic.id
        })),
        default: options?.license || profile.license || 'mit',
        when: !options?.license && !profileActive
      },
      {
        type: 'list',
        name: 'packageManager',
        message: '📦 Package manager:',
        choices: (answers: any) => {
          const lang = options?.language || answers.language;
          return PACKAGE_MANAGERS
            .filter(pm => pm.languages.includes(lang))
            .map(pm => ({
              name: `${pm.icon} ${pm.name}`,
              value: pm.id
            }));
        },
        default: profile.packageManager || 'npm',
        when: (answers: any) => {
          const lang = options?.language || answers.language;
          return ['javascript', 'typescript'].includes(lang) && !profileActive;
        }
      },
      {
        type: 'list',
        name: 'readme',
        message: '📖 README template:',
        choices: [
          { name: '📝 Standard (comprehensive)', value: 'standard' },
          { name: '📄 Minimal (basic)', value: 'minimal' },
          { name: '🤖 AI-Generated (contextual)', value: 'ai' }
        ],
        default: profile.readme || 'standard',
        when: !profileActive
      },
      
      {
        type: 'confirm',
        name: 'gitHooks',
        message: '🪝 Setup Git hooks (husky/pre-commit)?',
        default: profile.gitHooks !== undefined ? profile.gitHooks : true,
        when: (answers: any) => {
          const lang = options?.language || answers.language;
          return ['javascript', 'typescript', 'python'].includes(lang) && !profileActive;
        }
      },
      {
        type: 'confirm',
        name: 'git',
        message: '🔀 Initialize Git repository?',
        default: profile.git !== undefined ? profile.git : !files.includes('.git'),
        when: () => !files.includes('.git') && !profileActive
      },
      {
        type: 'confirm',
        name: 'remoteRepo',
        message: '🌐 Create GitHub repository and push?',
        default: profile.remoteRepo || false,
        when: (answers: any) => !!answers.git && !profileActive
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: '📥 Install dependencies?',
        default: profile.installDeps !== undefined ? profile.installDeps : true,
        when: !profileActive
      }
    ]);
    
    // Prepare project options
    const projectOptions = {
      name: dirName,
      language: options?.language || profile.language || answers.language,
      framework: options?.framework || profile.framework || answers.framework,
      license: options?.license || profile.license || answers.license,
      packageManager: profile.packageManager || answers.packageManager || 'npm',
      readme: profile.readme || answers.readme || 'standard',
      gitignore: true,
      linters: [],
      gitHooks: profile.gitHooks !== undefined ? profile.gitHooks : (answers.gitHooks || false),
      git: profile.git !== undefined ? profile.git : (answers.git || false),
      remoteRepo: profile.remoteRepo || answers.remoteRepo || false,
      openInVSCode: false,
      installDeps: profile.installDeps !== undefined ? profile.installDeps : (answers.installDeps || false)
    };
    
    // Generate project files
    const spinner = ora('🔥 Generating project files...').start();
    await generateProject(currentDir, projectOptions);
    spinner.succeed(chalk.green('Project files generated'));
    
    // Initialize Git
    if (projectOptions.git) {
      const gitSpinner = ora('🔀 Initializing Git repository...').start();
      const git = simpleGit(currentDir);
      await git.init();
      await git.add('.');
      await git.commit('🎉 Initial commit - Project scaffolded with BlazeStart');
      gitSpinner.succeed(chalk.green('Git repository initialized'));
    }
    
    // Create remote repository (if requested)
    if (projectOptions.git && projectOptions.remoteRepo) {
      const remoteSpinner = ora('🌐 Creating GitHub repository...').start();
      try {
        // Ensure gh is installed and authenticated
        execSync('gh --version', { stdio: 'ignore' });
        execSync('gh auth status -h github.com', { stdio: 'ignore' });

        const safeName = dirName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        execSync(`gh repo create ${safeName} --public --source="${currentDir}" --remote=origin --push`, {
          stdio: 'ignore'
        });
        remoteSpinner.succeed(chalk.green('GitHub repository created and pushed'));
      } catch (e) {
        remoteSpinner.info(chalk.yellow('Could not auto-create GitHub repository (gh not installed or not authenticated).'));
        console.log(chalk.dim(`
  To push to GitHub manually:
  1) Create a new repository on GitHub (no README/license)
  2) Run these commands:
     git remote add origin https://github.com/<your-user>/<repo>.git
     git branch -M main
     git push -u origin main
        `));
      }
    }
    
    // Install dependencies
    if (projectOptions.installDeps && ['javascript', 'typescript'].includes(projectOptions.language)) {
      const installSpinner = ora(`📦 Installing dependencies with ${projectOptions.packageManager}...`).start();
      
      const installCommands: Record<string, string> = {
        npm: 'npm install',
        yarn: 'yarn',
        pnpm: 'pnpm install'
      };
      const installCmd = installCommands[projectOptions.packageManager] || 'npm install';
      
      execSync(installCmd, { cwd: currentDir, stdio: 'ignore' });
      installSpinner.succeed(chalk.green('Dependencies installed'));
    }
    
    // Success message (professional boxed style)
    console.log('\n' + boxed('🎉 Project initialized successfully!', 'Success'));
    
    console.log(chalk.cyan('\n🚀 Get started with:'));
    
    if (projectOptions.language === 'javascript' || projectOptions.language === 'typescript') {
      console.log(chalk.gray(`   ${projectOptions.packageManager} ${projectOptions.packageManager === 'npm' ? 'run ' : ''}dev`));
    } else if (projectOptions.language === 'python') {
      console.log(chalk.gray('   python main.py'));
    } else if (projectOptions.language === 'go') {
      console.log(chalk.gray('   go run main.go'));
    } else if (projectOptions.language === 'rust') {
      console.log(chalk.gray('   cargo run'));
    }
    
    console.log(chalk.green('\n⚡ Happy coding! Build something amazing! ⚡\n'));
    
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error);
    process.exit(1);
  }
}
