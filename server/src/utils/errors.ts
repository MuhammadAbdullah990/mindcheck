/**
 * Consistent error shape across the whole API, per 05_API_SPECIFICATION.md.
 * Every error the client can receive flows through `AppError`.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: { field: string; message: string }[]) {
    return new AppError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }

  static internal(message = 'Something went wrong on our end') {
    return new AppError(500, 'INTERNAL_ERROR', message);
  }
}
