import { FieldError } from '../generated/graphql';

export const toErrorMap = (errors: FieldError[]) => {
  const errMap: Record<string, string> = {};
  errors.forEach((err) => {
    errMap[err.field] = err.message;
  });
  return errMap;
};
