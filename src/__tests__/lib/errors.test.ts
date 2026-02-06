import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  TooManyRequestsError,
  ValidationError,
} from '@/lib/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test', 400, 'TEST');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have status 401', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('should have default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should have status 403', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should have default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should have status 404', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });
  });

  describe('BadRequestError', () => {
    it('should have status 400', () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('ConflictError', () => {
    it('should have status 409', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('TooManyRequestsError', () => {
    it('should have status 429', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('TOO_MANY_REQUESTS');
    });

    it('should accept custom message', () => {
      const error = new TooManyRequestsError('Rate limit exceeded');
      expect(error.message).toBe('Rate limit exceeded');
    });
  });

  describe('ValidationError', () => {
    it('should have status 400 and include errors', () => {
      const errors = { email: ['Invalid email'] };
      const error = new ValidationError('Validation failed', errors);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });

    it('should preserve multiple field errors', () => {
      const errors = {
        email: ['Invalid email', 'Email is required'],
        password: ['Password too short'],
      };
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
      expect(error.errors.email).toHaveLength(2);
      expect(error.errors.password).toHaveLength(1);
    });
  });

  describe('Error inheritance', () => {
    it('all errors should be operational', () => {
      expect(new UnauthorizedError().isOperational).toBe(true);
      expect(new ForbiddenError().isOperational).toBe(true);
      expect(new NotFoundError().isOperational).toBe(true);
      expect(new BadRequestError().isOperational).toBe(true);
      expect(new ConflictError().isOperational).toBe(true);
      expect(new TooManyRequestsError().isOperational).toBe(true);
      expect(new ValidationError('test', {}).isOperational).toBe(true);
    });

    it('all errors should have stack trace', () => {
      const error = new UnauthorizedError();
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Error');
    });
  });
});
