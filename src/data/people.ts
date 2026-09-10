// Single source of truth for people, mirroring src/data/publications.ts.
// To add someone: copy an entry into the right category.

export type Category = 'faculty' | 'phd' | 'masters' | 'undergrad';

export type LinkType =
  | 'website'
  | 'scholar'
  | 'github'
  | 'x'
  | 'linkedin'
  | 'email';

export interface PersonLink {
  type: LinkType;
  url: string; // for email, use the plain address; the mailto: is added for you
}

export interface Person {
  name: string;
  topic: string;        // research topic / title line under the name
  category: Category;
  image?: string;       // path under /public, e.g. "/people/jane.jpg". Omit for a placeholder.
  links?: PersonLink[];
}

export const people: Person[] = [
  {
    name: 'Name One',
    topic: 'Principal Investigator',
    category: 'faculty',
    links: [
      { type: 'website', url: 'https://example.org' },
      { type: 'scholar', url: 'https://scholar.google.com' },
    ],
  },
  {
    name: 'Name Two',
    topic: 'Conversational memory',
    category: 'phd',
    links: [{ type: 'github', url: 'https://github.com' }],
  },
  {
    name: 'Name Three',
    topic: 'Benchmark validity',
    category: 'phd',
    links: [{ type: 'x', url: 'https://x.com' }],
  },
  {
    name: 'Name Four',
    topic: 'Evaluation methods',
    category: 'masters',
  },
  {
    name: 'Name Five',
    topic: 'Data pipelines',
    category: 'undergrad',
  },
];

// Display order + heading label for each category.
export const categoryOrder: { key: Category; label: string }[] = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'phd', label: 'PhD Students' },
  { key: 'masters', label: "Master's Students" },
  { key: 'undergrad', label: 'Undergraduates' },
];

// Grouped in the fixed category order; empty groups are dropped.
export function groupedPeople(): { label: string; members: Person[] }[] {
  return categoryOrder
    .map(({ key, label }) => ({
      label,
      members: people.filter((p) => p.category === key),
    }))
    .filter((g) => g.members.length > 0);
}
