export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '') // remove HTML tags if any
    .replace(/[^\w\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-');
}

