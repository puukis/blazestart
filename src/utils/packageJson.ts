interface PackageJson {
  name: string;
  version: string;
  description: string;
  main?: string;
  scripts: Record<string, string>;
  keywords: string[];
  author: string;
  license: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  type?: string;
}

export async function generatePackageJson(
  name: string,
  framework: string,
  language: string,
  linters: string[]
): Promise<PackageJson> {
  const packageJson: PackageJson = {
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: '1.0.0',
    description: `A ${framework === 'none' ? language : framework} project created with BlazeStart`,
    scripts: {},
    keywords: [framework, language, 'blazestart'],
    author: '',
    license: 'MIT'
  };

  // Set main entry point
  if (language === 'typescript') {
    packageJson.main = 'dist/index.js';
    packageJson.scripts.build = 'tsc';
    packageJson.scripts.dev = 'ts-node src/index.ts';
    packageJson.scripts.start = 'node dist/index.js';
    packageJson.scripts.watch = 'tsc -w';
  } else {
    packageJson.main = 'src/index.js';
    packageJson.scripts.start = 'node src/index.js';
    packageJson.scripts.dev = 'nodemon src/index.js';
  }

  // Add framework-specific dependencies and scripts
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  // Framework dependencies
  switch (framework) {
    case 'express':
      deps.express = '^4.18.2';
      deps.cors = '^2.8.5';
      deps.dotenv = '^16.3.1';
      packageJson.scripts.dev = language === 'typescript' ? 'ts-node-dev src/index.ts' : 'nodemon src/index.js';
      break;

    case 'nestjs':
      deps['@nestjs/common'] = '^10.0.0';
      deps['@nestjs/core'] = '^10.0.0';
      deps['@nestjs/platform-express'] = '^10.0.0';
      deps['reflect-metadata'] = '^0.1.13';
      deps.rxjs = '^7.8.1';
      packageJson.scripts.start = 'nest start';
      packageJson.scripts.dev = 'nest start --watch';
      packageJson.scripts.build = 'nest build';
      break;

    case 'react':
      deps.react = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
      devDeps.vite = '^5.0.0';
      devDeps['@vitejs/plugin-react'] = '^4.2.0';
      packageJson.scripts.dev = 'vite';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      break;

    case 'next':
      deps.next = '^14.0.0';
      deps.react = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
      packageJson.scripts.dev = 'next dev';
      packageJson.scripts.build = 'next build';
      packageJson.scripts.start = 'next start';
      packageJson.scripts.lint = 'next lint';
      break;

    case 'vue':
      deps.vue = '^3.3.0';
      devDeps.vite = '^5.0.0';
      devDeps['@vitejs/plugin-vue'] = '^4.5.0';
      packageJson.scripts.dev = 'vite';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      break;

    case 'nuxt':
      devDeps.nuxt = '^3.8.0';
      packageJson.scripts.dev = 'nuxt dev';
      packageJson.scripts.build = 'nuxt build';
      packageJson.scripts.preview = 'nuxt preview';
      packageJson.scripts.generate = 'nuxt generate';
      break;

    case 'svelte':
      devDeps.svelte = '^4.2.0';
      devDeps.vite = '^5.0.0';
      devDeps['@sveltejs/vite-plugin-svelte'] = '^3.0.0';
      packageJson.scripts.dev = 'vite';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      break;

    case 'sveltekit':
      devDeps['@sveltejs/adapter-auto'] = '^3.0.0';
      devDeps['@sveltejs/kit'] = '^2.0.0';
      devDeps['@sveltejs/vite-plugin-svelte'] = '^3.0.0';
      devDeps.svelte = '^4.2.0';
      devDeps.vite = '^5.0.0';
      packageJson.scripts.dev = 'vite dev';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      break;

    case 'angular':
      deps['@angular/animations'] = '^17.0.0';
      deps['@angular/common'] = '^17.0.0';
      deps['@angular/compiler'] = '^17.0.0';
      deps['@angular/core'] = '^17.0.0';
      deps['@angular/forms'] = '^17.0.0';
      deps['@angular/platform-browser'] = '^17.0.0';
      deps['@angular/platform-browser-dynamic'] = '^17.0.0';
      deps['@angular/router'] = '^17.0.0';
      deps.rxjs = '^7.8.0';
      deps.tslib = '^2.6.0';
      deps['zone.js'] = '^0.14.0';
      devDeps['@angular-devkit/build-angular'] = '^17.0.0';
      devDeps['@angular/cli'] = '^17.0.0';
      devDeps['@angular/compiler-cli'] = '^17.0.0';
      packageJson.scripts.ng = 'ng';
      packageJson.scripts.start = 'ng serve';
      packageJson.scripts.build = 'ng build';
      packageJson.scripts.test = 'ng test';
      break;

    case 'fastify':
      deps.fastify = '^4.24.0';
      deps['@fastify/cors'] = '^8.4.0';
      deps['@fastify/helmet'] = '^11.1.0';
      packageJson.scripts.dev = language === 'typescript' ? 'ts-node-dev src/index.ts' : 'nodemon src/index.js';
      break;

    case 'koa':
      deps.koa = '^2.14.0';
      deps['koa-router'] = '^12.0.0';
      deps['koa-bodyparser'] = '^4.4.0';
      packageJson.scripts.dev = language === 'typescript' ? 'ts-node-dev src/index.ts' : 'nodemon src/index.js';
      break;

    case 'remix':
      deps['@remix-run/node'] = '^2.3.0';
      deps['@remix-run/react'] = '^2.3.0';
      deps['@remix-run/serve'] = '^2.3.0';
      deps.react = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
      devDeps['@remix-run/dev'] = '^2.3.0';
      packageJson.scripts.dev = 'remix dev';
      packageJson.scripts.build = 'remix build';
      packageJson.scripts.start = 'remix-serve build';
      break;

    case 'astro':
      deps.astro = '^4.0.0';
      packageJson.scripts.dev = 'astro dev';
      packageJson.scripts.build = 'astro build';
      packageJson.scripts.preview = 'astro preview';
      break;

    case 'vite':
      devDeps.vite = '^5.0.0';
      packageJson.scripts.dev = 'vite';
      packageJson.scripts.build = 'vite build';
      packageJson.scripts.preview = 'vite preview';
      break;
  }

  // TypeScript dependencies
  if (language === 'typescript') {
    devDeps.typescript = '^5.3.0';
    devDeps['@types/node'] = '^20.10.0';
    devDeps['ts-node'] = '^10.9.0';
    
    if (framework === 'express') {
      devDeps['@types/express'] = '^4.17.21';
      devDeps['@types/cors'] = '^2.8.17';
      devDeps['ts-node-dev'] = '^2.0.0';
    }
    
    if (framework === 'react' || framework === 'next') {
      devDeps['@types/react'] = '^18.2.0';
      devDeps['@types/react-dom'] = '^18.2.0';
    }
  } else {
    // JavaScript dev dependencies
    devDeps.nodemon = '^3.0.0';
  }

  // Linter dependencies
  if (linters.includes('eslint')) {
    devDeps.eslint = '^8.55.0';
    packageJson.scripts.lint = 'eslint .';
    
    if (language === 'typescript') {
      devDeps['@typescript-eslint/eslint-plugin'] = '^6.14.0';
      devDeps['@typescript-eslint/parser'] = '^6.14.0';
    }
    
    if (framework === 'react' || framework === 'next') {
      devDeps['eslint-plugin-react'] = '^7.33.0';
      devDeps['eslint-plugin-react-hooks'] = '^4.6.0';
    }
    
    if (framework === 'vue' || framework === 'nuxt') {
      devDeps['eslint-plugin-vue'] = '^9.19.0';
    }
  }

  if (linters.includes('prettier')) {
    devDeps.prettier = '^3.1.0';
    packageJson.scripts.format = 'prettier --write .';
    
    if (linters.includes('eslint')) {
      devDeps['eslint-config-prettier'] = '^9.1.0';
      devDeps['eslint-plugin-prettier'] = '^5.0.0';
    }
  }

  // Add test script
  packageJson.scripts.test = 'echo "Error: no test specified" && exit 1';

  // Set dependencies
  if (Object.keys(deps).length > 0) {
    packageJson.dependencies = deps;
  }
  
  if (Object.keys(devDeps).length > 0) {
    packageJson.devDependencies = devDeps;
  }

  // Set module type for ESM
  if (framework === 'vue' || framework === 'svelte' || framework === 'vite') {
    packageJson.type = 'module';
  }

  return packageJson;
}
