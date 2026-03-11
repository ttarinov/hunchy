import chalk from "chalk";
export function getCommitTypeColor(type: string) {
  switch (type) {
    case "feat":
      return chalk.cyan;
    case "fix":
      return chalk.red;
    case "test":
      return chalk.magenta;
    case "refactor":
      return chalk.yellow;
    default:
      return chalk.white;
  }
}
export function getComplexityColor(complexity: string) {
  switch (complexity.toLowerCase()) {
    case "high":
      return chalk.red;
    case "medium":
      return chalk.yellow;
    case "low":
      return chalk.green;
    default:
      return chalk.white;
  }
}
