export class PostNotFoundError extends Error {
  constructor(message = 'Post not found.') {
    super(message);
    this.name = 'PostNotFoundError';
  }
}

export class PostConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostConflictError';
  }
}
