// Projects shown on the homepage as cards. One entry per line of work.
// To add one: copy an entry. Keep `claim` to one sentence.

// `kind` picks the icon and label: arxiv -> arXiv logo, github -> GitHub logo,
// paper -> generic document (DOI, publisher, or repository record).
export interface ProjectLink {
  kind: 'arxiv' | 'github' | 'paper';
  url: string;
}

export interface Project {
  title: string;
  claim: string;        // one-sentence finding or goal
  tags: string[];       // 1 to 3 hashtag tokens, CamelCase, no spaces (rendered as #Tag)
  links: ProjectLink[];
}

export const projects: Project[] = [
  {
    title: 'Same Ranking, Different Winner',
    claim: 'The scoring target a memory benchmark picks can flip which LLM wins, even when the overall ranking looks stable.',
    tags: ['ConversationalMemory', 'Evaluation'],
    links: [
      { kind: 'arxiv', url: 'https://arxiv.org/abs/2605.24060' },
      { kind: 'github', url: 'https://github.com/aimsresearchlab/Same-Ranking-Different-Winner-How-Scoring-Targets-Shape-LLM-Memory-Benchmarks' },
    ],
  },
  {
    title: 'Fixed RAG Compression',
    claim: 'A fixed compression layer in a RAG pipeline collapses the reader-scaling trend that the uncompressed setup shows.',
    tags: ['RAG', 'Evaluation'],
    links: [
      { kind: 'arxiv', url: 'https://arxiv.org/abs/2606.21807' },
      { kind: 'github', url: 'https://github.com/aimsresearchlab/Fixed-RAG-Compression-Collapses-Measured-Reader-Scaling' },
    ],
  },
  {
    title: 'Outcome Monitors',
    claim: 'Recovery affordances that let an agent notice and repair tool calls that failed silently.',
    tags: ['AIAgents', 'TrustworthyAI'],
    links: [
      { kind: 'arxiv', url: 'https://arxiv.org/abs/2608.19303' },
    ],
  },
  {
    title: 'Thin-Object Segmentation',
    claim: 'A cross-domain survey of power-line, crack, and retinal-vessel segmentation, from classical pipelines to promptable foundation models.',
    tags: ['ComputerVision', 'FoundationModels'],
    links: [
      { kind: 'paper', url: 'https://aquila.usm.edu/fac_pubs/22086/' },
    ],
  },
  {
    title: 'SEAM',
    claim: 'Measuring how much typed user speech gets absorbed into edited artifacts at unmarked within-turn seams.',
    tags: ['HumanCenteredAI', 'LLMEditing'],
    links: [
      { kind: 'github', url: 'https://github.com/aimsresearchlab/seam' },
    ],
  },
];
