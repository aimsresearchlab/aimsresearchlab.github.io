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
  // Term they finished, e.g. "Spring 2026". Setting it moves the person out of
  // the current roster and into the Alumni section on /people.
  graduated?: string;
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
    name: 'Ashim Dahal',
    topic: 'Computer vision',
    category: 'undergrad',
    image: '/people/ashim-dahal.webp',
    links: [
      { type: 'website', url: 'https://ashimdahal.com.np/' },
      { type: 'scholar', url: 'https://scholar.google.com/citations?user=Nt9K4nsAAAAJ' },
      { type: 'github', url: 'https://github.com/ashimdahal' },
    ],
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
    name: 'Nhoojah Maharjan',
    topic: 'Research assistant',
    category: 'undergrad',
    image: '/people/nhoojah-maharjan.webp',
    links: [
      { type: 'website', url: 'https://www.nhoojah.com.np/' },
      { type: 'github', url: 'https://github.com/yarwen0' },
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
    name: 'Muhaiminul Yeamin',
    topic: 'Research assistant',
    category: 'undergrad',
    image: '/people/muhaiminul-yeamin.webp',
    links: [
      { type: 'website', url: 'https://muhaiminul.online/' },
      { type: 'github', url: 'https://github.com/MY-Sabil' },
    ],
  },
  // Graduated Master's students, Spring 2026. Two of them, from Rabab's deck.
  // Fill in the names (and headshots, 192x192 webp) and uncomment:
  // {
  //   name: '',
  //   topic: "Master's student",
  //   category: 'masters',
  //   image: '/people/first-last.webp',
  //   graduated: 'Spring 2026',
  // },
];

// Display order + heading label for each category.
export const categoryOrder: { key: Category; label: string }[] = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'phd', label: 'PhD Students' },
  { key: 'masters', label: "Master's Students" },
  { key: 'undergrad', label: 'Undergraduates' },
];

// Within a category, list order is display order (longest-serving first).
// Grouped in the fixed category order; empty groups are dropped.
// Anyone with `graduated` set is a member of the lab's past, not its roster.
export function groupedPeople(): { label: string; members: Person[] }[] {
  return categoryOrder
    .map(({ key, label }) => ({
      label,
      members: people.filter((p) => p.category === key && !p.graduated),
    }))
    .filter((g) => g.members.length > 0);
}

// Sorts "Spring 2026" style terms, most recent first.
const seasonRank: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 };
function termKey(term: string): number {
  const [season, year] = term.split(' ');
  return Number(year) * 10 + (seasonRank[season] ?? 0);
}

// Everyone who has graduated, grouped by category and term, most recent first.
// Rendered as the Alumni section on /people.
export function alumni(): { label: string; members: Person[] }[] {
  const groups = new Map<string, { label: string; term: string; order: number; members: Person[] }>();
  for (const person of people) {
    if (!person.graduated) continue;
    const category = categoryOrder.find((c) => c.key === person.category);
    const key = `${person.category}|${person.graduated}`;
    const group = groups.get(key) ?? {
      label: `${category?.label ?? person.category} · ${person.graduated}`,
      term: person.graduated,
      order: categoryOrder.findIndex((c) => c.key === person.category),
      members: [],
    };
    group.members.push(person);
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => termKey(b.term) - termKey(a.term) || a.order - b.order)
    .map(({ label, members }) => ({ label, members }));
}
