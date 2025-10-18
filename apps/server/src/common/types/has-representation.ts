export type IHasRepresentation = {
  representationFields: string[];
  findOneRepresentation: (...args: any[]) => Promise<{ data: string }>;
};
