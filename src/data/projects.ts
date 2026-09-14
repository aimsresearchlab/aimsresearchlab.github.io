// Helpers over the `projects` content collection (src/content/projects/*.md).
// The markdown files are the source of truth; this file only sorts them and
// carries the link icon table. Schema lives in src/content.config.ts.
import { getCollection, type CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

// Link kind -> icon + label. Simple Icons for brand marks, Phosphor otherwise.
// Brand marks keep their official colors (arXiv red, GitHub black).
export const linkMeta = {
  arxiv:  { icon: 'simple-icons:arxiv',  label: 'arXiv',  color: '#B31B1B' },
  github: { icon: 'simple-icons:github', label: 'GitHub', color: '#181717' },
  paper:  { icon: 'ph:file-text',        label: 'Paper',  color: 'currentColor' },
  demo:   { icon: 'ph:play-circle',      label: 'Demo',   color: 'currentColor' },
} as const;

// Every project. Featured ones first in their given order, then the rest.
export async function allProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return entries.sort((a, b) => {
    const af = a.data.featured ?? Infinity;
    const bf = b.data.featured ?? Infinity;
    if (af !== bf) return af - bf;
    return a.data.title.localeCompare(b.data.title);
  });
}

// The homepage grid: projects with a `featured` number, in that order.
export async function featuredProjects(limit = 4): Promise<ProjectEntry[]> {
  const entries = await allProjects();
  return entries.filter((e) => e.data.featured !== undefined).slice(0, limit);
}
