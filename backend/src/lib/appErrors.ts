export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidRequestError extends AppError {
  constructor(message = "Request Contains Invalid Data") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Login Required, Acess Denied") {
    super(message, 401);
  }
}

export class ForbiddenContentError extends AppError {
  constructor(message = "Admin Only, Access Denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Duplicate Already Exists") {
    super(message, 409);
  }
}
