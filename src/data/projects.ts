// Projects shown on the homepage as cards. One entry per line of work.
// To add one: copy an entry. Keep `claim` to one sentence.

export interface ProjectLink {
  label: 'Paper' | 'Code' | 'Data' | 'Site';
  url: string;
}

export interface Project {
  title: string;
  claim: string;        // one-sentence finding or goal
  icon: string;         // Phosphor icon name, e.g. "ph:database"
  tags: string[];       // short area labels, 1 to 3
  links: ProjectLink[];
}

export const projects: Project[] = [
  {
    title: 'Same Ranking, Different Winner',
    claim: 'The scoring target a memory benchmark picks can flip which LLM wins, even when the overall ranking looks stable.',
    icon: 'ph:database',
    tags: ['Conversational memory', 'Evaluation'],
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2605.24060' },
      { label: 'Code', url: 'https://github.com/aimsresearchlab/Same-Ranking-Different-Winner-How-Scoring-Targets-Shape-LLM-Memory-Benchmarks' },
    ],
  },
  {
    title: 'Fixed RAG Compression',
    claim: 'A fixed compression layer in a RAG pipeline collapses the reader-scaling trend that the uncompressed setup shows.',
    icon: 'ph:stack',
    tags: ['RAG', 'Evaluation'],
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2606.21807' },
      { label: 'Code', url: 'https://github.com/aimsresearchlab/Fixed-RAG-Compression-Collapses-Measured-Reader-Scaling' },
    ],
  },
  {
    title: 'Outcome Monitors',
    claim: 'Recovery affordances that let an agent notice and repair tool calls that failed silently.',
    icon: 'ph:robot',
    tags: ['AI agents', 'Trustworthy AI'],
    links: [
      { label: 'Paper', url: 'https://arxiv.org/abs/2608.19303' },
    ],
  },
  {
    title: 'Thin-Object Segmentation',
    claim: 'A cross-domain survey of power-line, crack, and retinal-vessel segmentation, from classical pipelines to promptable foundation models.',
    icon: 'ph:eye',
    tags: ['Computer vision', 'Foundation models'],
    links: [
      { label: 'Paper', url: 'https://aquila.usm.edu/fac_pubs/22086/' },
    ],
  },
  {
    title: 'SEAM',
    claim: 'Measuring how much typed user speech gets absorbed into edited artifacts at unmarked within-turn seams.',
    icon: 'ph:text-align-left',
    tags: ['Human-centered AI', 'LLM editing'],
    links: [
      { label: 'Code', url: 'https://github.com/aimsresearchlab/seam' },
    ],
  },
];
