export const createShareId = () => {
  const id = crypto.randomUUID().replace(/-/g, "");
  return id.slice(0, 10);
};
