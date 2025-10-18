export const convertBase64ToUtf8 = (base64: string) => {
  if (!base64) return base64;
  return Buffer.from(base64, 'base64').toString('utf-8');
};

export const joinPathSafe = (...paths: string[]) => {
  return paths
    .map((p) => p?.replace(/\/+$/g, '/')?.replace(/\/+$/, ''))
    .filter(Boolean)
    .join('/');
};
