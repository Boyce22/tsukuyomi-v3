import { AppError } from '@errors';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';


interface ValidationErrorDetail {
  field: string;
  errors: string[];
}

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors = await validate(dtoInstance as object);

  if (errors.length > 0) {
    const formattedErrors = formatValidationErrors(errors);
    throw new AppError(
      'Validation failed',
      400,
      true,
      formattedErrors
    );
  }

  return dtoInstance;
}

function formatValidationErrors(errors: ValidationError[]): ValidationErrorDetail[] {
  return errors.map((error) => ({
    field: error.property,
    errors: error.constraints ? Object.values(error.constraints) : [],
  }));
}