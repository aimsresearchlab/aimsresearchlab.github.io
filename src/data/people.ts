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
    name: 'Rabab Abdelfattah',
    topic: 'Principal Investigator',
    category: 'faculty',
    image: '/people/rabab-abdelfattah.webp',
    links: [
      { type: 'website', url: 'https://www.usm.edu/faculty-directory/profile.php?id=2458606' },
      { type: 'scholar', url: 'https://scholar.google.com/citations?user=p4FzqnIAAAAJ' },
    ],
  },
  {
    name: 'Olanrewaju Muili',
    topic: 'Trustworthy AI',
    category: 'phd',
    image: '/people/olanrewaju-muili.webp',
    links: [
      { type: 'website', url: 'https://www.olanrewajumuili.com/' },
      { type: 'github', url: 'https://github.com/omuili' },
    ],
  },
  {
    name: 'Siyan Luo',
    topic: 'PhD student',
    category: 'phd',
    image: '/people/aims-placeholder.webp', // AIMS mark until a headshot arrives
  },
  {
    name: 'Sugam Panthi',
    topic: 'LLM evaluation validity',
    category: 'undergrad',
    image: '/people/sugam-panthi.webp',
    links: [
      { type: 'website', url: 'https://spanthi.com' },
      { type: 'github', url: 'https://github.com/Vein05' },
    ],
  },
  {
    name: 'Muhaiminul Yeamin',
    topic: 'Research assistant',
    category: 'undergrad',
    image: '/people/muhaiminul-yeamin.webp',
    links: [
      { type: 'website', url: 'https://muhaiminul.online/' },
      { type: 'github', url: 'https://github.com/MY-Sabil' },
    ],
  },
  {
    name: 'Sakshyam Sigdel',
    topic: 'Research assistant',
    category: 'undergrad',
    image: '/people/sakshyam-sigdel.webp',
    links: [
      { type: 'website', url: 'https://sakshyamsigdel.com.np' },
      { type: 'github', url: 'https://github.com/S-Sigdel' },
    ],
  },
  {
    name: 'Nhoojah Maharjan',
    topic: 'Research assistant',
    category: 'undergrad',
    image: '/people/nhoojah-maharjan.webp',
    links: [
      { type: 'website', url: 'https://www.nhoojah.com.np/' },
      { type: 'github', url: 'https://github.com/yarwen0' },
    ],
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
