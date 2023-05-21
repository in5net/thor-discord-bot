import { Fetcher } from './fetcher';
import { arrayRequestBody } from './utils';

import type {
  ApiResponse,
  FetchArgType,
  FetchErrorType,
  FetchReturnType,
  Middleware,
  OpArgType,
  OpDefaultReturnType,
  OpErrorType,
  OpReturnType,
  TypedFetch
} from './types';

import { ApiError } from './types';

export type {
  OpArgType,
  OpErrorType,
  OpDefaultReturnType,
  OpReturnType,
  FetchArgType,
  FetchReturnType,
  FetchErrorType,
  ApiResponse,
  Middleware,
  TypedFetch
};
export { Fetcher, ApiError, arrayRequestBody };
