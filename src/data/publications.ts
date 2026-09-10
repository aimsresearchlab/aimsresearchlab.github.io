// Single source of truth for publications.
// The homepage "Recent" section and the /publications page both read from here.
// To add a paper: copy an entry, keep the list roughly newest-first.

export interface Publication {
  title: string;
  authors: string;      // "A. Author, B. Author, C. Author"
  venue: string;        // "ACL 2027", "arXiv preprint", etc.
  year: number;
  url?: string;         // link to PDF / arXiv / project page
  award?: string;       // e.g. "Best Paper" — renders an ochre badge
}

export const publications: Publication[] = [
  {
    title: 'Same Ranking, Different Winner: How Scoring Targets Shape LLM Memory Benchmarks',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'Findings of EMNLP 2026',
    year: 2026,
    url: 'https://arxiv.org/abs/2605.24060',
  },
  {
    title: 'Outcome Monitors: Recovery Affordances for Silent Tool Failures',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'arXiv preprint',
    year: 2026,
    url: 'https://arxiv.org/abs/2608.19303',
  },
  {
    title: 'Fixed RAG Compression Collapses Measured Reader Scaling',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'arXiv preprint',
    year: 2026,
    url: 'https://arxiv.org/abs/2606.21807',
  },
];

// Newest first, capped. Used by the homepage "Recent" section.
export function recentPublications(limit = 3): Publication[] {
  return [...publications].sort((a, b) => b.year - a.year).slice(0, limit);
}

// Grouped by year, descending. Used by the /publications page.
export function publicationsByYear(): [number, Publication[]][] {
  const groups = new Map<number, Publication[]>();
  for (const pub of publications) {
    const list = groups.get(pub.year) ?? [];
    list.push(pub);
    groups.set(pub.year, list);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}
