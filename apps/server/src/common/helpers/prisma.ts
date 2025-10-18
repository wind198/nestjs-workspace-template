import { camelCase, get } from 'lodash';

const softDeletedRelations = [
  // TODO: please fill this list with all models that have deletedAt field, and relations connect to them, this will prevent deleted items or related items from being loaded
  'users',
  'projects',
  'cameras',
  'clients',
  'createdUsers',
  'projectsCreated',
  'projectsUpdated',
] as any[];
const softDeletedModels = ['user', 'project', 'camera', 'client', 'team'];

export const checkShouldAddDeletedAtForModel = (model: string, args: any) => {
  if (softDeletedModels.includes(camelCase(model) as any)) {
    return get(args, 'where.deletedAt') === undefined;
  }
  return false;
};

export const checkShouldAddDeletedAtForRelation = (
  model: string,
  args: any,
) => {
  if (softDeletedRelations.includes(camelCase(model) as any)) {
    return get(args, 'where.deletedAt') === undefined;
  }
  return false;
};
