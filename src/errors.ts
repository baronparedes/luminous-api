import {ValidationError} from 'sequelize';

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

type FieldError = {
  message: string;
  type: string | null;
  field: string | null;
  value: string | null;
};

export class EntityError extends ApiError {
  public fieldErrors: FieldError[] = [];
  constructor(err: ValidationError) {
    super(400, VERBIAGE.BAD_REQUEST);
    this.fieldErrors = err.errors.map(e => {
      const result: FieldError = {
        message: e.message,
        type: e.type,
        field: e.path,
        value: e.value,
      };
      return result;
    });
  }
}
