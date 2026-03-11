export interface SearchResult {
  id: string
  title: string
  content: string
  category: string
  sectionId: string
  score: number
  matches: string[]
}
export interface SearchIndexItem {
  id: string
  title: string
  content: string
  codeExamples: string[]
  category: string
  sectionId: string
}
const documentationIndex: SearchIndexItem[] = [
  {
    id: "installation",
    title: "Installation",
    content: "Get started with Hunchy CLI in just a few steps. Installation is quick and requires no configuration. Quick Install npx hunchy init. This command will initialize Hunchy in your current repository. The CLI will guide you through the setup process. Global Installation For a global installation, you can use npm, pnpm, or yarn.",
    codeExamples: ["npx hunchy init", "npm install -g @hunchy/cli", "pnpm add -g @hunchy/cli", "yarn global add @hunchy/cli"],
    category: "Getting Started",
    sectionId: "installation",
  },
  {
    id: "quick-start",
    title: "Quick Start",
    content: "After installation, you can start using Hunchy immediately. Here's a quick guide to get you up and running. First Steps Navigate to your Git repository. Run hunchy init to initialize Hunchy. Make some changes to your code. Run hunchy commit to create semantic commits.",
    codeExamples: ["cd my-project", "hunchy init", "hunchy commit"],
    category: "Getting Started",
    sectionId: "quick-start",
  },
  {
    id: "init",
    title: "hunchy init",
    content: "Initialize Hunchy in your repository. Creates the necessary configuration files and sets up the project structure. This command must be run from within a Git repository. Creates a .hunchy directory with default configuration. Safe to run multiple times - it won't overwrite existing config.",
    codeExamples: ["hunchy init"],
    category: "Commands",
    sectionId: "init",
  },
  {
    id: "commit",
    title: "hunchy commit",
    content: "Analyze your uncommitted changes and automatically create semantic commits. The AI will analyze your code and split changes into logical commits. Requires uncommitted changes in your working directory. Uses AI to analyze code structure and dependencies. Each commit includes complexity analysis and time estimates. You can review commits before they're finalized.",
    codeExamples: ["hunchy commit"],
    category: "Commands",
    sectionId: "commit",
  },
  {
    id: "interactive-shell",
    title: "Interactive Shell",
    content: "When you run hunchy without arguments, it starts an interactive shell where you can run commands and explore features. Built-in Commands help - Display available commands. exit - Exit the interactive shell.",
    codeExamples: ["hunchy", "help", "exit"],
    category: "Commands",
    sectionId: "interactive-shell",
  },
  {
    id: "config-file",
    title: "Configuration File",
    content: "Hunchy uses a configuration file located at .hunchy/config.json to customize behavior. The configuration file is automatically created when you run hunchy init. You can edit it to customize Hunchy's behavior.",
    codeExamples: [".hunchy/config.json"],
    category: "Configuration",
    sectionId: "config-file",
  },
  {
    id: "config-options",
    title: "Configuration Options",
    content: "Default configuration structure with all available options. commands.customPath - Path to directory containing custom commands. analysis.ignorePatterns - Array of patterns to ignore during codebase analysis.",
    codeExamples: ['{"commands": {"customPath": ".hunchy/commands"}, "analysis": {"ignorePatterns": ["node_modules", ".git"]}}'],
    category: "Configuration",
    sectionId: "config-options",
  },
  {
    id: "config-examples",
    title: "Configuration Examples",
    content: "Minimal configuration with just the essentials. Configuration with custom commands enabled.",
    codeExamples: ['{"analysis": {"ignorePatterns": ["node_modules", ".git"]}}'],
    category: "Configuration",
    sectionId: "config-examples",
  },
  {
    id: "command-registry",
    title: "CommandRegistry",
    content: "The CommandRegistry manages all available commands, including built-in and custom commands. Register a command. Get a command. Load custom commands from files.",
    codeExamples: ["import { CommandRegistry } from '@hunchy/cli'", "const registry = new CommandRegistry('.hunchy/commands')", "registry.register({ name: 'my-command', handler: async () => {} })"],
    category: "API Reference",
    sectionId: "command-registry",
  },
  {
    id: "file-scanner",
    title: "FileScanner",
    content: "The FileScanner scans directories and detects project types. Detect project type. Scan directory.",
    codeExamples: ["import { FileScanner } from '@hunchy/cli'", "const scanner = new FileScanner(['node_modules', '.git'])", "const projectType = await scanner.detectProjectType(process.cwd())"],
    category: "API Reference",
    sectionId: "file-scanner",
  },
  {
    id: "git-analyzer",
    title: "GitAnalyzer",
    content: "The GitAnalyzer extracts information from Git repositories. Get Git information including branch, commit, and remote.",
    codeExamples: ["import { GitAnalyzer } from '@hunchy/cli'", "const analyzer = new GitAnalyzer(process.cwd())", "const info = await analyzer.getInfo()"],
    category: "API Reference",
    sectionId: "git-analyzer",
  },
  {
    id: "common-use-cases",
    title: "Common Use Cases",
    content: "Here are some common scenarios and how to use Hunchy to solve them. Splitting a Large Feature Branch - When you've made many changes in a feature branch and want to split them into logical commits. Cleaning Up Before PR - Before creating a pull request, use Hunchy to organize your commits.",
    codeExamples: ["git checkout feature/my-feature", "hunchy commit", "git log --oneline"],
    category: "Examples",
    sectionId: "common-use-cases",
  },
  {
    id: "workflow-examples",
    title: "Workflow Examples",
    content: "Example workflows for integrating Hunchy into your development process. Daily Development Workflow - Start working on a feature, make changes throughout the day, use Hunchy before committing. Refactoring Workflow - Working on a large refactor, use Hunchy to split into logical commits.",
    codeExamples: ["git checkout -b feature/new-feature", "hunchy commit"],
    category: "Examples",
    sectionId: "workflow-examples",
  },
]
function normalizeText(text: string): string {
  return text.toLowerCase().trim()
}
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length > 0)
}
function calculateScore(query: string, item: SearchIndexItem): number {
  const normalizedQuery = normalizeText(query)
  const queryTokens = tokenize(query)
  const titleTokens = tokenize(item.title)
  const contentTokens = tokenize(item.content)
  const allCodeExamples = item.codeExamples.join(" ").toLowerCase()
  let score = 0
  if (normalizeText(item.title).includes(normalizedQuery)) {
    score += 100
  }
  if (normalizeText(item.title).startsWith(normalizedQuery)) {
    score += 50
  }
  queryTokens.forEach((token) => {
    if (titleTokens.includes(token)) {
      score += 30
    }
    if (contentTokens.includes(token)) {
      score += 10
    }
    if (allCodeExamples.includes(token)) {
      score += 15
    }
  })
  const titleMatch = titleTokens.filter((t) => queryTokens.includes(t)).length
  const contentMatch = contentTokens.filter((t) => queryTokens.includes(t)).length
  score += titleMatch * 20
  score += contentMatch * 5
  return score
}
function findMatches(query: string, text: string): string[] {
  const normalizedQuery = normalizeText(query)
  const queryTokens = tokenize(query)
  const textTokens = tokenize(text)
  const matches: string[] = []
  queryTokens.forEach((token) => {
    if (textTokens.some((t) => t.includes(token) || token.includes(t))) {
      matches.push(token)
    }
  })
  if (normalizeText(text).includes(normalizedQuery)) {
    matches.push(query)
  }
  return [...new Set(matches)]
}
export function searchDocumentation(query: string, limit: number = 15): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return []
  }
  const results: SearchResult[] = documentationIndex
    .map((item) => {
      const score = calculateScore(query, item)
      const matches = findMatches(query, `${item.title} ${item.content}`)
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        sectionId: item.sectionId,
        score,
        matches,
      }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return results
}
export function getSearchIndex(): SearchIndexItem[] {
  return documentationIndex
}
