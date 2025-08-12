import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { simpleGit } from 'simple-git';
import { execSync } from 'child_process';
import { generateProject } from '../utils/generator';
import { getConfig, loadProfile } from '../utils/config';
import { LANGUAGES, FRAMEWORKS, LICENSES, PACKAGE_MANAGERS } from '../config/templates';
import { makeSpinner, boxed, logSuccess } from '../utils/ui';

interface ProjectOptions {
  name: string;
  language: string;
  framework: string;
  license: string;
  packageManager: string;
  readme: 'standard' | 'minimal' | 'ai';
  gitignore: boolean;
  linters: string[];
  gitHooks: boolean;
  git: boolean;
  remoteRepo: boolean;
  openInVSCode: boolean;
  installDeps: boolean;
}

export async function createCommand(projectName?: string, options?: any): Promise<void> {
  try {
    // Load profile if specified or prompt to select one
    let config: Partial<ProjectOptions> = {};
    if (options?.config) {
      config = await loadProfile(options.config);
      console.log(chalk.cyan(`📋 Loaded profile: ${options.config}`));
    } else {
      // Silently load default profile if configured
      try {
        const appConfig = await getConfig();
        if (appConfig.defaultProfile) {
          config = await loadProfile(appConfig.defaultProfile);
          console.log(chalk.cyan(`📋 Loaded default profile: ${appConfig.defaultProfile}`));
        }
      } catch {
        // ignore
      }
    }

    const profileActive = Object.keys(config).length > 0;

    // Interactive wizard
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '📁 Project name:',
        default: projectName || config.name || 'my-awesome-project',
        validate: (input: string) => {
          if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'useCustomPath',
        message: '📂 Create the project at a custom path?',
        default: false
      },
      {
        type: 'input',
        name: 'customPath',
        message: '🔗 Paste the desired path:',
        when: (ans: any) => ans.useCustomPath,
        validate: async (input: string) => {
          if (!input || !input.trim()) return 'Please enter a path';
          // Basic sanity check; actual resolution happens later
          return true;
        }
      },
      {
        type: 'list',
        name: 'language',
        message: '💻 Choose your language:',
        choices: LANGUAGES.map(lang => ({
          name: `${lang.icon} ${lang.name}`,
          value: lang.id
        })),
        default: options?.language || config.language || 'typescript',
        when: !options?.language && config.language === undefined
      },
      {
        type: 'list',
        name: 'framework',
        message: '🚀 Choose your framework:',
        choices: (answers: any) => {
          const lang = options?.language || config.language || answers.language;
          const frameworks = FRAMEWORKS.filter(f => f.languages.includes(lang));
          return [
            { name: '⚡ None (vanilla)', value: 'none' },
            ...frameworks.map(f => ({
              name: `${f.icon} ${f.name}`,
              value: f.id
            }))
          ];
        },
        default: options?.framework || config.framework || 'none',
        when: !options?.framework && config.framework === undefined
      },
      {
        type: 'list',
        name: 'license',
        message: '📜 Choose a license:',
        choices: LICENSES.map(lic => ({
          name: `${lic.icon} ${lic.name}`,
          value: lic.id
        })),
        default: options?.license || config.license || 'mit',
        when: !options?.license && config.license === undefined
      },
      {
        type: 'list',
        name: 'packageManager',
        message: '📦 Package manager:',
        choices: (answers: any) => {
          const lang = options?.language || config.language || answers.language;
          return PACKAGE_MANAGERS
            .filter(pm => pm.languages.includes(lang))
            .map(pm => ({
              name: `${pm.icon} ${pm.name}`,
              value: pm.id
            }));
        },
        default: config.packageManager || 'npm',
        when: (answers: any) => {
          const lang = options?.language || config.language || answers.language;
          return ['javascript', 'typescript'].includes(lang) && !options?.packageManager && config.packageManager === undefined;
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
        default: config.readme || 'standard',
        when: config.readme === undefined
      },
      {
        type: 'confirm',
        name: 'gitHooks',
        message: '🪝 Setup Git hooks (husky/pre-commit)?',
        default: (answers: any) => {
          const lang = options?.language || config.language || answers.language;
          if (['javascript', 'typescript', 'python'].includes(lang)) {
            return config.gitHooks !== undefined ? config.gitHooks : true;
          }
          return false;
        },
        when: (answers: any) => {
          const lang = options?.language || config.language || answers.language;
          return ['javascript', 'typescript', 'python'].includes(lang) && config.gitHooks === undefined;
        }
      },
      {
        type: 'confirm',
        name: 'git',
        message: '🔀 Initialize Git repository?',
        default: options?.git !== undefined ? options.git : (config.git !== undefined ? config.git : true),
        when: options?.git === undefined && config.git === undefined
      },
      {
        type: 'confirm',
        name: 'remoteRepo',
        message: '🌐 Create GitHub repository and push?',
        default: config.remoteRepo || false,
        when: (answers: any) => (options?.git || config.git || answers.git) && config.remoteRepo === undefined
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: '📥 Install dependencies?',
        default: options?.install !== undefined ? options.install : (config.installDeps !== undefined ? config.installDeps : true),
        when: options?.install === undefined && config.installDeps === undefined
      },
      {
        type: 'confirm',
        name: 'openInVSCode',
        message: '💻 Open in VS Code?',
        default: options?.open || config.openInVSCode || false,
        when: !options?.open && config.openInVSCode === undefined
      }
    ]);

    // Merge all options
    const projectOptions: ProjectOptions = {
      name: answers.name || projectName,
      language: options?.language || config.language || answers.language,
      framework: options?.framework || config.framework || answers.framework,
      license: options?.license || config.license || answers.license,
      packageManager: config.packageManager || answers.packageManager || 'npm',
      readme: config.readme || answers.readme || 'standard',
      gitignore: true,
      linters: config.linters || [],
      gitHooks: config.gitHooks !== undefined ? config.gitHooks : (answers.gitHooks || false),
      git: options?.git !== undefined ? options.git : (config.git !== undefined ? config.git : answers.git),
      remoteRepo: config.remoteRepo || answers.remoteRepo || false,
      openInVSCode: options?.open || config.openInVSCode || answers.openInVSCode || false,
      installDeps: options?.install !== undefined ? options.install : (config.installDeps !== undefined ? config.installDeps : answers.installDeps)
    };

    // Create project directory (supports custom path) with confirmations
    let projectPath: string;
    if ((answers as any).useCustomPath && (answers as any).customPath) {
      // Resolve input path
      const raw = String((answers as any).customPath).trim();
      const expanded = raw.replace(/^~(?=$|[\\/])/, os.homedir());
      let resolvedBase = path.isAbsolute(expanded)
        ? expanded
        : path.resolve(process.cwd(), expanded);

      // Loop until we have a valid base directory decision
      while (true) {
        const exists = await fs.pathExists(resolvedBase);
        if (exists) {
          const stat = await fs.stat(resolvedBase);
          if (!stat.isDirectory()) {
            const retry = await inquirer.prompt([
              {
                type: 'input',
                name: 'newPath',
                message: chalk.yellow('⚠️  Path points to a file. Enter a directory path instead:'),
                default: resolvedBase
              }
            ]);
            resolvedBase = path.isAbsolute(retry.newPath)
              ? retry.newPath
              : path.resolve(process.cwd(), retry.newPath);
            continue;
          }
          // Confirm final target
          const target = path.join(resolvedBase, projectOptions.name);
          const confirm = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'ok',
              message: `Create project at: ${target}?`,
              default: true
            }
          ]);
          if (!confirm.ok) {
            const choice = await inquirer.prompt([
              {
                type: 'list',
                name: 'action',
                message: 'Choose an action:',
                choices: [
                  { name: 'Re-enter custom path', value: 'reenter' },
                  { name: 'Use current directory instead', value: 'cwd' },
                  { name: 'Cancel', value: 'cancel' }
                ]
              }
            ]);
            if (choice.action === 'reenter') {
              const retry = await inquirer.prompt([
                { type: 'input', name: 'newPath', message: 'Enter custom path:' }
              ]);
              const exp = String(retry.newPath).trim().replace(/^~(?=$|[\\/])/, os.homedir());
              resolvedBase = path.isAbsolute(exp) ? exp : path.resolve(process.cwd(), exp);
              continue;
            } else if (choice.action === 'cwd') {
              projectPath = path.join(process.cwd(), projectOptions.name);
              break;
            } else {
              console.log(chalk.red('✖ Project creation cancelled'));
              return;
            }
          } else {
            projectPath = target;
            break;
          }
        } else {
          const resp = await inquirer.prompt([
            {
              type: 'list',
              name: 'missing',
              message: `Path does not exist: ${resolvedBase}`,
              choices: [
                { name: 'Create directories and use this path', value: 'create' },
                { name: 'Re-enter a different path', value: 'reenter' },
                { name: 'Use current directory instead', value: 'cwd' },
                { name: 'Cancel', value: 'cancel' }
              ]
            }
          ]);
          if (resp.missing === 'create') {
            await fs.ensureDir(resolvedBase);
            projectPath = path.join(resolvedBase, projectOptions.name);
            break;
          } else if (resp.missing === 'reenter') {
            const retry = await inquirer.prompt([
              { type: 'input', name: 'newPath', message: 'Enter custom path:' }
            ]);
            const exp = String(retry.newPath).trim().replace(/^~(?=$|[\\/])/, os.homedir());
            resolvedBase = path.isAbsolute(exp) ? exp : path.resolve(process.cwd(), exp);
            continue;
          } else if (resp.missing === 'cwd') {
            projectPath = path.join(process.cwd(), projectOptions.name);
            break;
          } else {
            console.log(chalk.red('✖ Project creation cancelled'));
            return;
          }
        }
      }
    } else {
      projectPath = path.join(process.cwd(), projectOptions.name);
    }
    
    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
      const overwrite = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow(`⚠️  Directory ${projectOptions.name} already exists. Overwrite?`),
          default: false
        }
      ]);
      
      if (!overwrite.overwrite) {
        console.log(chalk.red('✖ Project creation cancelled'));
        return;
      }
      
      await fs.remove(projectPath);
    }

    // Create directory
    await fs.ensureDir(projectPath);
    console.log(chalk.green(`\n✔ Created project directory: ${projectOptions.name}`));

    // Generate project files
    const spinner = makeSpinner('🔥 Generating project files...').start();
    await generateProject(projectPath, projectOptions);
    spinner.succeed(chalk.green('Project files generated'));

    // Initialize Git
    if (projectOptions.git) {
      const gitSpinner = makeSpinner('🔀 Initializing Git repository...').start();
      const git = simpleGit(projectPath);
      await git.init();
      await git.add('.');
      await git.commit('🎉 Initial commit - Project scaffolded with BlazeStart');
      gitSpinner.succeed(chalk.green('Git repository initialized'));
    }

    // Install dependencies
    if (projectOptions.installDeps && ['javascript', 'typescript'].includes(projectOptions.language)) {
      const installSpinner = makeSpinner(`📦 Installing dependencies with ${projectOptions.packageManager}...`).start();
      
      const installCmd = {
        npm: 'npm install',
        yarn: 'yarn',
        pnpm: 'pnpm install'
      }[projectOptions.packageManager] || 'npm install';
      
      execSync(installCmd, { cwd: projectPath, stdio: 'ignore' });
      installSpinner.succeed(chalk.green('Dependencies installed'));
    }

    // Create remote repository (if requested)
    if (projectOptions.remoteRepo) {
      const remoteSpinner = makeSpinner('🌐 Creating GitHub repository...').start();
      try {
        // Ensure gh is installed
        execSync('gh --version', { stdio: 'ignore' });
        // Ensure user is authenticated
        execSync('gh auth status -h github.com', { stdio: 'ignore' });

        const safeName = projectOptions.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        // Create repo under the authenticated user/org and push current branch
        // --source uses the projectPath, --remote sets origin, --push pushes HEAD
        execSync(`gh repo create ${safeName} --public --source="${projectPath}" --remote=origin --push`, {
          stdio: 'ignore'
        });
        remoteSpinner.succeed(chalk.green('GitHub repository created and pushed'));
      } catch (e) {
        remoteSpinner.info(chalk.yellow('Could not auto-create GitHub repository (gh not installed or not authenticated).'));
        console.log(chalk.dim(`
  To push to GitHub manually:
  1) Create a new repository on GitHub (no README/license)
  2) Run these commands:
     cd ${projectOptions.name}
     git remote add origin https://github.com/<your-user>/<repo>.git
     git branch -M main
     git push -u origin main
        `));
      }
    }

    // Open in VS Code
    if (projectOptions.openInVSCode) {
      try {
        execSync(`code ${projectPath}`, { stdio: 'ignore' });
        console.log(chalk.green('✔ Opened in VS Code'));
      } catch {
        console.log(chalk.yellow('⚠️  Could not open VS Code. Make sure it\'s installed and in PATH'));
      }
    }

    // Success message
    const nextSteps: string[] = [
      chalk.gray(`cd ${projectPath}`)
    ];
    if (projectOptions.language === 'javascript' || projectOptions.language === 'typescript') {
      nextSteps.push(
        chalk.gray(
          `${projectOptions.packageManager} ${projectOptions.packageManager === 'npm' ? 'run ' : ''}dev`
        )
      );
    } else if (projectOptions.language === 'python') {
      nextSteps.push(chalk.gray('python main.py'));
    } else if (projectOptions.language === 'go') {
      nextSteps.push(chalk.gray('go run main.go'));
    } else if (projectOptions.language === 'rust') {
      nextSteps.push(chalk.gray('cargo run'));
    }

    const summary = [
      chalk.bold.green('🎉 Project created successfully!'),
      '',
      `${chalk.cyan('📂 Location:')} ${chalk.white(projectPath)}`,
      chalk.cyan('🚀 Get started:'),
      `  ${nextSteps.join('\n  ')}`,
      '',
      chalk.green('⚡ Happy coding! Build something amazing!')
    ].join('\n');

    console.log('\n' + boxed(summary));

  } catch (error) {
    console.error(chalk.red('Error creating project:'), error);
    process.exit(1);
  }
}
