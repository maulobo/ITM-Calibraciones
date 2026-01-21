import { ExposeOptions, Transform, TransformFnParams } from 'class-transformer';

export const ExposeId =
  // eslint-disable-next-line @typescript-eslint/ban-types
  (options?: ExposeOptions) => (target: Object, propertyKey: string) => {
    Transform((params: TransformFnParams) => params.obj[propertyKey])(
      target,
      propertyKey,
    );
  };
