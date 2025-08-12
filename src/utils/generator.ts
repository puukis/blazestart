import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { GITIGNORE_TEMPLATES } from '../config/templates';
import { generateLicense } from './licenses';
import { generateReadme } from './readme';
import { generatePackageJson } from './packageJson';

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

export async function generateProject(projectPath: string, options: ProjectOptions): Promise<void> {
  // Create main project structure
  await createProjectStructure(projectPath, options);
  
  // Generate .gitignore
  if (options.gitignore) {
    await generateGitignore(projectPath, options.language);
  }
  
  // Generate LICENSE
  if (options.license !== 'none') {
    await generateLicenseFile(projectPath, options.license);
  }
  
  // Generate README
  await generateReadmeFile(projectPath, options);
  
  // Generate package.json or equivalent
  await generateProjectManifest(projectPath, options);
  
  // Generate main entry file
  await generateEntryFile(projectPath, options);
  
  // Generate config files
  await generateConfigFiles(projectPath, options);
  
  // Setup linters
  if (options.linters.length > 0) {
    await setupLinters(projectPath, options);
  }
  
  // Setup git hooks
  if (options.gitHooks) {
    await setupGitHooks(projectPath, options);
  }
}

async function createProjectStructure(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language, framework } = options;
  
  // Create basic directory structure
  const directories = ['src', 'tests', 'docs'];
  
  // Add framework-specific directories
  if (framework === 'react' || framework === 'next' || framework === 'vue') {
    directories.push('src/components', 'src/pages', 'src/styles', 'public');
  }
  
  if (framework === 'express' || framework === 'fastapi' || framework === 'flask') {
    directories.push('src/routes', 'src/controllers', 'src/models', 'src/middleware');
  }
  
  if (language === 'python') {
    directories.push('src/utils', 'requirements');
  }
  
  // Create all directories
  for (const dir of directories) {
    await fs.ensureDir(path.join(projectPath, dir));
  }
}

async function generateGitignore(projectPath: string, language: string): Promise<void> {
  const gitignoreContent = GITIGNORE_TEMPLATES[language] || GITIGNORE_TEMPLATES['javascript'];
  await fs.writeFile(
    path.join(projectPath, '.gitignore'),
    gitignoreContent.join('\n')
  );
}

async function generateLicenseFile(projectPath: string, licenseType: string): Promise<void> {
  const licenseContent = await generateLicense(licenseType);
  await fs.writeFile(path.join(projectPath, 'LICENSE'), licenseContent);
}

async function generateReadmeFile(projectPath: string, options: ProjectOptions): Promise<void> {
  const readmeContent = await generateReadme(options);
  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
}

async function generateProjectManifest(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language, framework, name, linters } = options;
  
  if (language === 'javascript' || language === 'typescript') {
    const packageJson = await generatePackageJson(name, framework, language, linters);
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  } else if (language === 'python') {
    // Generate requirements.txt or pyproject.toml
    const requirements = generatePythonRequirements(framework);
    await fs.writeFile(path.join(projectPath, 'requirements.txt'), requirements);
    
    // Generate pyproject.toml for modern Python projects
    const pyprojectContent = generatePyProjectToml(name, framework);
    await fs.writeFile(path.join(projectPath, 'pyproject.toml'), pyprojectContent);
  } else if (language === 'go') {
    // Generate go.mod
    const goModContent = `module ${name}\n\ngo 1.21\n`;
    await fs.writeFile(path.join(projectPath, 'go.mod'), goModContent);
  } else if (language === 'rust') {
    // Generate Cargo.toml
    const cargoToml = generateCargoToml(name, framework);
    await fs.writeFile(path.join(projectPath, 'Cargo.toml'), cargoToml);
  }
}

async function generateEntryFile(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language, framework } = options;
  let entryFile = '';
  let entryContent = '';
  
  if (language === 'javascript' || language === 'typescript') {
    entryFile = language === 'typescript' ? 'src/index.ts' : 'src/index.js';
    entryContent = generateJSEntryFile(framework, language);
  } else if (language === 'python') {
    entryFile = 'src/main.py';
    entryContent = generatePythonEntryFile(framework);
  } else if (language === 'go') {
    entryFile = 'main.go';
    entryContent = generateGoEntryFile(framework);
  } else if (language === 'rust') {
    entryFile = 'src/main.rs';
    entryContent = generateRustEntryFile(framework);
  }
  
  if (entryFile && entryContent) {
    await fs.writeFile(path.join(projectPath, entryFile), entryContent);
  }
}

async function generateConfigFiles(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language, framework } = options;
  
  if (language === 'typescript') {
    // Generate tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }
  
  // Add framework-specific configs
  if (framework === 'next') {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`;
    await fs.writeFile(path.join(projectPath, 'next.config.js'), nextConfig);
  }
  
  if (framework === 'vite' || framework === 'vue') {
    const viteConfig = `import { defineConfig } from 'vite'
${framework === 'vue' ? "import vue from '@vitejs/plugin-vue'" : ''}

export default defineConfig({
  plugins: [${framework === 'vue' ? 'vue()' : ''}],
})`;
    await fs.writeFile(path.join(projectPath, 'vite.config.js'), viteConfig);
  }
}

async function setupLinters(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language, linters } = options;
  
  if (language === 'javascript' || language === 'typescript') {
    if (linters.includes('eslint')) {
      const eslintConfig = {
        env: {
          browser: true,
          es2021: true,
          node: true
        },
        extends: [
          'eslint:recommended',
          language === 'typescript' ? 'plugin:@typescript-eslint/recommended' : ''
        ].filter(Boolean),
        parser: language === 'typescript' ? '@typescript-eslint/parser' : undefined,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module'
        },
        plugins: language === 'typescript' ? ['@typescript-eslint'] : [],
        rules: {}
      };
      await fs.writeFile(
        path.join(projectPath, '.eslintrc.json'),
        JSON.stringify(eslintConfig, null, 2)
      );
    }
    
    if (linters.includes('prettier')) {
      const prettierConfig = {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2
      };
      await fs.writeFile(
        path.join(projectPath, '.prettierrc'),
        JSON.stringify(prettierConfig, null, 2)
      );
    }
  }
}

async function setupGitHooks(projectPath: string, options: ProjectOptions): Promise<void> {
  const { language } = options;
  
  if (language === 'javascript' || language === 'typescript') {
    // Add husky configuration
    const huskyConfig = {
      hooks: {
        'pre-commit': 'npm run lint',
        'pre-push': 'npm test'
      }
    };
    await fs.writeFile(
      path.join(projectPath, '.huskyrc.json'),
      JSON.stringify(huskyConfig, null, 2)
    );
  } else if (language === 'python') {
    // Add pre-commit configuration
    const preCommitConfig = `repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8`;
    await fs.writeFile(path.join(projectPath, '.pre-commit-config.yaml'), preCommitConfig);
  }
}

// Helper functions for generating language-specific content
function generateJSEntryFile(framework: string, language: string): string {
  const importStatement = language === 'typescript' 
    ? "import express from 'express';" 
    : "const express = require('express');";
  
  if (framework === 'express') {
    return `${importStatement}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req${language === 'typescript' ? ': any' : ''}, res${language === 'typescript' ? ': any' : ''}) => {
  res.json({ message: 'Welcome to your new Express app!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`;
  }
  
  return `// Welcome to your new ${language === 'typescript' ? 'TypeScript' : 'JavaScript'} project!
console.log('🚀 Project initialized with BlazeStart!');`;
}

function generatePythonEntryFile(framework: string): string {
  if (framework === 'flask') {
    return `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({'message': 'Welcome to your new Flask app!'})

if __name__ == '__main__':
    app.run(debug=True)`;
  }
  
  if (framework === 'fastapi') {
    return `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to your new FastAPI app!"}`;
  }
  
  return `#!/usr/bin/env python3
"""
Main entry point for the application
"""

def main():
    print("🚀 Project initialized with BlazeStart!")

if __name__ == "__main__":
    main()`;
}

function generateGoEntryFile(framework: string): string {
  if (framework === 'gin') {
    return `package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Welcome to your new Gin app!",
        })
    })
    r.Run()
}`;
  }
  
  return `package main

import "fmt"

func main() {
    fmt.Println("🚀 Project initialized with BlazeStart!")
}`;
}

function generateRustEntryFile(framework: string): string {
  if (framework === 'actix') {
    return `use actix_web::{web, App, HttpResponse, HttpServer};

async fn hello() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Welcome to your new Actix app!"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route("/", web::get().to(hello))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}`;
  }
  
  return `fn main() {
    println!("🚀 Project initialized with BlazeStart!");
}`;
}

function generatePythonRequirements(framework: string): string {
  const deps: string[] = [];
  
  if (framework === 'flask') {
    deps.push('Flask==2.3.0', 'python-dotenv==1.0.0');
  } else if (framework === 'django') {
    deps.push('Django==4.2.0');
  } else if (framework === 'fastapi') {
    deps.push('fastapi==0.100.0', 'uvicorn==0.23.0');
  }
  
  return deps.join('\n');
}

function generatePyProjectToml(name: string, framework: string): string {
  return `[tool.poetry]
name = "${name}"
version = "0.1.0"
description = "A new Python project"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.9"
${framework === 'flask' ? 'Flask = "^2.3.0"' : ''}
${framework === 'django' ? 'Django = "^4.2.0"' : ''}
${framework === 'fastapi' ? 'fastapi = "^0.100.0"\nuvicorn = "^0.23.0"' : ''}

[tool.poetry.dev-dependencies]
pytest = "^7.3.0"
black = "^23.3.0"
flake8 = "^6.0.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"`;
}

function generateCargoToml(name: string, framework: string): string {
  return `[package]
name = "${name}"
version = "0.1.0"
edition = "2021"

[dependencies]
${framework === 'actix' ? 'actix-web = "4"\nserde = { version = "1", features = ["derive"] }\nserde_json = "1"' : ''}
${framework === 'rocket' ? 'rocket = "0.5"' : ''}`;
}
