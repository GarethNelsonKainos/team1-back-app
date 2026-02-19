export function parseError(error: unknown): { 
  code?: string; 
  message: string; 
  statusCode: number 
} {
  // Handle Prisma errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    
    if (prismaError.code === 'P2025') {
      return { code: 'P2025', message: 'Job role not found', statusCode: 404 };
    }
  }

  // Handle custom errors with specific messages
  if (error instanceof Error) {
    if (error.message === 'Invalid job role ID') {
      return { message: 'Invalid job role ID', statusCode: 400 };
    }
    
    if (error.message.includes('not found')) {
      return { message: 'Job role not found', statusCode: 404 };
    }

    return { message: error.message, statusCode: 500 };
  }

  // Fallback for unknown errors
  return { message: 'An unexpected error occurred', statusCode: 500 };
}