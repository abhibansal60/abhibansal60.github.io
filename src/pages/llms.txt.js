import resume from '../data/resume.json';
import { getPosts } from '../lib';

// Follows the llms.txt proposal: H1, blockquote summary, then sections of links.
export async function GET({ site }) {
  const { basics, projects } = resume;
  const url = (path) => new URL(path, site).href;
  const posts = await getPosts();
  const lines = [
    `# ${basics.name}`,
    '',
    `> ${basics.label}. ${basics.summary}`,
    '',
    `Based in ${basics.location.city}. Contact: ${basics.email}.`,
    '',
    '## About',
    `- [Full profile as plain text](${url('/llms-full.txt')}): work history, projects, skills and talk topics`,
    `- [resume.json](${url('/resume.json')}): the same data in JSON Resume format`,
    `- [Work](${url('/work/')}): roles and what I built at Morgan Stanley`,
    `- [CV](${url('/cv/')})`,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.name}](${p.url}): ${p.description}`),
    '',
    '## Writing',
    ...(posts.length ? posts.map((p) => `- [${p.data.title}](${url(`/writing/${p.id}/`)}): ${p.data.description}`) : ['- No posts yet']),
    '',
    '## Optional',
    `- [Speaking topics](${url('/speaking/')})`,
    `- [Uses](${url('/uses/')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
