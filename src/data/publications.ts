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
    title: 'When Target Choice Changes Benchmark Conclusions in Transformed Conversational Memory',
    authors: 'AIMS',
    venue: 'arXiv preprint',
    year: 2026,
    url: '#',
  },
  {
    title: 'Placeholder paper two',
    authors: 'A. Author, B. Author',
    venue: 'ACL 2026',
    year: 2026,
    url: '#',
    award: 'Best Paper',
  },
  {
    title: 'Placeholder paper three',
    authors: 'A. Author, C. Author',
    venue: 'NeurIPS 2025',
    year: 2025,
    url: '#',
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
