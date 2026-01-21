export interface ISenderParamsInterface<T> {
  to: string;
  locals: T;
  subject?: string;
  from?: string;
  bcc?: string[]
}
