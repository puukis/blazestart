# 🔥 BlazeStart

> ⚡ Slash project setup time to seconds - instant battle-tested repos with your stack

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![CI](https://github.com/puukis/blazestart/actions/workflows/Build.yml/badge.svg)](https://github.com/puukis/blazestart/actions/workflows/Build.yml)

## 🚀 What is BlazeStart?

BlazeStart is a lightning-fast, intelligent project scaffolding CLI that eliminates the tedious setup phase of new projects. With support for 12+ languages, 40+ frameworks, and smart configuration profiles, you can go from zero to coding in seconds.

## ✨ Features

- **🎯 Multi-Language Support**: JavaScript, TypeScript, Python, Go, Rust, Ruby, C#, PHP, and more
- **🚀 40+ Frameworks**: React, Next.js, Vue, Angular, Express, Django, Flask, FastAPI, and many more
- **💾 Configuration Profiles**: Save and reuse your favorite setups
- **🍴 Repository Forking**: Fork and customize existing repos with ease
- **🪝 Git Hooks**: Pre-commit hooks with Husky/pre-commit
- **📖 README Templates**: Standard, minimal, or AI-generated documentation
- **🎨 Polished CLI**: Boxed sections and animated spinners for a clean UX

## 📦 Installation

### Local Development

```bash
git clone https://github.com/puukis/blazestart.git
cd blazestart
```

```bash
npm install
npm run build
```

```bash
npm link
```

### Run in Dev (TypeScript)

```bash
# Show CLI help with decorated splash
npm run dev --

# Create a project in dev
npm run dev -- create my-app
```

## 🎯 Quick Start

### Create a New Project

Interactive mode (recommended):
```bash
blazestart create my-awesome-project
```

With options:
```bash
blazestart create my-api -l typescript -f express --git --install
```

#### Custom Path (optional)

During `create`, you can choose to create the project at a custom path.

Flow:

1. Answer “Yes” to “Create the project at a custom path?”.
2. Paste a path (supports `~`, relative, and absolute paths).
3. Confirm the final target shown as `<base>/<projectName>`.

If the path does not exist, you can create directories, re-enter a path, use the current directory, or cancel. If a file path is provided, you’ll be asked to enter a directory path instead.

### Initialize in Current Directory

```bash
blazestart init
```

### GitHub Repo Creation (optional)

To use the automatic GitHub repository creation and push:

```bash
# Install and authenticate GitHub CLI
gh auth login

# (Recommended) Set your Git identity
git config --global user.name "Your Name"
git config --global user.email you@example.com
```

If you prefer SSH or HTTPS with a Personal Access Token, configure that in your Git setup.

### Fork and Customize a Repository

```bash
blazestart fork https://github.com/user/repo
# or GitHub shorthand
blazestart fork user/repo
```

## 📚 Commands

### `create [project-name]`

Create a new project with your chosen stack.

**Options:**
- `-l, --language <language>` - Programming language
- `-f, --framework <framework>` - Framework to use
- `--license <license>` - License type
- `-g, --git` - Initialize git repository (default: true)
- `--no-git` - Skip git initialization
- `-i, --install` - Install dependencies (default: true)
- `--no-install` - Skip dependency installation
- `-o, --open` - Open in VS Code after creation
- `--config <profile>` - Use a saved configuration profile

### `init`

Initialize a project in the current directory.

**Options:**
- `-l, --language <language>` - Programming language
- `-f, --framework <framework>` - Framework to use
- `--license <license>` - License type

### `config <action>`

Manage saved configuration profiles.

**Actions:**
- `list` - List all saved profiles
- `save` - Save a new profile
- `use <name>` - Set a profile as default
- `delete <name>` - Delete a profile
- `show <name>` - Show profile details
- `set <key=value>` - Set a configuration value
- `get <key>` - Get a configuration value
- `export <name>` - Export a profile as JSON
- `import` - Import a profile from JSON

**Examples:**
```bash
blazestart config list
blazestart config save --name fullstack
blazestart config use fullstack
blazestart create my-project --config fullstack
```

### `list`

List all available templates, frameworks, and features.

```bash
blazestart list
# or
blazestart ls
```

### `fork <repo-url>`

Fork and customize an existing repository.

**Options:**
- `-n, --name <name>` - New project name
- `--clean` - Remove git history

**Examples:**
```bash
blazestart fork https://github.com/vercel/next.js
blazestart fork facebook/react --name my-react-fork --clean
```

## 🎨 Supported Stacks

### Languages
- 🟨 JavaScript
- 🔷 TypeScript
- 🐍 Python
- 🐹 Go
- 🦀 Rust
- 💎 Ruby
- 🟦 C#
- 🐘 PHP
- ☕ Java
- 🟣 Kotlin
- 🦉 Swift
- 🔵 C++

### Popular Framework Combinations

- **Full-Stack TypeScript**: Next.js + Prisma + tRPC
- **MEAN Stack**: MongoDB + Express + Angular + Node.js
- **MERN Stack**: MongoDB + Express + React + Node.js
- **Python API**: FastAPI + SQLAlchemy + Alembic
- **Go Microservice**: Gin/Fiber + GORM + Docker
- **Rust Web**: Actix/Rocket + Diesel + Tokio

## 💾 Configuration Profiles

Save your favorite project configurations for instant reuse:

```bash
# Save current configuration
blazestart config save --name my-stack

# Use saved profile
blazestart create new-project --config my-stack

# Set as default
blazestart config use my-stack
```

### Where profiles are stored

- Linux: `~/.blazestart/config.json` and `~/.blazestart/profiles/`
- macOS: `~/.blazestart/config.json` and `~/.blazestart/profiles/`
- Windows: `%USERPROFILE%\.blazestart\config.json` and `%USERPROFILE%\.blazestart\profiles\`

> Note: `~` expands to your home directory on Linux/macOS (e.g., `/home/you` or `/Users/you`). On Windows, `%USERPROFILE%` usually points to `C:\Users\you`.

### How profiles are applied

- If you set a default profile with `blazestart config use <name>`, both `blazestart create` and `blazestart init` will silently load it.
- Prompts are skipped for any options defined in the profile (applied automatically).
- If the profile is missing some options, you will only be prompted for those.
- CLI flags always override profile values, for example:

```bash
blazestart create my-app --framework nextjs --install
```

### Use a specific profile (overrides default)

```bash
blazestart create my-app --config my-stack
```

## 🛠️ Project Structure

Projects created with BlazeStart include:

- ✅ Language-specific `.gitignore`
- ✅ Configured linters and formatters
- ✅ Pre-commit hooks (optional)
- ✅ README template
- ✅ License file
- ✅ Basic project structure
- ✅ Framework-specific configuration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/)
- Polished CLI powered by [Chalk](https://github.com/chalk/chalk), [Inquirer](https://github.com/SBoudrias/Inquirer.js/), [Boxen](https://github.com/sindresorhus/boxen), and [Ora](https://github.com/sindresorhus/ora)

---

<p align="center">
  Made with ❤️ by developers, for developers
  <br>
  ⚡ Start blazing fast, code even faster! ⚡
</p>
