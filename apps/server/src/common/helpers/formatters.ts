export const formatDomain = (domain: string) => {
  return domain.toLowerCase().trim().replace(/:80$/, '').replace(/:443$/, '');
};

export const removeTrailingSlash = (input: string) => {
  return input.replace(/\/$/, '');
};
