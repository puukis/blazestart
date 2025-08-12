import inquirer from 'inquirer';
import chalk from 'chalk';
// Use unified spinner styling
import { makeSpinner, boxed } from '../utils/ui';
import path from 'path';
import fs from 'fs-extra';
import { simpleGit, SimpleGitProgressEvent } from 'simple-git';
import { execSync } from 'child_process';
// removed gradient banner in favor of boxed UI

interface ForkOptions {
  name?: string;
  clean?: boolean;
}

export async function forkCommand(repoUrl: string, options?: ForkOptions): Promise<void> {
  try {
    // Preparing & validate repo URL
    const prepSpinner = makeSpinner('🔧 Preparing fork...').start();
    const isValidUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(repoUrl) ||
                      /^git@[\w\.-]+:[\w\/-]+\.git$/.test(repoUrl) ||
                      /^[\w-]+\/[\w-]+$/.test(repoUrl); // GitHub shorthand
    
    if (!isValidUrl) {
      prepSpinner.fail(chalk.red('❌ Invalid repository URL'));
      console.log(chalk.dim('Examples:'));
      console.log(chalk.gray('  • https://github.com/user/repo'));
      console.log(chalk.gray('  • git@github.com:user/repo.git'));
      console.log(chalk.gray('  • user/repo (GitHub shorthand)'));
      return;
    }
    
    // Convert GitHub shorthand to full URL
    let fullRepoUrl = repoUrl;
    if (/^[\w-]+\/[\w-]+$/.test(repoUrl)) {
      fullRepoUrl = `https://github.com/${repoUrl}.git`;
    }
    
    // Extract repo name from URL
    const repoNameMatch = fullRepoUrl.match(/\/([^\/]+?)(\.git)?$/);
    const defaultName = repoNameMatch ? repoNameMatch[1] : 'forked-project';
    prepSpinner.succeed(chalk.green('Preparation complete'));
    
    // Interactive prompts
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '📁 New project name:',
        default: options?.name || defaultName,
        when: !options?.name,
        validate: (input: string) => {
          if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
          return 'Project name can only contain letters, numbers, hyphens, and underscores';
        }
      },
      {
        type: 'confirm',
        name: 'clean',
        message: '🧹 Remove git history and start fresh?',
        default: options?.clean || false,
        when: options?.clean === undefined
      },
      {
        type: 'input',
        name: 'description',
        message: '📝 Project description (optional):',
        default: ''
      },
      {
        type: 'list',
        name: 'license',
        message: '📜 Update license:',
        choices: [
          { name: '📜 Keep original', value: 'keep' },
          { name: '📜 MIT', value: 'mit' },
          { name: '🪶 Apache 2.0', value: 'apache2' },
          { name: '🐃 GPL v3', value: 'gpl3' },
          { name: '👹 BSD 3-Clause', value: 'bsd3' },
          { name: '🔓 Unlicense', value: 'unlicense' },
          { name: '🚫 No License', value: 'none' }
        ],
        default: 'keep'
      },
      {
        type: 'confirm',
        name: 'updateReadme',
        message: '📖 Update README with new project name?',
        default: true
      },
      {
        type: 'confirm',
        name: 'updatePackageJson',
        message: '📦 Update package.json (if exists)?',
        default: true
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: '📥 Install dependencies after forking?',
        default: true
      },
      {
        type: 'confirm',
        name: 'openInVSCode',
        message: '💻 Open in VS Code?',
        default: false
      }
    ]);
    
    const projectName = options?.name || answers.name;
    const projectPath = path.join(process.cwd(), projectName);
    
    // Check if directory exists
    if (await fs.pathExists(projectPath)) {
      const overwrite = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: chalk.yellow(`⚠️  Directory ${projectName} already exists. Overwrite?`),
          default: false
        }
      ]);
      
      if (!overwrite.overwrite) {
        console.log(chalk.red('✖ Fork cancelled'));
        return;
      }
      
      await fs.remove(projectPath);
    }
    
    // Clone repository with progress
    const cloneSpinner = makeSpinner(`🍴 Forking repository from ${chalk.cyan(repoUrl)} (this may take a minute)...`).start();
    try {
      const git = simpleGit({
        progress: ({ method, stage, progress }: SimpleGitProgressEvent) => {
          const pct = typeof progress === 'number' ? `${progress}%` : '';
          cloneSpinner.text = chalk.gray(`🍴 ${method || 'clone'} ${stage || ''} ${pct}`.trim());
        }
      });
      await git.clone(fullRepoUrl, projectPath);
      cloneSpinner.succeed(chalk.green('Repository cloned successfully'));
    } catch (error) {
      cloneSpinner.fail(chalk.red('Failed to clone repository'));
      console.error(chalk.red('Error:'), error);
      return;
    }
    
    // Clean git history if requested
    if (options?.clean || answers.clean) {
      const cleanSpinner = makeSpinner('🧹 Cleaning git history...').start();
      
      try {
        // Remove .git directory
        await fs.remove(path.join(projectPath, '.git'));
        
        // Initialize new git repo
        const git = simpleGit(projectPath);
        await git.init();
        
        cleanSpinner.succeed(chalk.green('Git history cleaned'));
      } catch (error) {
        cleanSpinner.fail(chalk.yellow('Failed to clean git history'));
      }
    }
    
    // Update README if requested
    if (answers.updateReadme) {
      const readmePath = path.join(projectPath, 'README.md');
      
      if (await fs.pathExists(readmePath)) {
        const updateSpinner = makeSpinner('📖 Updating README...').start();
        
        try {
          let readmeContent = await fs.readFile(readmePath, 'utf-8');
          
          // Update title (first line that starts with #)
          readmeContent = readmeContent.replace(/^#\s+.+$/m, `# ${projectName}`);
          
          // Add fork notice
          const forkNotice = `\n> 🍴 Forked from [${fullRepoUrl}](${fullRepoUrl}) using [BlazeStart](https://github.com/blazestart/blazestart)\n`;
          
          // Insert after title
          const lines = readmeContent.split('\n');
          const titleIndex = lines.findIndex(line => line.startsWith('#'));
          if (titleIndex !== -1) {
            lines.splice(titleIndex + 1, 0, forkNotice);
            readmeContent = lines.join('\n');
          }
          
          // Update description if provided
          if (answers.description) {
            // Look for description after title
            const descriptionRegex = /^#\s+.+\n\n(.+)$/m;
            if (descriptionRegex.test(readmeContent)) {
              readmeContent = readmeContent.replace(descriptionRegex, `# ${projectName}\n\n${answers.description}`);
            }
          }
          
          await fs.writeFile(readmePath, readmeContent);
          updateSpinner.succeed(chalk.green('README updated'));
        } catch (error) {
          updateSpinner.fail(chalk.yellow('Failed to update README'));
        }
      }
    }
    
    // Update package.json if exists
    if (answers.updatePackageJson) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (await fs.pathExists(packageJsonPath)) {
        const updateSpinner = makeSpinner('📦 Updating package.json...').start();
        
        try {
          const packageJson = await fs.readJson(packageJsonPath);
          
          packageJson.name = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
          packageJson.version = '1.0.0';
          
          if (answers.description) {
            packageJson.description = answers.description;
          }
          
          // Remove repository field to avoid confusion
          delete packageJson.repository;
          
          // Update author if possible
          packageJson.author = packageJson.author || '';
          
          await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
          updateSpinner.succeed(chalk.green('package.json updated'));
        } catch (error) {
          updateSpinner.fail(chalk.yellow('Failed to update package.json'));
        }
      }
    }
    
    // Update license if requested
    if (answers.license !== 'keep') {
      const licenseSpinner = makeSpinner('📜 Updating license...').start();
      
      try {
        // Remove existing license files
        const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE'];
        for (const file of licenseFiles) {
          const licensePath = path.join(projectPath, file);
          if (await fs.pathExists(licensePath)) {
            await fs.remove(licensePath);
          }
        }
        
        // Add new license if not 'none'
        if (answers.license !== 'none') {
          // This would ideally fetch the license template
          // For now, we'll just create a placeholder
          const licensePath = path.join(projectPath, 'LICENSE');
          await fs.writeFile(licensePath, `${answers.license.toUpperCase()} License\n\nCopyright (c) ${new Date().getFullYear()}\n`);
        }
        
        licenseSpinner.succeed(chalk.green('License updated'));
      } catch (error) {
        licenseSpinner.fail(chalk.yellow('Failed to update license'));
      }
    }
    
    // Commit changes if git was cleaned
    if (options?.clean || answers.clean) {
      const commitSpinner = makeSpinner('💾 Creating initial commit...').start();
      
      try {
        const git = simpleGit(projectPath);
        await git.add('.');
        await git.commit(`🎉 Initial commit - Forked and customized with BlazeStart`);
        commitSpinner.succeed(chalk.green('Initial commit created'));
      } catch (error) {
        commitSpinner.fail(chalk.yellow('Failed to create initial commit'));
      }
    }
    
    // Install dependencies
    if (answers.installDeps) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (await fs.pathExists(packageJsonPath)) {
        const installSpinner = makeSpinner('📦 Installing dependencies...').start();
        
        try {
          // Detect package manager
          let installCmd = 'npm install';
          
          if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
            installCmd = 'yarn';
          } else if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
            installCmd = 'pnpm install';
          }
          
          execSync(installCmd, { cwd: projectPath, stdio: 'ignore' });
          installSpinner.succeed(chalk.green('Dependencies installed'));
        } catch (error) {
          installSpinner.fail(chalk.yellow('Failed to install dependencies'));
        }
      }
    }
    
    // Open in VS Code
    if (answers.openInVSCode) {
      try {
        execSync(`code ${projectPath}`, { stdio: 'ignore' });
        console.log(chalk.green('✔ Opened in VS Code'));
      } catch {
        console.log(chalk.yellow('⚠️  Could not open VS Code. Make sure it\'s installed and in PATH'));
      }
    }
    
    // Success message (professional boxed style)
    console.log('\n' + boxed('🍴 Repository forked successfully!', 'Success'));
    
    console.log(chalk.cyan('\n📂 Project location:'), chalk.white(projectPath));
    console.log(chalk.cyan('🚀 Get started with:'));
    console.log(chalk.gray(`   cd ${projectName}`));
    
    // Show relevant commands based on project type
    const hasPackageJson = await fs.pathExists(path.join(projectPath, 'package.json'));
    const hasCargoToml = await fs.pathExists(path.join(projectPath, 'Cargo.toml'));
    const hasGoMod = await fs.pathExists(path.join(projectPath, 'go.mod'));
    const hasPyproject = await fs.pathExists(path.join(projectPath, 'pyproject.toml'));
    const hasRequirements = await fs.pathExists(path.join(projectPath, 'requirements.txt'));
    
    if (hasPackageJson) {
      console.log(chalk.gray('   npm run dev'));
    } else if (hasCargoToml) {
      console.log(chalk.gray('   cargo run'));
    } else if (hasGoMod) {
      console.log(chalk.gray('   go run .'));
    } else if (hasPyproject || hasRequirements) {
      console.log(chalk.gray('   python main.py'));
    }
    
    console.log(chalk.green('\n⚡ Happy coding! Make it your own! ⚡\n'));
    
  } catch (error) {
    console.error(chalk.red('Error forking repository:'), error);
    process.exit(1);
  }
}
