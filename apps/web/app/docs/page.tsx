"use client"
import { DocsHeroSection } from "@/components/docs/docs-hero-section"
import { DocsSidebar } from "@/components/docs/docs-sidebar"
import { DocsSection } from "@/components/docs/docs-section"
import { CodeBlock } from "@/components/docs/code-block"
import { CommandReference } from "@/components/docs/command-reference"
import { ConfigExample } from "@/components/docs/config-example"
import { DocsSearchModal } from "@/components/docs/docs-search-modal"
import { InstallInstructions } from "@/components/docs/install-instructions"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation")
  const [searchOpen, setSearchOpen] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + 200
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        const sectionHeight = section.clientHeight
        const sectionId = section.getAttribute("id")
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId || "")
        }
      })
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
  const handleSearchSelect = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <DocsSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onResultSelect={handleSearchSelect}
      />
      <DocsHeroSection onSearchSelect={handleSearchSelect} />
      <div className="container mx-auto px-4 relative">
        <DocsSidebar activeSection={activeSection} onSectionChange={setActiveSection} onSearchSelect={handleSearchSelect} />
        <div className="flex-1 lg:ml-64 pt-8 pb-16 max-w-4xl">
            <DocsSection id="installation" title="Installation">
              <p className="text-lg text-muted-foreground mb-6">
                Get started with Hunchy CLI in seconds. Install with one command, get automatic updates.
              </p>
              <InstallInstructions />
              <h3 className="text-2xl font-semibold mb-6 mt-12">Manual Installation</h3>
              <p className="text-muted-foreground mb-4">
                Prefer to download directly? Get the binary for your platform:
              </p>
              <CodeBlock
                code={`# macOS (Apple Silicon)
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-macos-arm64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/
# macOS (Intel)
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-macos-x64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/
# Linux (x64)
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-linux-x64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/`}
                title="Manual Install"
              />
            </DocsSection>
            <DocsSection id="quick-start" title="Quick Start">
              <p className="text-lg text-muted-foreground mb-6">
                After installation, you can start using Hunchy immediately. Here's a quick guide to get you up and running.
              </p>
              <h3 className="text-2xl font-semibold mb-4 mt-8">First Steps</h3>
              <ol className="list-decimal list-inside space-y-4 text-muted-foreground mb-6">
                <li>Navigate to your Git repository</li>
                <li>Run <code className="text-primary">hunchy init</code> to initialize Hunchy</li>
                <li>Make some changes to your code</li>
                <li>Run <code className="text-primary">hunchy commit</code> to create semantic commits</li>
              </ol>
              <CodeBlock
                code={`$ cd my-project
$ hunchy init
🚀 Initializing Hunchy...
✓ Configuration created at .hunchy/config.json
$ # Make some changes...
$ hunchy commit
✓ Analyzing changes...
✓ Created 3 semantic commits`}
                title="Quick Start"
              />
            </DocsSection>
            <DocsSection id="init" title="hunchy init">
              <CommandReference
                name="hunchy init"
                description="Initialize Hunchy in your repository. Creates the necessary configuration files and sets up the project structure."
                usage="hunchy init"
                examples={[
                  `$ hunchy init
🚀 Initializing Hunchy...
✓ Configuration created at .hunchy/config.json
✓ Ready to use!`,
                ]}
                notes={[
                  "This command must be run from within a Git repository",
                  "Creates a .hunchy directory with default configuration",
                  "Safe to run multiple times - it won't overwrite existing config",
                ]}
              />
            </DocsSection>
            <DocsSection id="commit" title="hunchy commit">
              <CommandReference
                name="hunchy commit"
                description="Analyze your uncommitted changes and automatically create semantic commits. The AI will analyze your code and split changes into logical commits."
                usage="hunchy commit"
                examples={[
                  `$ hunchy commit
✓ Analyzing changes...
✓ Detected 3 logical commit boundaries
📦 Commit 1/3: feat(auth): Add OAuth2 authentication
📦 Commit 2/3: feat(ui): Add login forms
📦 Commit 3/3: test(auth): Add auth tests
✨ Successfully created 3 semantic commits`,
                ]}
                notes={[
                  "Requires uncommitted changes in your working directory",
                  "Uses AI to analyze code structure and dependencies",
                  "Each commit includes complexity analysis and time estimates",
                  "You can review commits before they're finalized",
                ]}
              />
            </DocsSection>
            <DocsSection id="interactive-shell" title="Interactive Shell">
              <p className="text-lg text-muted-foreground mb-6">
                When you run <code className="text-primary">hunchy</code> without arguments, it starts an interactive shell where you can run commands and explore features.
              </p>
              <CodeBlock
                code={`$ hunchy
🚀 Initializing Hunchy...
> help
Available commands:
  commit  - Create semantic commits
  help    - Show this help message
  exit    - Exit the shell
> commit
✓ Analyzing changes...
...`}
                title="Interactive Shell"
              />
              <h3 className="text-2xl font-semibold mb-4 mt-8">Built-in Commands</h3>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li><code className="text-primary">help</code> - Display available commands</li>
                <li><code className="text-primary">exit</code> - Exit the interactive shell</li>
              </ul>
            </DocsSection>
            <DocsSection id="config-file" title="Configuration File">
              <p className="text-lg text-muted-foreground mb-6">
                Hunchy uses a configuration file located at <code className="text-primary">.hunchy/config.json</code> to customize behavior.
              </p>
              <p className="text-muted-foreground mb-4">
                The configuration file is automatically created when you run <code className="text-primary">hunchy init</code>. You can edit it to customize Hunchy's behavior.
              </p>
            </DocsSection>
            <DocsSection id="config-options" title="Configuration Options">
              <ConfigExample
                title="Default Configuration"
                description="The default configuration structure with all available options."
                config={`{
  "commands": {
    "customPath": ".hunchy/commands"
  },
  "analysis": {
    "ignorePatterns": [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next"
    ]
  }
}`}
                explanation="This is the default configuration structure. You can customize command paths and analysis ignore patterns."
              />
              <h3 className="text-2xl font-semibold mb-4 mt-8">Configuration Options</h3>
              <div className="space-y-4">
                <Card className="border-blue-500/30 bg-card/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">commands.customPath</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Path to directory containing custom commands. Relative to repository root.
                    </p>
                    <CodeBlock code={`"customPath": ".hunchy/commands"`} showTerminal={false} />
                  </CardContent>
                </Card>
                <Card className="border-blue-500/30 bg-card/50">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">analysis.ignorePatterns</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Array of patterns to ignore during codebase analysis. These directories/files will be excluded.
                    </p>
                    <CodeBlock code={`"ignorePatterns": ["node_modules", ".git", "dist", "build"]`} showTerminal={false} />
                  </CardContent>
                </Card>
              </div>
            </DocsSection>
            <DocsSection id="config-examples" title="Configuration Examples">
              <h3 className="text-2xl font-semibold mb-4 mt-8">Minimal Configuration</h3>
              <ConfigExample
                title="Minimal Config"
                description="A minimal configuration with just the essentials."
                config={`{
  "analysis": {
    "ignorePatterns": ["node_modules", ".git"]
  }
}`}
              />
              <h3 className="text-2xl font-semibold mb-4 mt-8">With Custom Commands</h3>
              <ConfigExample
                title="Custom Commands Configuration"
                description="Configuration with custom commands path."
                config={`{
  "commands": {
    "customPath": ".hunchy/commands"
  },
  "analysis": {
    "ignorePatterns": ["node_modules", ".git", "dist", "coverage"]
  }
}`}
              />
            </DocsSection>
            <DocsSection id="command-registry" title="CommandRegistry">
              <p className="text-lg text-muted-foreground mb-6">
                The CommandRegistry manages all available commands, including built-in and custom commands.
              </p>
              <CodeBlock
                code={`import { CommandRegistry } from "@hunchy/cli"
const registry = new CommandRegistry(".hunchy/commands")
// Register a command
registry.register({
  name: "my-command",
  description: "My custom command",
  handler: async () => {
    console.log("Command executed")
  }
})
// Get a command
const cmd = registry.get("my-command")
if (cmd) {
  await cmd.handler([], {})
}
// Load custom commands from files
await registry.loadCustomCommands()`}
                title="CommandRegistry Usage"
              />
            </DocsSection>
            <DocsSection id="file-scanner" title="FileScanner">
              <p className="text-lg text-muted-foreground mb-6">
                The FileScanner scans directories and detects project types.
              </p>
              <CodeBlock
                code={`import { FileScanner } from "@hunchy/cli"
const scanner = new FileScanner(["node_modules", ".git"])
// Detect project type
const projectType = await scanner.detectProjectType(process.cwd())
// Scan directory
const files = await scanner.scanDirectory(process.cwd())`}
                title="FileScanner Usage"
              />
            </DocsSection>
            <DocsSection id="git-analyzer" title="GitAnalyzer">
              <p className="text-lg text-muted-foreground mb-6">
                The GitAnalyzer extracts information from Git repositories.
              </p>
              <CodeBlock
                code={`import { GitAnalyzer } from "@hunchy/cli"
const analyzer = new GitAnalyzer(process.cwd())
// Get Git information
const info = await analyzer.getInfo()
console.log(info.branch)
console.log(info.commit)
console.log(info.remote)`}
                title="GitAnalyzer Usage"
              />
            </DocsSection>
            <DocsSection id="common-use-cases" title="Common Use Cases">
              <p className="text-lg text-muted-foreground mb-6">
                Here are some common scenarios and how to use Hunchy to solve them.
              </p>
              <h3 className="text-2xl font-semibold mb-4 mt-8">Splitting a Large Feature Branch</h3>
              <p className="text-muted-foreground mb-4">
                When you've made many changes in a feature branch and want to split them into logical commits:
              </p>
              <CodeBlock
                code={`$ git checkout feature/my-feature
$ # Make all your changes...
$ hunchy commit
✓ Analyzing changes...
✓ Created 5 semantic commits`}
                title="Feature Branch"
              />
              <h3 className="text-2xl font-semibold mb-4 mt-8">Cleaning Up Before PR</h3>
              <p className="text-muted-foreground mb-4">
                Before creating a pull request, use Hunchy to organize your commits:
              </p>
              <CodeBlock
                code={`$ hunchy commit
✓ Analyzing changes...
✓ Created 3 semantic commits
$ git log --oneline
a3f9c2b feat(auth): Add OAuth2 authentication
b7e4d1a feat(ui): Add login forms
c9a1f3e test(auth): Add auth tests`}
                title="PR Preparation"
              />
            </DocsSection>
            <DocsSection id="workflow-examples" title="Workflow Examples">
              <p className="text-lg text-muted-foreground mb-6">
                Example workflows for integrating Hunchy into your development process.
              </p>
              <h3 className="text-2xl font-semibold mb-4 mt-8">Daily Development Workflow</h3>
              <CodeBlock
                code={`# Start working on a feature
$ git checkout -b feature/new-feature
# Make changes throughout the day
$ # ... code changes ...
# Before committing, use Hunchy
$ hunchy commit
✓ Created 4 semantic commits
# Review and push
$ git log --oneline
$ git push origin feature/new-feature`}
                title="Daily Workflow"
              />
              <h3 className="text-2xl font-semibold mb-4 mt-8">Refactoring Workflow</h3>
              <CodeBlock
                code={`# Working on a large refactor
$ hunchy commit
✓ Analyzing changes...
✓ Created 6 semantic commits:
  - refactor(api): Extract authentication logic
  - refactor(db): Optimize query structure
  - refactor(ui): Component reorganization
  - test(api): Update tests for new structure
  - test(db): Add query tests
  - docs: Update API documentation`}
                title="Refactoring"
              />
            </DocsSection>
          </div>
        </div>
      <Footer />
    </main>
  )
}
