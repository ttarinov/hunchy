export function getErrorMessage(error: unknown, fallback: string = 'Unknown error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
