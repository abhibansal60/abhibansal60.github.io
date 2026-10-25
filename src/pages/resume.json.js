import resume from '../data/resume.json';
import projects from '../data/projects.json';

// /resume.json stays one JSON Resume document; projects live in their own file to keep each file small.
export const GET = () => Response.json({ ...resume, projects });
