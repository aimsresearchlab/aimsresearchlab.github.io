// Single source of truth for publications.
// The homepage "Recent" section and the /publications page both read from here.
// To add a paper: copy an entry. Order: published work first (newest first),
// then papers under review/revision, then arXiv-only preprints.

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
    title: 'From Classical Pipelines to Promptable Foundation Models: A Cross-Domain Survey of Thin-Object Segmentation for Power Lines, Cracks, and Retinal Vessels',
    authors: 'A. Hossain, N. Maharjan, M. Hasan, R. Abdelfattah, M. Ezz-Eldin, X. Wang, M. M. Fouda, K. Abdelfattah',
    venue: 'IEEE Internet of Things Journal',
    year: 2026,
    url: 'https://aquila.usm.edu/fac_pubs/22086/',
  },
  {
    title: 'Same Ranking, Different Winner: How Scoring Targets Shape LLM Memory Benchmarks',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'Findings of EMNLP 2026',
    year: 2026,
    url: 'https://arxiv.org/abs/2605.24060',
  },
  {
    title: 'Gaussian Splatting for Real-Time Scene Reconstruction: Methods, Systems, and Trade-offs',
    authors: 'A. Dahal, R. Abdelfattah',
    venue: 'Pattern Recognition (under major revision)',
    year: 2026,
  },
  {
    title: 'Bayesian Optimization-Aided Hybrid Deep Learning Model for Lightweight UAV-Based Smoke Detection',
    authors: 'R. Abdelfattah, K. Abdelfatah, M. M. Fouda, Z. M. Fadlullah, M. Abouyoussef, M. I. Ibrahem',
    venue: 'IEEE Internet of Things Journal',
    year: 2025,
    url: 'https://doi.org/10.1109/JIOT.2025.3578445',
  },
  {
    title: 'BOL-LPP: A Bayesian-Optimized LSTM Model for Day-Ahead Load Price Forecasting in the ERCOT Market',
    authors: 'Y. Mohamed, M. M. Fouda, Z. M. Fadlullah, R. Abdelfattah, M. I. Ibrahem',
    venue: 'IEEE Open Journal of the Computer Society',
    year: 2025,
    url: 'https://doi.org/10.1109/OJCS.2025.3580107',
  },
  {
    title: 'Dynamic Key-Based Privacy-Preserving Authentication Scheme for Internet of Drones',
    authors: 'M. Z. Chaudhary, E. Hernandez Escobar, A. Sherif, K. Khalil, R. Abdelfattah',
    venue: 'IEEE SoutheastCon 2025',
    year: 2025,
    url: 'https://doi.org/10.1109/SoutheastCon56624.2025.10971451',
  },
  {
    title: 'Evaluating Prompt Engineering for Generalized Power Line Segmentation',
    authors: 'A. Hossain, M. Hasan, R. Abdelfattah, D. Scott, K. Abdelfatah, A. Sherif',
    venue: 'IEEE SoutheastCon 2025',
    year: 2025,
    url: 'https://doi.org/10.1109/SoutheastCon56624.2025.10971697',
  },
  {
    title: 'CDUL: CLIP-Driven Unsupervised Learning for Multi-Label Image Classification',
    authors: 'R. Abdelfattah, Q. Guo, X. Li, X. Wang, S. Wang',
    venue: 'ICCV 2023',
    year: 2023,
    url: 'https://doi.org/10.1109/ICCV51070.2023.00130',
  },
  {
    title: 'PLGAN: Generative Adversarial Networks for Power-Line Segmentation in Aerial Images',
    authors: 'R. Abdelfattah, X. Wang, S. Wang',
    venue: 'IEEE Transactions on Image Processing',
    year: 2023,
    url: 'https://doi.org/10.1109/TIP.2023.3321465',
  },
  {
    title: 'G2Net: Generic Game-Theoretic Network for Partial-Label Image Classification',
    authors: 'R. Abdelfattah, X. Zhang, M. M. Fouda, X. Wang, S. Wang',
    venue: 'BMVC 2022',
    year: 2022,
    url: 'https://arxiv.org/abs/2210.11469',
  },
  {
    title: 'PLMCL: Partial-Label Momentum Curriculum Learning for Multi-label Image Classification',
    authors: 'R. Abdelfattah, X. Zhang, X. Wu, Z. Wu, X. Wang, S. Wang',
    venue: 'ECCV Workshops 2022',
    year: 2022,
    url: 'https://arxiv.org/abs/2208.09999',
  },
  {
    title: 'Depth Monocular Estimation with Attention-based Encoder-Decoder Network from Single Image',
    authors: 'X. Zhang, R. Abdelfattah, Y. Song, S. A. Dauchert, X. Wang',
    venue: 'IEEE HPCC 2022',
    year: 2022,
    url: 'https://doi.org/10.1109/HPCC-DSS-SmartCity-DependSys57074.2022.00271',
  },
  {
    title: 'An Effective Approach for Multi-label Classification with Missing Labels',
    authors: 'X. Zhang, R. Abdelfattah, X. Wang, S. Wang',
    venue: 'IEEE HPCC 2022',
    year: 2022,
    url: 'https://doi.org/10.1109/HPCC-DSS-SmartCity-DependSys57074.2022.00259',
  },
  {
    title: 'TTPLA: An Aerial-Image Dataset for Detection and Segmentation of Transmission Towers and Power Lines',
    authors: 'R. Abdelfattah, X. Wang, S. Wang',
    venue: 'ACCV 2020',
    year: 2020,
    url: 'https://doi.org/10.1007/978-3-030-69544-6_36',
  },
  {
    title: 'Outcome Monitors: Recovery Affordances for Silent Tool Failures',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'arXiv preprint',
    year: 2026,
    url: 'https://arxiv.org/abs/2608.19303',
  },
  {
    title: 'Fixed RAG Compression Collapses Measured Reader Scaling',
    authors: 'S. Panthi, R. Abdelfattah',
    venue: 'arXiv preprint',
    year: 2026,
    url: 'https://arxiv.org/abs/2606.21807',
  },
  {
    title: 'Does It Matter Which Gaussians You Pick in 4D Gaussian Streaming?',
    authors: 'A. Dahal, R. Abdelfattah, N. Rahimi',
    venue: 'arXiv preprint',
    year: 2026,
    url: 'https://arxiv.org/abs/2603.17227',
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
