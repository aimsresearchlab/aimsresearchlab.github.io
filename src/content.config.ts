// Content collections. Right now: projects, one markdown file per line of work.
// The schema is enforced at build time, so a typo in frontmatter fails the
// build instead of rendering a broken card.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    // Card + page heading.
    title: z.string(),
    // One sentence stating the finding or goal. Shown on the card and as the lede.
    claim: z.string(),
    // 1 to 3 CamelCase tokens, no spaces (rendered as #Tag).
    tags: z.array(z.string()).min(1).max(3),
    // 16:9 image under public/projects/, 1600x900 webp. Omit for the placeholder.
    cover: z.string().optional(),
    coverCaption: z.string().optional(),
    // Homepage order. 1 shows first; omit to keep a project off the homepage.
    featured: z.number().optional(),
    // Canonical records only (arXiv, DOI, public repo, a demo on this site).
    links: z
      .array(
        z.object({
          kind: z.enum(['arxiv', 'github', 'paper', 'demo']),
          url: z.string(),
        }),
      )
      .default([]),
    // Exact titles from src/data/publications.ts; renders the Papers section.
    publications: z.array(z.string()).default([]),
  }),
});

export const collections = { projects };
