import {Month} from './@types/models';

export const VERBIAGE = {
  FAILED_AUTHENTICATION: 'unable to authenticate',
  EXPIRED_AUTHENTICATION: 'authentication expired',
  BAD_REQUEST: 'bad request',
  NOT_FOUND: 'not found',
  NO_CONTENT: 'no content',
  CREATED: 'created',
  DUPLICATE_CHARGES: 'duplicate charges',
  MIN_APPROVER_NOT_REACHED: 'insufficient approvers',
  INVALID_APPROVAL_CODES: 'invalid approval codes',
  SHOULD_HAVE_EXPENSES: 'should have atleast 1 expense',
  SHOULD_HAVE_CHARGE: 'should have a charge',
};

export const CONSTANTS = {
  COMMUNITY_ID: 1, //TODO: Hard coded for now until we migrate to multiple communities
};

export const MONTHS: Month[] = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];
