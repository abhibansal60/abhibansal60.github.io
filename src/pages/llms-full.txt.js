import resume from '../data/resume.json';
import { getPosts, formatMonth } from '../lib';

export async function GET() {
  const { basics, work, highlights, projects, skills, awards, certificates, education, talks } = resume;
  const posts = await getPosts();
  const out = [
    `# ${basics.name}`,
    '',
    basics.label,
    basics.subline,
    '',
    basics.summary,
    '',
    `Location: ${basics.location.city}, ${basics.location.region}, UK. Email: ${basics.email}.`,
    ...basics.profiles.map((p) => `${p.network}: ${p.url}`),
    '',
    '## Experience',
    ...work.flatMap((w) => [
      '',
      `### ${w.position}, ${w.name} (${formatMonth(w.startDate)} to ${formatMonth(w.endDate)})${w.location ? `, ${w.location}` : ''}`,
      ...(w.summary ? [w.summary] : []),
      ...w.highlights.map((h) => `- ${h}`),
    ]),
    '',
    '## Systems built at Morgan Stanley (internal, described only)',
    ...highlights.map((h) => `- ${h.name}: ${h.summary}${h.url ? ` ${h.url}` : ""}`),
    '',
    '## Open source projects',
    ...projects.map((p) => `- ${p.name} (${p.url}): ${p.description}`),
    '',
    '## Skills',
    ...skills.map((s) => `- ${s.name}: ${s.keywords.join(', ')}`),
    '',
    '## Awards and certifications',
    ...awards.map((a) => `- ${a.title}, ${a.awarder}. ${a.summary}`),
    ...certificates.map((c) => `- ${c.name}`),
    '',
    '## Education',
    ...education.map((e) => `- ${e.studyType}, ${e.area}, ${e.institution} (${e.startDate} to ${e.endDate})`),
    '',
    '## Talk topics',
    ...talks.map((t) => `- ${t.title}: ${t.summary}`),
    ...posts.flatMap((p) => ['', `## Post: ${p.data.title}`, '', p.body ?? '']),
  ];
  return new Response(out.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
