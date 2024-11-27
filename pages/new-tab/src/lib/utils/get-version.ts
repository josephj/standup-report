export const getVersion = (): string => {
  try {
    // @ts-expect-error: Vite will replace this with the actual version
    return __APP_VERSION__;
  } catch {
    return 'development';
  }
};
