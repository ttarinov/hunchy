export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}
export function generateSectionId(type: string): string {
  return generateId(type);
}
export function generateCommitId(index: number): string {
  return generateId(`commit-${index}`);
}
