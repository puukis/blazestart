import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const CONFIG_DIR = path.join(os.homedir(), '.blazestart');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const PROFILES_DIR = path.join(CONFIG_DIR, 'profiles');

interface Config {
  defaultProfile?: string;
  githubToken?: string;
  author?: string;
  email?: string;
  profiles?: Record<string, any>;
}

async function ensureConfigDir(): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.ensureDir(PROFILES_DIR);
}

export async function getConfig(): Promise<Config> {
  await ensureConfigDir();
  
  if (await fs.pathExists(CONFIG_FILE)) {
    return await fs.readJson(CONFIG_FILE);
  }
  
  return {};
}

export async function saveConfig(config: Config): Promise<void> {
  await ensureConfigDir();
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

export async function loadProfile(profileName: string): Promise<any> {
  const profilePath = path.join(PROFILES_DIR, `${profileName}.json`);
  
  if (await fs.pathExists(profilePath)) {
    return await fs.readJson(profilePath);
  }
  
  throw new Error(`Profile "${profileName}" not found`);
}

export async function saveProfile(profileName: string, profileData: any): Promise<void> {
  await ensureConfigDir();
  const profilePath = path.join(PROFILES_DIR, `${profileName}.json`);
  await fs.writeJson(profilePath, profileData, { spaces: 2 });
}

export async function listProfiles(): Promise<string[]> {
  await ensureConfigDir();
  
  if (!await fs.pathExists(PROFILES_DIR)) {
    return [];
  }
  
  const files = await fs.readdir(PROFILES_DIR);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}

export async function deleteProfile(profileName: string): Promise<void> {
  const profilePath = path.join(PROFILES_DIR, `${profileName}.json`);
  
  if (await fs.pathExists(profilePath)) {
    await fs.remove(profilePath);
  } else {
    throw new Error(`Profile "${profileName}" not found`);
  }
}

export async function getConfigValue(key: string): Promise<any> {
  const config = await getConfig();
  return config[key as keyof Config];
}

export async function setConfigValue(key: string, value: any): Promise<void> {
  const config = await getConfig();
  (config as any)[key] = value;
  await saveConfig(config);
}

export async function createProfileFromOptions(options: any): Promise<string> {
  const profileName = `profile_${Date.now()}`;
  await saveProfile(profileName, options);
  return profileName;
}

export async function exportProfile(profileName: string): Promise<string> {
  const profile = await loadProfile(profileName);
  return JSON.stringify(profile, null, 2);
}

export async function importProfile(profileName: string, jsonString: string): Promise<void> {
  try {
    const profileData = JSON.parse(jsonString);
    await saveProfile(profileName, profileData);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}
