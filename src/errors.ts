import {VERBIAGE} from './constants';

export class ApiError extends Error {
  constructor(public status: number, message?: string) {
    super(message);
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super(403, VERBIAGE.FAILED_AUTHENTICATION);
  }
}
