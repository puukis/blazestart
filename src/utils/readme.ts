interface ProjectOptions {
  name: string;
  language: string;
  framework: string;
  license: string;
  packageManager: string;
  readme: 'standard' | 'minimal' | 'ai';
}

export async function generateReadme(options: ProjectOptions): Promise<string> {
  const { name, language, framework, license, packageManager, readme } = options;
  
  if (readme === 'minimal') {
    return generateMinimalReadme(name, language, framework);
  } else if (readme === 'ai') {
    return generateAIReadme(name, language, framework);
  }
  
  return generateStandardReadme(name, language, framework, license, packageManager);
}

function generateStandardReadme(
  name: string,
  language: string,
  framework: string,
  license: string,
  packageManager: string
): string {
  const badges = generateBadges(name, language, framework, license);
  const installInstructions = generateInstallInstructions(language, packageManager);
  const runInstructions = generateRunInstructions(language, framework, packageManager);
  
  return `# ${name}

${badges}

## 📋 Description

A ${framework !== 'none' ? framework : language} project scaffolded with BlazeStart ⚡

## 🚀 Features

- **Lightning Fast Setup**: Zero to production-ready in seconds
- **Battle-Tested Structure**: Industry-standard project organization
- **Pre-configured Tools**: Linters, formatters, and git hooks ready to go
- **Modern Stack**: Built with ${language}${framework !== 'none' ? ` and ${framework}` : ''}

## 📦 Installation

${installInstructions}

## 🔧 Usage

${runInstructions}

## 📁 Project Structure

\`\`\`
${name}/
├── src/              # Source code
│   ├── index.${getFileExtension(language)}    # Entry point
│   └── ...
├── tests/            # Test files
├── docs/             # Documentation
├── README.md         # Project documentation
├── LICENSE           # ${license.toUpperCase()} license
└── ${getConfigFile(language, packageManager)}
\`\`\`

## 🧪 Testing

\`\`\`bash
${getTestCommand(language, packageManager)}
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ${license.toUpperCase()} License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [BlazeStart](https://github.com/yourusername/blazestart) ⚡
- Powered by ${language}${framework !== 'none' ? ` and ${framework}` : ''}

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/${name}](https://github.com/yourusername/${name})

---

<p align="center">Made with ❤️ and BlazeStart</p>`;
}

function generateMinimalReadme(name: string, language: string, framework: string): string {
  return `# ${name}

A ${framework !== 'none' ? framework : language} project.

## Quick Start

\`\`\`bash
# Install dependencies
${language === 'javascript' || language === 'typescript' ? 'npm install' : '# See documentation'}

# Run the project
${language === 'javascript' || language === 'typescript' ? 'npm start' : '# See documentation'}
\`\`\`

## License

See LICENSE file for details.`;
}

function generateAIReadme(name: string, language: string, framework: string): string {
  // This would integrate with an AI service to generate contextual README
  // For now, returning an enhanced version
  return `# ${name} 🚀

> An intelligent ${framework !== 'none' ? framework : language} application built for modern development

## 🎯 Mission

This project leverages the power of ${language}${framework !== 'none' ? ` with ${framework}` : ''} to deliver exceptional performance and developer experience.

## 💡 Key Features

### Core Capabilities
- **High Performance**: Optimized for speed and efficiency
- **Scalable Architecture**: Built to grow with your needs
- **Developer Friendly**: Clean code, great documentation
- **Production Ready**: Battle-tested and reliable

### Technical Highlights
- Modern ${language} implementation
${framework !== 'none' ? `- ${framework} framework integration\n` : ''}- Comprehensive testing suite
- CI/CD ready
- Docker support

## 🚀 Quick Start

### Prerequisites
- ${getPrerequisites(language)}
- Git

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/${name}.git

# Navigate to project
cd ${name}

# Install dependencies
${getInstallCommand(language)}

# Start development server
${getDevCommand(language, framework)}
\`\`\`

## 🏗️ Architecture

This project follows industry best practices:
- **Clean Architecture**: Separation of concerns
- **SOLID Principles**: Maintainable and extensible code
- **Design Patterns**: Proven solutions to common problems

## 🧪 Testing

\`\`\`bash
# Run tests
${getTestCommand(language, 'npm')}

# Run with coverage
${getTestCommand(language, 'npm')} --coverage
\`\`\`

## 📈 Performance

- ⚡ Lightning fast startup
- 🎯 Optimized bundle size
- 🔄 Efficient state management
- 📦 Smart code splitting

## 🔐 Security

- Regular dependency updates
- Security best practices
- Input validation
- Error handling

## 🤝 Contributing

We love contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License

Licensed under the terms specified in the LICENSE file.

---

<div align="center">
  <b>Built with BlazeStart ⚡</b><br>
  <sub>The fastest way to start a new project</sub>
</div>`;
}

function generateBadges(name: string, language: string, framework: string, license: string): string {
  const badges = [];
  
  // Language badge
  const langColors: Record<string, string> = {
    javascript: 'F7DF1E',
    typescript: '3178C6',
    python: '3776AB',
    go: '00ADD8',
    rust: '000000',
    ruby: 'CC342D',
    php: '777BB4',
    csharp: '239120'
  };
  
  badges.push(`![${language}](https://img.shields.io/badge/${language}-${langColors[language] || '000000'}?style=for-the-badge&logo=${language}&logoColor=white)`);
  
  // Framework badge if applicable
  if (framework !== 'none') {
    badges.push(`![${framework}](https://img.shields.io/badge/${framework}-000000?style=for-the-badge&logo=${framework}&logoColor=white)`);
  }
  
  // License badge
  badges.push(`![License](https://img.shields.io/badge/license-${license}-blue?style=for-the-badge)`);
  
  // Build status badge
  badges.push(`![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)`);
  
  return badges.join(' ');
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    csharp: 'cs'
  };
  return extensions[language] || 'txt';
}

function getConfigFile(language: string, packageManager: string): string {
  if (language === 'javascript' || language === 'typescript') {
    return 'package.json';
  } else if (language === 'python') {
    return 'pyproject.toml';
  } else if (language === 'go') {
    return 'go.mod';
  } else if (language === 'rust') {
    return 'Cargo.toml';
  } else if (language === 'ruby') {
    return 'Gemfile';
  } else if (language === 'php') {
    return 'composer.json';
  }
  return 'config';
}

function generateInstallInstructions(language: string, packageManager: string): string {
  if (language === 'javascript' || language === 'typescript') {
    const commands: Record<string, string> = {
      npm: 'npm install',
      yarn: 'yarn',
      pnpm: 'pnpm install'
    };
    return `\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/projectname.git
cd projectname

# Install dependencies
${commands[packageManager] || 'npm install'}
\`\`\``;
  } else if (language === 'python') {
    return `\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/projectname.git
cd projectname

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt
\`\`\``;
  } else if (language === 'go') {
    return `\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/projectname.git
cd projectname

# Download dependencies
go mod download
\`\`\``;
  } else if (language === 'rust') {
    return `\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/projectname.git
cd projectname

# Build the project
cargo build
\`\`\``;
  }
  return '# See documentation for installation instructions';
}

function generateRunInstructions(language: string, framework: string, packageManager: string): string {
  if (language === 'javascript' || language === 'typescript') {
    const runCmd = packageManager === 'npm' ? 'npm run' : packageManager;
    return `\`\`\`bash
# Development mode
${runCmd} dev

# Production build
${runCmd} build

# Start production server
${runCmd} start
\`\`\``;
  } else if (language === 'python') {
    if (framework === 'flask' || framework === 'fastapi') {
      return `\`\`\`bash
# Run the application
python src/main.py

# Or with uvicorn (FastAPI)
uvicorn src.main:app --reload
\`\`\``;
    }
    return `\`\`\`bash
# Run the application
python src/main.py
\`\`\``;
  } else if (language === 'go') {
    return `\`\`\`bash
# Run the application
go run main.go

# Build and run
go build && ./projectname
\`\`\``;
  } else if (language === 'rust') {
    return `\`\`\`bash
# Run the application
cargo run

# Build for release
cargo build --release
\`\`\``;
  }
  return '# See documentation for usage instructions';
}

function getTestCommand(language: string, packageManager: string): string {
  if (language === 'javascript' || language === 'typescript') {
    return packageManager === 'npm' ? 'npm test' : `${packageManager} test`;
  } else if (language === 'python') {
    return 'pytest';
  } else if (language === 'go') {
    return 'go test ./...';
  } else if (language === 'rust') {
    return 'cargo test';
  }
  return '# Run tests';
}

function getPrerequisites(language: string): string {
  const prereqs: Record<string, string> = {
    javascript: 'Node.js (v16 or higher)',
    typescript: 'Node.js (v16 or higher)',
    python: 'Python 3.8+',
    go: 'Go 1.19+',
    rust: 'Rust 1.70+',
    ruby: 'Ruby 3.0+',
    php: 'PHP 8.0+',
    csharp: '.NET 6.0+'
  };
  return prereqs[language] || 'Required runtime';
}

function getInstallCommand(language: string): string {
  const commands: Record<string, string> = {
    javascript: 'npm install',
    typescript: 'npm install',
    python: 'pip install -r requirements.txt',
    go: 'go mod download',
    rust: 'cargo build',
    ruby: 'bundle install',
    php: 'composer install'
  };
  return commands[language] || '# Install dependencies';
}

function getDevCommand(language: string, framework: string): string {
  if (language === 'javascript' || language === 'typescript') {
    return 'npm run dev';
  } else if (language === 'python') {
    if (framework === 'flask') return 'flask run';
    if (framework === 'fastapi') return 'uvicorn src.main:app --reload';
    return 'python src/main.py';
  } else if (language === 'go') {
    return 'go run main.go';
  } else if (language === 'rust') {
    return 'cargo run';
  }
  return '# Start development server';
}
