export interface Language {
  id: string;
  name: string;
  icon: string;
  extensions: string[];
}

export interface Framework {
  id: string;
  name: string;
  icon: string;
  languages: string[];
  description: string;
}

export interface License {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface PackageManager {
  id: string;
  name: string;
  icon: string;
  languages: string[];
  lockFile: string;
}

export const LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', icon: '', extensions: ['.js', '.jsx'] },
  { id: 'typescript', name: 'TypeScript', icon: '', extensions: ['.ts', '.tsx'] },
  { id: 'python', name: 'Python', icon: '', extensions: ['.py'] },
  { id: 'go', name: 'Go', icon: '', extensions: ['.go'] },
  { id: 'rust', name: 'Rust', icon: '', extensions: ['.rs'] },
  { id: 'ruby', name: 'Ruby', icon: '', extensions: ['.rb'] },
  { id: 'csharp', name: 'C#', icon: '', extensions: ['.cs'] },
  { id: 'php', name: 'PHP', icon: '', extensions: ['.php'] },
  { id: 'java', name: 'Java', icon: '', extensions: ['.java'] },
  { id: 'kotlin', name: 'Kotlin', icon: '', extensions: ['.kt'] },
  { id: 'swift', name: 'Swift', icon: '', extensions: ['.swift'] },
  { id: 'cpp', name: 'C++', icon: '', extensions: ['.cpp', '.cc', '.h'] },
];

export const FRAMEWORKS: Framework[] = [
  { id: 'react', name: 'React', icon: '', languages: ['javascript', 'typescript'], description: 'A JavaScript library for building user interfaces' },
  { id: 'next', name: 'Next.js', icon: '', languages: ['javascript', 'typescript'], description: 'The React framework for production' },
  { id: 'vue', name: 'Vue.js', icon: '', languages: ['javascript', 'typescript'], description: 'The progressive JavaScript framework' },
  { id: 'nuxt', name: 'Nuxt.js', icon: '', languages: ['javascript', 'typescript'], description: 'The intuitive Vue framework' },
  { id: 'svelte', name: 'Svelte', icon: '', languages: ['javascript', 'typescript'], description: 'Cybernetically enhanced web apps' },
  { id: 'sveltekit', name: 'SvelteKit', icon: '', languages: ['javascript', 'typescript'], description: 'The fastest way to build Svelte apps' },
  { id: 'angular', name: 'Angular', icon: '', languages: ['typescript'], description: 'Platform for building mobile and desktop web applications' },
  { id: 'express', name: 'Express', icon: '', languages: ['javascript', 'typescript'], description: 'Fast, unopinionated, minimalist web framework' },
  { id: 'nestjs', name: 'NestJS', icon: '', languages: ['typescript'], description: 'A progressive Node.js framework' },
  { id: 'fastify', name: 'Fastify', icon: '', languages: ['javascript', 'typescript'], description: 'Fast and low overhead web framework' },
  { id: 'koa', name: 'Koa', icon: '', languages: ['javascript', 'typescript'], description: 'Next generation web framework for Node.js' },
  { id: 'remix', name: 'Remix', icon: '', languages: ['javascript', 'typescript'], description: 'Full stack web framework' },
  { id: 'astro', name: 'Astro', icon: '', languages: ['javascript', 'typescript'], description: 'Build faster websites with less client-side JavaScript' },
  { id: 'vite', name: 'Vite', icon: '', languages: ['javascript', 'typescript'], description: 'Next generation frontend tooling' },
  
  { id: 'flask', name: 'Flask', icon: '', languages: ['python'], description: 'Lightweight WSGI web application framework' },
  { id: 'django', name: 'Django', icon: '', languages: ['python'], description: 'High-level Python web framework' },
  { id: 'fastapi', name: 'FastAPI', icon: '', languages: ['python'], description: 'Modern, fast web framework for building APIs' },
  { id: 'pyramid', name: 'Pyramid', icon: '', languages: ['python'], description: 'Python web framework' },
  
  { id: 'gin', name: 'Gin', icon: '', languages: ['go'], description: 'HTTP web framework written in Go' },
  { id: 'echo', name: 'Echo', icon: '', languages: ['go'], description: 'High performance, minimalist Go web framework' },
  { id: 'fiber', name: 'Fiber', icon: '', languages: ['go'], description: 'Express-inspired web framework written in Go' },
  { id: 'actix', name: 'Actix', icon: '🦀', languages: ['rust'], description: 'Powerful, pragmatic, and extremely fast web framework' },
  { id: 'rocket', name: 'Rocket', icon: '🚀', languages: ['rust'], description: 'Web framework for Rust' },
  { id: 'axum', name: 'Axum', icon: '⚡', languages: ['rust'], description: 'Ergonomic and modular web framework' },
  
  { id: 'rails', name: 'Ruby on Rails', icon: '🛤️', languages: ['ruby'], description: 'Full-stack web application framework' },
  { id: 'sinatra', name: 'Sinatra', icon: '🎤', languages: ['ruby'], description: 'DSL for quickly creating web applications' },
  
  { id: 'laravel', name: 'Laravel', icon: '🔴', languages: ['php'], description: 'The PHP framework for web artisans' },
  { id: 'symfony', name: 'Symfony', icon: '', languages: ['php'], description: 'High performance PHP framework' },
  { id: 'slim', name: 'Slim', icon: '', languages: ['php'], description: 'PHP micro framework' },
  
  { id: 'aspnet', name: 'ASP.NET Core', icon: '', languages: ['csharp'], description: 'Cross-platform framework for building modern apps' },
  { id: 'blazor', name: 'Blazor', icon: '', languages: ['csharp'], description: 'Build interactive web UIs using C#' },
];

export const LICENSES: License[] = [
  { id: 'mit', name: 'MIT License', icon: '', url: 'https://opensource.org/licenses/MIT' },
  { id: 'apache2', name: 'Apache 2.0', icon: '', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
  { id: 'gpl3', name: 'GPLv3', icon: '', url: 'https://www.gnu.org/licenses/gpl-3.0.html' },
  { id: 'bsd3', name: 'BSD 3-Clause', icon: '', url: 'https://opensource.org/licenses/BSD-3-Clause' },
  { id: 'mpl2', name: 'MPL 2.0', icon: '', url: 'https://www.mozilla.org/MPL/2.0/' },
  { id: 'unlicense', name: 'Unlicense', icon: '', url: 'https://unlicense.org/' },
  { id: 'proprietary', name: 'Proprietary', icon: '', url: '' },
  { id: 'none', name: 'No License', icon: '', url: '' },
];

export const PACKAGE_MANAGERS: PackageManager[] = [
  { id: 'npm', name: 'npm', icon: '', languages: ['javascript', 'typescript'], lockFile: 'package-lock.json' },
  { id: 'yarn', name: 'Yarn', icon: '', languages: ['javascript', 'typescript'], lockFile: 'yarn.lock' },
  { id: 'pnpm', name: 'pnpm', icon: '', languages: ['javascript', 'typescript'], lockFile: 'pnpm-lock.yaml' },
  { id: 'pip', name: 'pip', icon: '', languages: ['python'], lockFile: 'requirements.txt' },
  { id: 'poetry', name: 'Poetry', icon: '', languages: ['python'], lockFile: 'poetry.lock' },
  { id: 'cargo', name: 'Cargo', icon: '', languages: ['rust'], lockFile: 'Cargo.lock' },
  { id: 'go', name: 'Go Modules', icon: '', languages: ['go'], lockFile: 'go.sum' },
  { id: 'bundler', name: 'Bundler', icon: '', languages: ['ruby'], lockFile: 'Gemfile.lock' },
  { id: 'composer', name: 'Composer', icon: '', languages: ['php'], lockFile: 'composer.lock' },
  { id: 'nuget', name: 'NuGet', icon: '', languages: ['csharp'], lockFile: 'packages.lock.json' },
];

export const TEMPLATE_PATHS: Record<string, string> = {
  'javascript-none': 'vanilla-js',
  'typescript-none': 'vanilla-ts',
  'javascript-react': 'react-js',
  'typescript-react': 'react-ts',
  'javascript-next': 'nextjs-js',
  'typescript-next': 'nextjs-ts',
  'javascript-vue': 'vue-js',
  'typescript-vue': 'vue-ts',
  'javascript-svelte': 'svelte-js',
  'typescript-svelte': 'svelte-ts',
  'javascript-express': 'express-js',
  'typescript-express': 'express-ts',
  'typescript-nestjs': 'nestjs',
  'python-none': 'vanilla-python',
  'python-flask': 'flask',
  'python-django': 'django',
  'python-fastapi': 'fastapi',
  'go-none': 'vanilla-go',
  'go-gin': 'gin',
  'go-fiber': 'fiber',
  'rust-none': 'vanilla-rust',
  'rust-actix': 'actix',
  'rust-rocket': 'rocket',
  'ruby-none': 'vanilla-ruby',
  'ruby-rails': 'rails',
  'php-none': 'vanilla-php',
  'php-laravel': 'laravel',
  'csharp-aspnet': 'aspnet',
};

export const GITIGNORE_TEMPLATES: Record<string, string[]> = {
  javascript: [
    'node_modules/',
    'dist/',
    'build/',
    '.env',
    '.env.local',
    '.env.*.local',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    '*.log',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    'coverage/',
    '.nyc_output/',
  ],
  typescript: [
    'node_modules/',
    'dist/',
    'build/',
    '*.js',
    '*.js.map',
    '*.d.ts',
    '.env',
    '.env.local',
    '.env.*.local',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    '*.log',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    'coverage/',
    '.nyc_output/',
  ],
  python: [
    '__pycache__/',
    '*.py[cod]',
    '*$py.class',
    '*.so',
    '.Python',
    'build/',
    'develop-eggs/',
    'dist/',
    'downloads/',
    'eggs/',
    '.eggs/',
    'lib/',
    'lib64/',
    'parts/',
    'sdist/',
    'var/',
    'wheels/',
    '*.egg-info/',
    '.installed.cfg',
    '*.egg',
    'MANIFEST',
    '.env',
    '.venv',
    'env/',
    'venv/',
    'ENV/',
    '.DS_Store',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
  ],
  go: [
    '*.exe',
    '*.exe~',
    '*.dll',
    '*.so',
    '*.dylib',
    '*.test',
    '*.out',
    'vendor/',
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
  ],
  rust: [
    'target/',
    'Cargo.lock',
    '**/*.rs.bk',
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
  ],
  ruby: [
    '*.gem',
    '*.rbc',
    '/.config',
    '/coverage/',
    '/InstalledFiles',
    '/pkg/',
    '/spec/reports/',
    '/spec/examples.txt',
    '/test/tmp/',
    '/test/version_tmp/',
    '/tmp/',
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
  ],
  php: [
    '/vendor/',
    'composer.lock',
    '.env',
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
  ],
  csharp: [
    'bin/',
    'obj/',
    '.vs/',
    '*.user',
    '*.suo',
    '.DS_Store',
    '.idea/',
    '.vscode/',
    '*.swp',
    '*.swo',
  ],
};
