// Copy for the lab reel at /reel that has no other home: the order the camera
// visits the posters in, and the numbers each scene shows. Project titles,
// claims and covers come from src/content/projects/; SEAM and TIAP numbers are
// read at build time from their demo data in reel.astro, not typed here. The
// numbers that are typed here are quoted from the arXiv abstract named beside
// them, and nothing else.

export type Wall = 'left' | 'right';

export interface PosterSpot {
  slug: string;  // a project slug, or 'lapse' (a preprint with no project page yet)
  wall: Wall;
  z: number;     // metres down the room from the photo's camera, negative is away
}

/**
 * The posters in the order the camera visits them. Positions are along the
 * side walls of the room rebuilt in src/scripts/reel/lab.ts. Five hang over
 * the five real posters in the photo (measured centres); the other two are on
 * bare wall near the back.
 */
export const posterSpots: PosterSpot[] = [
  { slug: 'same-ranking-different-winner', wall: 'left', z: -3.22 },
  { slug: 'seam', wall: 'right', z: -4.15 },
  { slug: 'fixed-rag-compression', wall: 'left', z: -5.03 },
  { slug: 'outcome-monitors', wall: 'right', z: -6.08 },
  { slug: 'gaussian-streaming', wall: 'left', z: -7.0 },
  { slug: 'lapse', wall: 'right', z: -7.6 },
  { slug: 'thin-object-segmentation', wall: 'left', z: -8.55 },
];

/**
 * LAPSE has a preprint but no project page, so its poster copy lives here.
 * The cover is the paper's Figure 1 (figures/aspect-persistence/ in the
 * research repo), resized to 1600 px wide.
 */
export const lapse = {
  title: 'LAPSE',
  cover: '/reel/lapse-overview.webp',
  claim: 'Memory consolidation flattens the temporal shape of user facts: an ongoing activity is stored as a standing one.',
  tags: ['ConversationalMemory', 'Evaluation'],
  venue: 'arXiv 2609.36457',
};

// https://arxiv.org/abs/2609.36457 (abstract, verified 2026-10-04)
export const lapseNumbers = {
  said: 'I am driving a Peugeot',
  stored: 'The user drives a Peugeot',
  flattened: 244,
  pairs: 381,
  configs: 11,
  pipelines: ['mem0', 'Graphiti', 'Letta'],
};

// https://arxiv.org/abs/2608.19303 (abstract, verified 2026-10-04)
export const monitorNumbers = {
  before: 10.9, // ToolMaze completion, %
  after: 28.1,
  models: 'four models in two provider families',
};

// https://arxiv.org/abs/2606.21807 (abstract, verified 2026-10-04)
export const ragNumbers = {
  readers: 20,
  significant: 'nine of ten settings',
  flippedPct: 31, // pairwise rankings flipped by generic summarization, LongMemEval-S
  hiddenPct: 80,  // share of the Qwen 7B to GPT-4.1-mini upgrade hidden by a fixed HotpotQA compressor
};
