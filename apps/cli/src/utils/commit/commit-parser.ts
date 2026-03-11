export interface ParsedCommit {
  number: number;
  total: number;
  type: string;
  message: string;
  bullets: string[];
  files: string[];
  complexity: string;
  timeEstimate: string;
  hash: string;
}
export interface ParsedOutput {
  summary: {
    filesAnalyzed: number;
    changes: number;
    boundaries: number;
  } | null;
  commits: ParsedCommit[];
  finalSummary: {
    totalCommits: number;
    filesChanged: number;
    additions: number;
    estimatedWork: string;
  } | null;
}
export function parseCommitOutput(output: string): ParsedOutput {
  const result: ParsedOutput = {
    summary: null,
    commits: [],
    finalSummary: null,
  };
  if (!output) return result;
  const lines = output.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim();
    if (!line) {
      i++;
      continue;
    }
    if (line.includes("✓ Analyzed")) {
      const analyzedMatch = line.match(/✓ Analyzed (\d+) files with (\d+) changes/);
      if (analyzedMatch) {
        i++;
        while (i < lines.length) {
          const nextLine = lines[i]?.trim();
          if (nextLine?.includes("✓ Detected")) {
            const boundariesMatch = nextLine.match(/✓ Detected (\d+) logical commit boundaries/);
            if (boundariesMatch) {
              result.summary = {
                filesAnalyzed: parseInt(analyzedMatch[1]),
                changes: parseInt(analyzedMatch[2]),
                boundaries: parseInt(boundariesMatch[1]),
              };
              i++;
              break;
            }
          }
          i++;
        }
        break;
      }
    }
    i++;
  }
  while (i < lines.length) {
    const line = lines[i]?.trim();
    if (line?.match(/^━+$/)) {
      i++;
      break;
    }
    i++;
  }
  while (i < lines.length) {
    const line = lines[i]?.trim();
    if (!line) {
      i++;
      continue;
    }
    const commitMatch = line.match(/\[ICON\] Commit (\d+) of (\d+)/);
    if (commitMatch) {
      const commitNumber = parseInt(commitMatch[1]);
      const totalCommits = parseInt(commitMatch[2]);
      i++;
      const messageLine = lines[i]?.trim();
      if (!messageLine) {
        i++;
        continue;
      }
      const messageMatch = messageLine.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
      if (!messageMatch) {
        i++;
        continue;
      }
      const commitType = messageMatch[1];
      const message = messageLine;
      i++;
      if (lines[i]?.trim() === "") i++;
      const bullets: string[] = [];
      while (i < lines.length && lines[i]?.trim().startsWith("-")) {
        const bullet = lines[i].trim().substring(1).trim();
        if (bullet) bullets.push(bullet);
        i++;
      }
      if (lines[i]?.trim() === "") i++;
      const files: string[] = [];
      if (lines[i]?.trim().startsWith("Files:")) {
        const filesLine = lines[i].substring(6).trim();
        if (filesLine) {
          files.push(...filesLine.split(",").map((f) => f.trim()).filter(Boolean));
        }
        i++;
      }
      let complexity = "Medium";
      let timeEstimate = "";
      if (lines[i]?.trim().startsWith("Complexity:")) {
        const complexityMatch = lines[i].match(/Complexity: (\w+) \| Est\. time: (.+)/);
        if (complexityMatch) {
          complexity = complexityMatch[1];
          timeEstimate = complexityMatch[2];
        }
        i++;
      }
      if (lines[i]?.trim() === "") i++;
      let hash = "";
      if (lines[i]?.includes("✓ Commit created")) {
        const hashMatch = lines[i].match(/✓ Commit created \(([a-f0-9]+)\)/);
        if (hashMatch) {
          hash = hashMatch[1];
        }
        i++;
      }
      result.commits.push({
        number: commitNumber,
        total: totalCommits,
        type: commitType,
        message,
        bullets,
        files,
        complexity,
        timeEstimate,
        hash,
      });
      while (i < lines.length && lines[i]?.trim().match(/^━+$/)) {
        i++;
      }
    } else if (line?.includes("✨ Successfully created")) {
      const commitsMatch = line.match(/✨ Successfully created (\d+) semantic commits/);
      if (commitsMatch) {
        i++;
        while (i < lines.length) {
          const nextLine = lines[i]?.trim();
          if (nextLine?.includes("📊 Total:")) {
            const totalMatch = nextLine.match(/📊 Total: (\d+) files changed, (\d+) additions/);
            if (totalMatch) {
              i++;
              while (i < lines.length) {
                const workLine = lines[i]?.trim();
                if (workLine?.includes("⏱️")) {
                  const workMatch = workLine.match(/⏱️\s+Estimated work: (.+)/);
                  if (workMatch) {
                    result.finalSummary = {
                      totalCommits: parseInt(commitsMatch[1]),
                      filesChanged: parseInt(totalMatch[1]),
                      additions: parseInt(totalMatch[2]),
                      estimatedWork: workMatch[1],
                    };
                    break;
                  }
                }
                i++;
              }
              break;
            }
          }
          i++;
        }
        break;
      }
      i++;
    } else {
      i++;
    }
  }
  return result;
}
