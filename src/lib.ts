import { getCollection } from 'astro:content';

// Drafts show in `npm run dev` so they can be reviewed, and never ship in a build.
export async function getPosts() {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// "2024-12" -> "Dec 2024"; missing end date means the role is current.
export const formatMonth = (ym?: string) =>
  ym ? new Date(`${ym}-01`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'present';
