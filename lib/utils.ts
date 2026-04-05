export function slugify(str: string) {
  return (
    str
      .toLowerCase()
      // eslint-disable-next-line prefer-string-replace-all
      .replace(/[^a-z0-9]+/g, "-")
      // eslint-disable-next-line prefer-string-replace-all
      .replace(/(^-|-$)+/g, "")
  );
}
