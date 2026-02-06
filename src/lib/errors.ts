export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    const body: Record<string, unknown> = {
      error: error.code,
      message: error.message,
    };

    if (error instanceof ValidationError) {
      body.errors = error.errors;
    }

    return Response.json(body, { status: error.statusCode });
  }

  console.error('Unhandled error:', error);

  return Response.json(
    {
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
