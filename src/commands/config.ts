import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import {
  getConfig,
  saveConfig,
  loadProfile,
  saveProfile,
  listProfiles,
  deleteProfile,
  getConfigValue,
  setConfigValue,
  exportProfile,
  importProfile
} from '../utils/config';

export async function configCommand(action?: string, options?: any): Promise<void> {
  try {
    // Quick path: --setprofile to set or clear defaultProfile
    if (options?.setprofile !== undefined) {
      const profileArg = String(options.setprofile).trim();
      const config = await getConfig();
      if (profileArg.toLowerCase() === 'none' || profileArg === '') {
        delete (config as any).defaultProfile;
        await saveConfig(config);
        console.log(chalk.yellow('⭐ Default profile cleared.')); 
      } else {
        const profiles = await listProfiles();
        if (!profiles.includes(profileArg)) {
          console.log(chalk.red(`Profile "${profileArg}" not found.`));
          console.log(chalk.dim('Use `blazestart config list` to see available profiles.'));
          return;
        }
        (config as any).defaultProfile = profileArg;
        await saveConfig(config);
        console.log(chalk.green(`⭐ Default profile set to: ${profileArg}`));
      }
      return;
    }

    const act = (action || '').toLowerCase();
    if (!act) {
      // No action provided and no --setprofile handled above
      showConfigHelp();
      return;
    }

    switch (act) {
      case 'list':
      case 'ls':
        await listConfigProfiles();
        break;
        
      case 'save':
      case 'create':
        await saveConfigProfile(options);
        break;
        
      case 'load':
      case 'use':
        await useConfigProfile(options);
        break;
        
      case 'delete':
      case 'remove':
      case 'rm':
        await removeConfigProfile(options);
        break;
        
      case 'show':
      case 'view':
        await showConfigProfile(options);
        break;
        
      case 'set':
        await setConfigOption(options);
        break;
        
      case 'get':
        await getConfigOption(options);
        break;
        
      case 'export':
        await exportConfigProfile(options);
        break;
        
      case 'import':
        await importConfigProfile(options);
        break;
        
      default:
        console.log(chalk.red(`Unknown config action: ${action}`));
        showConfigHelp();
    }
  } catch (error) {
    console.error(chalk.red('Error managing configuration:'), error);
    process.exit(1);
  }
}

async function listConfigProfiles(): Promise<void> {
  const spinner = ora('Loading profiles...').start();
  
  try {
    const profiles = await listProfiles();
    const config = await getConfig();
    spinner.stop();
    
    if (profiles.length === 0) {
      console.log(chalk.yellow('\n📋 No saved profiles found'));
      console.log(chalk.dim('Create a profile with: blazestart config save --name <profile-name>'));
      return;
    }
    
    console.log(chalk.cyan('\n📋 Saved Configuration Profiles:\n'));
    
    for (const profile of profiles) {
      const isDefault = config.defaultProfile === profile;
      const marker = isDefault ? chalk.green(' (default)') : '';
      console.log(`  ${chalk.white('•')} ${chalk.bold(profile)}${marker}`);
    }
    
    console.log(chalk.dim('\n💡 Use a profile with: blazestart create --config <profile-name>'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to load profiles'));
    throw error;
  }
}

async function saveConfigProfile(options?: any): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '📝 Profile name:',
      default: options?.name,
      when: !options?.name,
      validate: (input: string) => {
        if (!input || input.trim() === '') {
          return 'Profile name is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Profile name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'language',
      message: '💻 Default language:',
      choices: [
        { name: '🟨 JavaScript', value: 'javascript' },
        { name: '🔷 TypeScript', value: 'typescript' },
        { name: '🐍 Python', value: 'python' },
        { name: '🐹 Go', value: 'go' },
        { name: '🦀 Rust', value: 'rust' },
        { name: '💎 Ruby', value: 'ruby' },
        { name: '🟦 C#', value: 'csharp' },
        { name: '🐘 PHP', value: 'php' }
      ],
      default: 'typescript'
    },
    {
      type: 'list',
      name: 'framework',
      message: '🚀 Default framework:',
      choices: [
        { name: '⚡ None', value: 'none' },
        { name: '⚛️ React', value: 'react' },
        { name: '▲ Next.js', value: 'next' },
        { name: '💚 Vue.js', value: 'vue' },
        { name: '🔥 Svelte', value: 'svelte' },
        { name: '🅰️ Angular', value: 'angular' },
        { name: '🚂 Express', value: 'express' },
        { name: '😺 NestJS', value: 'nestjs' },
        { name: '🌶️ Flask', value: 'flask' },
        { name: '🎸 Django', value: 'django' },
        { name: '⚡ FastAPI', value: 'fastapi' }
      ],
      default: 'none'
    },
    {
      type: 'list',
      name: 'license',
      message: '📜 Default license:',
      choices: [
        { name: '📜 MIT', value: 'mit' },
        { name: '🪶 Apache 2.0', value: 'apache2' },
        { name: '🐃 GPL v3', value: 'gpl3' },
        { name: '👹 BSD 3-Clause', value: 'bsd3' },
        { name: '🔓 Unlicense', value: 'unlicense' },
        { name: '🚫 No License', value: 'none' }
      ],
      default: 'mit'
    },
    {
      type: 'list',
      name: 'packageManager',
      message: '📦 Default package manager (for JS/TS):',
      choices: [
        { name: '📦 npm', value: 'npm' },
        { name: '🐱 Yarn', value: 'yarn' },
        { name: '🚀 pnpm', value: 'pnpm' }
      ],
      default: 'npm'
    },
    {
      type: 'confirm',
      name: 'git',
      message: '🔀 Always initialize Git?',
      default: true
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: '📥 Always install dependencies?',
      default: true
    },
    {
      type: 'confirm',
      name: 'setAsDefault',
      message: '⭐ Set as default profile?',
      default: false
    }
  ]);
  
  const profileName = options?.name || answers.name;
  const profileData = {
    language: answers.language,
    framework: answers.framework,
    license: answers.license,
    packageManager: answers.packageManager,
    git: answers.git,
    installDeps: answers.installDeps,
    readme: 'standard',
    gitignore: true
  };
  
  const spinner = ora(`Saving profile "${profileName}"...`).start();
  
  try {
    await saveProfile(profileName, profileData);
    
    if (answers.setAsDefault) {
      const config = await getConfig();
      config.defaultProfile = profileName;
      await saveConfig(config);
    }
    
    spinner.succeed(chalk.green(`Profile "${profileName}" saved successfully`));
    
    if (answers.setAsDefault) {
      console.log(chalk.dim(`✨ Set as default profile`));
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to save profile'));
    throw error;
  }
}

async function useConfigProfile(options?: any): Promise<void> {
  const profiles = await listProfiles();
  
  if (profiles.length === 0) {
    console.log(chalk.yellow('\n📋 No saved profiles found'));
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'profile',
      message: '📋 Select profile to use as default:',
      choices: profiles,
      when: !options?.name
    }
  ]);
  
  const profileName = options?.name || answers.profile;
  
  const spinner = ora(`Setting "${profileName}" as default...`).start();
  
  try {
    await loadProfile(profileName);
    
    const config = await getConfig();
    config.defaultProfile = profileName;
    await saveConfig(config);
    
    spinner.succeed(chalk.green(`Profile "${profileName}" set as default`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to set default profile'));
    throw error;
  }
}

async function removeConfigProfile(options?: any): Promise<void> {
  const profiles = await listProfiles();
  
  if (profiles.length === 0) {
    console.log(chalk.yellow('\n📋 No saved profiles found'));
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'profile',
      message: '📋 Select profile to delete:',
      choices: profiles,
      when: !options?.name
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (answers: any) => chalk.red(`⚠️  Are you sure you want to delete "${options?.name || answers.profile}"?`),
      default: false
    }
  ]);
  
  if (!answers.confirm) {
    console.log(chalk.yellow('Deletion cancelled'));
    return;
  }
  
  const profileName = options?.name || answers.profile;
  const spinner = ora(`Deleting profile "${profileName}"...`).start();
  
  try {
    await deleteProfile(profileName);

    const config = await getConfig();
    if (config.defaultProfile === profileName) {
      config.defaultProfile = undefined;
      await saveConfig(config);
    }
    
    spinner.succeed(chalk.green(`Profile "${profileName}" deleted`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to delete profile'));
    throw error;
  }
}

async function showConfigProfile(options?: any): Promise<void> {
  const profiles = await listProfiles();
  
  if (profiles.length === 0) {
    console.log(chalk.yellow('\n📋 No saved profiles found'));
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'profile',
      message: '📋 Select profile to view:',
      choices: profiles,
      when: !options?.name
    }
  ]);
  
  const profileName = options?.name || answers.profile;
  
  try {
    const profile = await loadProfile(profileName);
    const config = await getConfig();
    const isDefault = config.defaultProfile === profileName;
    
    const profileBox = boxen(
      chalk.cyan.bold(`Profile: ${profileName}`) +
      (isDefault ? chalk.green(' (default)') : '') +
      '\n\n' +
      Object.entries(profile).map(([key, value]) => {
        const formattedKey = chalk.gray(key.charAt(0).toUpperCase() + key.slice(1) + ':');
        const formattedValue = chalk.white(JSON.stringify(value));
        return `${formattedKey} ${formattedValue}`;
      }).join('\n'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    
    console.log('\n' + profileBox);
  } catch (error) {
    console.error(chalk.red(`Failed to load profile "${profileName}"`));
    throw error;
  }
}

async function setConfigOption(options?: any): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: '🔑 Configuration key:',
      when: !options?.set,
      validate: (input: string) => input.trim() !== '' || 'Key is required'
    },
    {
      type: 'input',
      name: 'value',
      message: '📝 Value:',
      when: !options?.set
    }
  ]);
  
  let key: string, value: any;
  
  if (options?.set) {
    const [k, ...v] = options.set.split('=');
    key = k;
    value = v.join('=');
  } else {
    key = answers.key;
    value = answers.value;
  }

  try {
    value = JSON.parse(value);
  } catch {

  }
  
  const spinner = ora(`Setting ${key}...`).start();
  
  try {
    await setConfigValue(key, value);
    spinner.succeed(chalk.green(`Configuration updated: ${key} = ${JSON.stringify(value)}`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to set configuration'));
    throw error;
  }
}

async function getConfigOption(options?: any): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: '🔑 Configuration key:',
      when: !options?.name,
      validate: (input: string) => input.trim() !== '' || 'Key is required'
    }
  ]);
  
  const key = options?.name || answers.key;
  
  try {
    const value = await getConfigValue(key);
    
    if (value === undefined) {
      console.log(chalk.yellow(`Configuration key "${key}" not found`));
    } else {
      console.log(chalk.cyan(`${key}:`), chalk.white(JSON.stringify(value, null, 2)));
    }
  } catch (error) {
    console.error(chalk.red('Failed to get configuration'));
    throw error;
  }
}

async function exportConfigProfile(options?: any): Promise<void> {
  const profiles = await listProfiles();
  
  if (profiles.length === 0) {
    console.log(chalk.yellow('\n📋 No saved profiles found'));
    return;
  }
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'profile',
      message: '📋 Select profile to export:',
      choices: profiles,
      when: !options?.name
    }
  ]);
  
  const profileName = options?.name || answers.profile;
  
  try {
    const profileJson = await exportProfile(profileName);
    
    console.log(chalk.cyan(`\n📋 Profile "${profileName}" (copy the JSON below):\n`));
    console.log(boxen(profileJson, {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'green'
    }));
    
    console.log(chalk.dim('\n💡 Save this JSON to import on another machine'));
  } catch (error) {
    console.error(chalk.red(`Failed to export profile "${profileName}"`));
    throw error;
  }
}

async function importConfigProfile(options?: any): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '📝 Profile name:',
      when: !options?.name,
      validate: (input: string) => {
        if (!input || input.trim() === '') {
          return 'Profile name is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Profile name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'editor',
      name: 'json',
      message: '📋 Paste the profile JSON:'
    }
  ]);
  
  const profileName = options?.name || answers.name;
  const spinner = ora(`Importing profile "${profileName}"...`).start();
  
  try {
    await importProfile(profileName, answers.json);
    spinner.succeed(chalk.green(`Profile "${profileName}" imported successfully`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to import profile'));
    throw error;
  }
}

function showConfigHelp(): void {
  console.log(chalk.cyan('\n📋 Configuration Management Commands:\n'));
  console.log('  ' + chalk.white('blazestart config list') + chalk.gray('         - List all saved profiles'));
  console.log('  ' + chalk.white('blazestart config save') + chalk.gray('         - Save a new profile'));
  console.log('  ' + chalk.white('blazestart config use <name>') + chalk.gray('   - Set a profile as default'));
  console.log('  ' + chalk.white('blazestart config delete <name>') + chalk.gray('- Delete a profile'));
  console.log('  ' + chalk.white('blazestart config show <name>') + chalk.gray('  - Show profile details'));
  console.log('  ' + chalk.white('blazestart config set <key=val>') + chalk.gray('- Set a configuration value'));
  console.log('  ' + chalk.white('blazestart config get <key>') + chalk.gray('    - Get a configuration value'));
  console.log('  ' + chalk.white('blazestart config export <name>') + chalk.gray('- Export a profile as JSON'));
  console.log('  ' + chalk.white('blazestart config import') + chalk.gray('       - Import a profile from JSON'));
  console.log();
}
