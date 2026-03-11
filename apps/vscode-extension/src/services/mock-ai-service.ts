import { GitStatus, CommitProposal } from '../types';
export class MockAIService {
  async generateProposals(gitStatus: GitStatus): Promise<CommitProposal[]> {
    await this.simulateDelay(1500);
    if (gitStatus.files.length === 0) {
      return [];
    }
    const proposals: CommitProposal[] = [];
    const files = gitStatus.files;
    const grouped = this.groupFilesByPattern(files);
    for (const group of grouped) {
      const proposal = this.createProposalForGroup(group);
      if (proposal) {
        proposals.push(proposal);
      }
    }
    if (proposals.length === 0 && files.length > 0) {
      proposals.push(this.createDefaultProposal(files));
    }
    return proposals;
  }
  private groupFilesByPattern(files: { path: string; status: string }[]): Array<Array<{ path: string; status: string }>> {
    const groups: Map<string, Array<{ path: string; status: string }>> = new Map();
    for (const file of files) {
      const key = this.getGroupKey(file.path);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(file);
    }
    return Array.from(groups.values());
  }
  private getGroupKey(filePath: string): string {
    const pathParts = filePath.split('/');
    if (pathParts.length < 2) {
      return 'root';
    }
    const firstDir = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (firstDir === 'src' || firstDir === 'lib' || firstDir === 'app') {
      if (pathParts.length >= 3) {
        const secondDir = pathParts[pathParts.length - 3];
        return `${secondDir}/${firstDir}`;
      }
      return firstDir;
    }
    if (['test', 'tests', '__tests__'].includes(firstDir)) {
      return 'test';
    }
    if (['config', 'configs'].includes(firstDir)) {
      return 'config';
    }
    if (ext === 'json' || ext === 'yaml' || ext === 'yml') {
      return 'config';
    }
    if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
      return firstDir;
    }
    return firstDir;
  }
  private createProposalForGroup(group: Array<{ path: string; status: string }>): CommitProposal | null {
    if (group.length === 0) {
      return null;
    }
    const firstFile = group[0];
    const pathParts = firstFile.path.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const dir = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
    const { type, scope, message } = this.inferCommitInfo(group, dir, fileName);
    return {
      type,
      scope: scope || undefined,
      message,
      files: group.map(f => f.path),
      description: this.generateDescription(group, type, scope)
    };
  }
  private inferCommitInfo(
    group: Array<{ path: string; status: string }>,
    dir: string,
    fileName: string
  ): { type: string; scope?: string; message: string } {
    const fileNames = group.map(f => f.path.split('/').pop() || '');
    const hasDeleted = group.some(f => f.status === 'D');
    const hasAdded = group.some(f => f.status === 'A');
    const hasModified = group.some(f => f.status === 'M');
    if (dir === 'test' || dir === 'tests' || dir === '__tests__') {
      return {
        type: 'test',
        message: `add tests for ${this.extractFeatureName(fileNames[0])}`
      };
    }
    if (dir === 'config' || fileName.endsWith('.json') || fileName.endsWith('.yaml')) {
      return {
        type: 'chore',
        scope: 'config',
        message: `update configuration`
      };
    }
    if (hasDeleted && !hasAdded) {
      return {
        type: 'refactor',
        scope: dir || undefined,
        message: `remove ${this.extractFeatureName(fileNames[0])}`
      };
    }
    if (hasAdded && !hasModified) {
      if (fileNames.some(n => n.includes('service') || n.includes('Service'))) {
        return {
          type: 'feat',
          scope: dir || 'services',
          message: `add ${this.extractFeatureName(fileNames[0])} service`
        };
      }
      if (fileNames.some(n => n.includes('component') || n.includes('Component'))) {
        return {
          type: 'feat',
          scope: dir || 'components',
          message: `add ${this.extractFeatureName(fileNames[0])} component`
        };
      }
      return {
        type: 'feat',
        scope: dir || undefined,
        message: `add ${this.extractFeatureName(fileNames[0])}`
      };
    }
    if (fileNames.some(n => n.includes('fix') || n.includes('bug'))) {
      return {
        type: 'fix',
        scope: dir || undefined,
        message: `fix ${this.extractFeatureName(fileNames[0])}`
      };
    }
    if (fileNames.some(n => n.includes('refactor'))) {
      return {
        type: 'refactor',
        scope: dir || undefined,
        message: `refactor ${this.extractFeatureName(fileNames[0])}`
      };
    }
    if (dir === 'services' || dir === 'service') {
      return {
        type: 'refactor',
        scope: 'services',
        message: `update ${this.extractFeatureName(fileNames[0])} service`
      };
    }
    if (dir === 'components' || dir === 'component') {
      return {
        type: 'feat',
        scope: 'components',
        message: `update ${this.extractFeatureName(fileNames[0])} component`
      };
    }
    return {
      type: 'refactor',
      scope: dir || undefined,
      message: `update ${this.extractFeatureName(fileNames[0])}`
    };
  }
  private extractFeatureName(fileName: string): string {
    return fileName
      .replace(/\.(ts|tsx|js|jsx|json|yaml|yml)$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .split(' ')
      .slice(0, 3)
      .join(' ');
  }
  private generateDescription(
    group: Array<{ path: string; status: string }>,
    type: string,
    scope?: string
  ): string {
    const fileCount = group.length;
    const fileNames = group.map(f => f.path.split('/').pop() || '').join(', ');
    if (type === 'feat') {
      return `Adds new functionality affecting ${fileCount} file(s). Changes include: ${fileNames}`;
    }
    if (type === 'fix') {
      return `Fixes issues in ${fileCount} file(s). Modified files: ${fileNames}`;
    }
    if (type === 'refactor') {
      return `Refactors code in ${fileCount} file(s) for better maintainability. Files: ${fileNames}`;
    }
    if (type === 'test') {
      return `Adds or updates tests for ${fileCount} file(s). Test files: ${fileNames}`;
    }
    return `Updates ${fileCount} file(s) in ${scope || 'project'}. Files: ${fileNames}`;
  }
  private createDefaultProposal(files: Array<{ path: string; status: string }>): CommitProposal {
    return {
      type: 'chore',
      message: 'update files',
      files: files.map(f => f.path),
      description: `Updates ${files.length} file(s)`
    };
  }
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }
}
