export function parseError(error: unknown): {
  code?: string;
  message: string;
  statusCode: number;
} {
  // Handle Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; message?: string };

    if (prismaError.code === 'P2025') {
      console.log('Prisma error P2025:', prismaError.message);
      return { code: 'P2025', message: 'Job role not found', statusCode: 404 };
    }
  }

  // Handle custom errors with specific messages
  if (
    error instanceof Error ||
    (typeof error === 'object' && error !== null && 'message' in error)
  ) {
    const errorMessage = (
      error instanceof Error
        ? error.message
        : (error as { message: unknown }).message
    ) as string;

    if (errorMessage === 'Invalid job role ID') {
      console.log('Validation error:', errorMessage);
      return { message: 'Invalid job role ID', statusCode: 400 };
    }

    if (errorMessage.includes('not found')) {
      console.log('Not found error:', errorMessage);
      return { message: 'Job role not found', statusCode: 404 };
    }

    console.log('General error:', errorMessage);
    return { message: errorMessage, statusCode: 500 };
  }

  // Fallback for unknown errors
  console.error('Unknown error 123:', error);
  console.error('Unknown error details:', typeof error);
  return { message: 'An unexpected error occurred', statusCode: 500 };
}
