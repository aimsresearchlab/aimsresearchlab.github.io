// Content for the overview deck at /slides/aims-lab/ that has nowhere else to
// live. Anything the site already knows (people, publications, news, projects)
// is read from its own data file by the page; this holds only what belongs to
// the deck.

import { people } from './people';
import { publications } from './publications';
import type { ProjectEntry } from './projects';
import { qrFile } from './qr';

export interface Area {
  icon: string; // Phosphor name, shown as a badge over the image
  title: string; // short enough to hold one line on a sheet
  line: string;
  image: string; // 640x400 duotone card image under public/slides/areas/
}

export interface Leader {
  name: string;
  role: string;
  where: string;
  image: string;
}

/** The five lines of work, in the lab's own words, shortened for a sheet. */
export const areas: Area[] = [
  { icon: 'ph:eye', title: 'Computer Vision', line: 'Seeing and interpreting the visual world.', image: '/slides/areas/computer-vision.webp' },
  { icon: 'ph:chat-circle-dots', title: 'Language & Agents', line: 'Models that reason, act, and recover from failure.', image: '/slides/areas/language-agents.webp' },
  { icon: 'ph:waveform', title: 'Multimodal AI', line: 'Text, image, audio and sensor data together.', image: '/slides/areas/multimodal-ai.webp' },
  { icon: 'ph:shield-check', title: 'Trustworthy AI', line: 'Evaluation that stays valid under pressure.', image: '/slides/areas/trustworthy-ai.webp' },
  { icon: 'ph:users-three', title: 'Human-Centered AI', line: 'Systems people can direct, inspect and correct.', image: '/slides/areas/human-centered-ai.webp' },
];

/** Research-area tags on the title sheet. Keep in step with the homepage. */
export const titleTags = [
  'ComputerVision',
  'VisionLanguageModels',
  'RAG',
  'ConversationalMemory',
  'AIAgents',
  'TrustworthyAI',
];

/**
 * Projects that get a spotlight sheet, in order. A project qualifies when it
 * has a figure that holds up at display size; the rest run as cards.
 */
export const spotlightSlugs = ['seam', 'gaussian-streaming', 'same-ranking-different-winner'];

/** Pill labels for a project's links. */
export const linkLabels: Record<string, string> = {
  arxiv: 'arXiv',
  github: 'Code',
  paper: 'Paper',
  demo: 'Demo',
};

/**
 * The two people who direct the work. Dr. Lee heads the school the lab sits
 * in, not the lab, so she is named here rather than added to the roster in
 * people.ts, which feeds /people.
 */
export function leadership(): Leader[] {
  const director = people.find((p) => p.name === 'Dr. Rabab Abdelfattah');
  return [
    {
      name: 'Dr. Rabab Abdelfattah',
      role: 'Director, AIMS Lab',
      where: 'School of Computing Sciences and Computer Engineering',
      image: director?.image ?? '/people/aims-placeholder.webp',
    },
    {
      name: 'Dr. Sarah Lee',
      role: 'Director, School of Computing Sciences and Computer Engineering',
      where: 'University of Southern Mississippi',
      image: '/people/sarah-lee.webp',
    },
  ];
}

/** The numbers under the framing on the second sheet. */
export function stats(projectCount: number): { n: string; label: string }[] {
  return [
    { n: String(people.filter((p) => !p.graduated).length), label: 'researchers' },
    { n: String(publications.length), label: 'papers' },
    { n: String(projectCount), label: 'active projects' },
  ];
}

const shorten = (url: string) =>
  url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');



export interface Destination {
  /** The address in readable form, for a caption or an alt text. */
  text: string;
  /** The QR code for it, under public/slides/. */
  qr: string;
}

/**
 * Where a paper lives, for the QR beside it on the papers sheet. A paper that
 * belongs to a project points at the project page on this site; anything else
 * points at its own canonical record. A paper with neither (in press, no
 * preprint) gets nothing rather than a code back to the list it is already on.
 */
export function paperDestination(projects: ProjectEntry[]) {
  const projectOf = new Map<string, string>();
  for (const entry of projects) {
    for (const title of entry.data.publications) projectOf.set(title, entry.id);
  }
  return (title: string, url?: string): Destination | null => {
    const slug = projectOf.get(title);
    if (slug) {
      return { text: `aimsresearchlab.com/projects/${slug}/`, qr: `/slides/qr-${slug}.svg` };
    }
    if (!url) return null;
    return { text: shorten(url), qr: `/slides/${qrFile(url)}` };
  };
}
