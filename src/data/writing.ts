// Plain-language write-ups of the lab's work, published on members' own
// sites. Feeds /writing and the "Write-ups" section on each project page.
// Newest first. `project` is a slug under src/content/projects/ (omit when
// the work has no project page yet); `url` is the post's canonical URL,
// trailing slash included.

export interface WriteUp {
  title: string;
  url: string;
  author: string;
  date: string; // ISO, the post's publish date
  summary: string; // one sentence, no trailing period needed
  project?: string;
}

export const writing: WriteUp[] = [
  {
    title: 'How to Create a Simple Synthetic Dataset',
    url: 'https://spanthi.com/blog/building-a-synthetic-dataset-for-llm-memory/',
    author: 'Sugam Panthi',
    date: '2026-09-21',
    summary: 'How the LAPSE benchmark was built: small probes first, minimal pairs, checked invented names, and a smoke test read by hand',
    project: 'lapse',
  },
  {
    title: 'Every Reported Number Should Trace to One Scorer and Run',
    url: 'https://spanthi.com/blog/a-number-you-cant-trace-is-a-rumor/',
    author: 'Sugam Panthi',
    date: '2026-08-18',
    summary: 'The bookkeeping rules behind running several paper projects at once, so every number in a paper points to the run that produced it',
  },
  {
    title: 'LLMs Absorb Text Typed After a Paste',
    url: 'https://spanthi.com/blog/where-does-the-paste-end/',
    author: 'Sugam Panthi',
    date: '2026-08-15',
    summary: 'Why models edit a typed afterthought into a pasted document, and why explicit markers work where blank lines do not',
    project: 'seam',
  },
  {
    title: 'Recovery Tools Help Agents Respond to Corrupted Tool Results',
    url: 'https://spanthi.com/blog/agents-believe-tools-that-lie/',
    author: 'Sugam Panthi',
    date: '2026-08-09',
    summary: 'Agents trust plausible but wrong tool output; a monitor helps only when its receipt names something the agent can do next',
    project: 'outcome-monitors',
  },
  {
    title: 'Memory Consolidation Turns Temporary Statements Into Standing Facts',
    url: 'https://spanthi.com/blog/aspect-persistence-eternal-present-memory/',
    author: 'Sugam Panthi',
    date: '2026-08-03',
    summary: 'A LAPSE pilot: memory writers rewrite "I am staying in" as "lives in", and date stamps barely change it',
    project: 'lapse',
  },
  {
    title: 'Scoring Targets Change Which Memory System Wins',
    url: 'https://spanthi.com/blog/your-memory-benchmark-is-lying-to-you/',
    author: 'Sugam Panthi',
    date: '2026-05-22',
    summary: 'The same ranked list can crown a different winner when the scoring target changes',
    project: 'same-ranking-different-winner',
  },
  {
    title: 'Evidence Compression Is Reader-Dependent',
    url: 'https://spanthi.com/blog/compression-is-a-coin-flip/',
    author: 'Sugam Panthi',
    date: '2026-04-24',
    summary: 'Compressing retrieved evidence helps small reader models and is a coin flip for strong ones',
    project: 'fixed-rag-compression',
  },
];
