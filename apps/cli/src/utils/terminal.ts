export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}
export function clearLine(): void {
  process.stdout.write('\x1b[2K');
}
export function moveUp(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}A`);
  }
}
export function moveDown(lines: number): void {
  if (lines > 0) {
    process.stdout.write(`\x1b[${lines}B`);
  }
}
export function moveToLineStart(): void {
  process.stdout.write('\r');
}
export function clearToEnd(): void {
  process.stdout.write('\x1b[J');
}
export function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}
export function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}
export function saveCursor(): void {
  process.stdout.write('\x1b7');
}
export function restoreCursor(): void {
  process.stdout.write('\x1b8');
}
export function createSeparator(char: string = '─', width: number = 60): string {
  return char.repeat(width);
}
export function isTTY(): boolean {
  return process.stdout.isTTY || false;
}
export function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}
export function getTerminalHeight(): number {
  return process.stdout.rows || 24;
}
