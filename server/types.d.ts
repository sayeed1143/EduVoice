// Type declarations for custom Express extensions

declare namespace Express {
  export interface Request {
    userId?: string;
  }
}
