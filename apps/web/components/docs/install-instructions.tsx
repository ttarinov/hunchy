'use client';
import { useState, useEffect } from 'react';
import { CodeBlock } from './code-block';
import { Card, CardContent } from '@/components/ui/card';
type Platform = 'macos' | 'linux' | 'windows-powershell' | 'windows-cmd' | 'wsl';
interface InstallMethod {
  title: string;
  code: string;
  description: string;
}
export function InstallInstructions() {
  const [platform, setPlatform] = useState<Platform>('macos');
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();
    if (platform.indexOf('win') !== -1) {
      setPlatform('windows-powershell');
    } else if (platform.indexOf('mac') !== -1) {
      setPlatform('macos');
    } else if (platform.indexOf('linux') !== -1) {
      setPlatform('linux');
    }
  }, []);
  const instructions: Record<Platform, InstallMethod> = {
    'macos': {
      title: 'macOS',
      code: 'curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash',
      description: 'Works on both Intel and Apple Silicon Macs'
    },
    'linux': {
      title: 'Linux',
      code: 'curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash',
      description: 'Works on all major Linux distributions'
    },
    'wsl': {
      title: 'WSL',
      code: 'curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash',
      description: 'Windows Subsystem for Linux'
    },
    'windows-powershell': {
      title: 'Windows (PowerShell)',
      code: 'irm https://hunchy-4a0dc.web.app/install.ps1 | iex',
      description: 'Recommended for Windows 10/11'
    },
    'windows-cmd': {
      title: 'Windows (CMD)',
      code: 'curl -fsSL https://hunchy-4a0dc.web.app/install.cmd -o install.cmd && install.cmd && del install.cmd',
      description: 'Alternative for Command Prompt'
    }
  };
  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-wrap gap-2">
        {Object.entries(instructions).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => setPlatform(key as Platform)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              platform === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {title}
          </button>
        ))}
      </div>
      {}
      <Card className="border-blue-500/30 bg-card/50">
        <CardContent className="pt-6">
          <CodeBlock code={instructions[platform].code} title="Installation" />
          <p className="mt-3 text-sm text-muted-foreground">
            {instructions[platform].description}
          </p>
        </CardContent>
      </Card>
      {}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">After installation:</strong> Restart your terminal or run{' '}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">source ~/.zshrc</code>{' '}
          (or <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/.bashrc</code>).
        </p>
      </div>
      {}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
        <h4 className="font-semibold mb-2 text-foreground">✨ Automatic Updates</h4>
        <p className="text-sm text-muted-foreground">
          Hunchy automatically updates itself in the background. You'll always have the latest features
          without running manual update commands.
        </p>
      </div>
      {/* Verification */}
      <div>
        <h4 className="font-semibold mb-3 text-foreground">Verify Installation</h4>
        <CodeBlock code="hunchy --version" showTerminal={true} />
      </div>
    </div>
  );
}
