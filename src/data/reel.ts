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
 * The posters in the order the camera visits them. This is the advisor's
 * priority order (see AGENTS.md), not a topic order. Positions are along the
 * side walls of the room rebuilt in src/scripts/reel/lab.ts. Five hang over
 * the five real posters in the photo (measured centres); the other three are on
 * bare wall: two near the back, and right z -2.3, the spot added for the
 * eighth poster (a poster is 1.3 m wide, so it clears the one at -4.15 and the
 * desks, which only start at -2.4 and are far below the poster's 2.03 m).
 */
export const posterSpots: PosterSpot[] = [
  { slug: 'same-ranking-different-winner', wall: 'right', z: -2.3 },
  { slug: 'seam', wall: 'left', z: -3.22 },
  { slug: 'outcome-monitors', wall: 'right', z: -4.15 },
  { slug: 'thin-object-segmentation', wall: 'left', z: -5.03 },
  { slug: 'smoke-detection', wall: 'right', z: -6.08 },
  { slug: 'gaussian-streaming', wall: 'left', z: -7.0 },
  { slug: 'fixed-rag-compression', wall: 'right', z: -7.6 },
  { slug: 'lapse', wall: 'left', z: -8.55 },
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

export interface Backdrop {
  src: string;
  photographer?: string; // Pexels credit; absent for the lab's own photo
  url?: string;          // the photo's Pexels page
}

/**
 * The photo behind each scene, under a navy gradient so the result stays the
 * subject. Each shows the paper's own running example (the warehouse task, the
 * driver, the pasted text), not a generic AI image. Stock photos are from
 * Pexels (free license, credit optional; we credit in the scene footer),
 * resized to 1920x1080 webp at quality 72. 4D Gaussian Streaming has none: its
 * own capture frames fill that scene.
 */
export const backdrops: Record<string, Backdrop> = {
  'same-ranking-different-winner': { src: '/reel/bg-same-ranking-different-winner.webp', photographer: 'Siarhei Nester', url: 'https://www.pexels.com/photo/28827841/' },
  seam: { src: '/reel/bg-seam.webp', photographer: 'Israel Torres', url: 'https://www.pexels.com/photo/17810854/' },
  'fixed-rag-compression': { src: '/reel/bg-fixed-rag-compression.webp', photographer: 'Tima Miroshnichenko', url: 'https://www.pexels.com/photo/9572664/' },
  'outcome-monitors': { src: '/reel/bg-outcome-monitors.webp', photographer: 'Daniel Andraski', url: 'https://www.pexels.com/photo/12234109/' },
  lapse: { src: '/reel/bg-lapse.webp', photographer: 'Allen Boguslavsky', url: 'https://www.pexels.com/photo/32560104/' },
  'thin-object-segmentation': { src: '/reel/bg-thin-object-segmentation.webp', photographer: 'Altaf Shah', url: 'https://www.pexels.com/photo/12340772/' },
  people: { src: '/reel/room.webp' },
};

/**
 * The 20 readers of Fixed RAG Compression, weakest baseline first, as in Table
 * 4 of https://arxiv.org/abs/2606.21807 (HTML, verified 2026-10-05). `icon` is
 * a family logo in public/reel/icons/ (@lobehub/icons, see research/icons.md),
 * drawn on a light tile so the dark logos (OpenAI, Grok, Gemma) read.
 */
export const ragReaders: { name: string; icon: string }[] = [
  { name: 'Llama 3.1 8B', icon: 'meta-color' },
  { name: 'Qwen 2.5 7B', icon: 'qwen-color' },
  { name: 'OLMo 3.1 32B', icon: 'ai2-color' },
  { name: 'Llama-4 Scout', icon: 'meta-color' },
  { name: 'Command-R', icon: 'cohere-color' },
  { name: 'GLM-4 32B', icon: 'zhipu-color' },
  { name: 'Qwen3 14B', icon: 'qwen-color' },
  { name: 'GPT-4.1-mini', icon: 'openai' },
  { name: 'Llama 3.3 70B', icon: 'meta-color' },
  { name: 'Claude 3.5 Haiku', icon: 'claude-color' },
  { name: 'Gemma 3 12B', icon: 'gemma-color' },
  { name: 'Phi-4', icon: 'microsoft-color' },
  { name: 'Llama 3.1 70B', icon: 'meta-color' },
  { name: 'Gemma 3 27B', icon: 'gemma-color' },
  { name: 'Qwen3 32B', icon: 'qwen-color' },
  { name: 'Qwen 2.5 72B', icon: 'qwen-color' },
  { name: 'DS-R1 70B', icon: 'deepseek-color' },
  { name: 'Grok 4.1-fast', icon: 'grok' },
  { name: 'Qwen3 8B', icon: 'qwen-color' },
  { name: 'Seed-2.0-Mini', icon: 'bytedance-color' },
];
