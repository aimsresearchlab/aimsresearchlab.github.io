// Dated news feed. Newest first; the homepage shows the first `limit` entries.
// To add an item: copy an entry to the top. Dates are ISO (YYYY-MM-DD).

export interface NewsItem {
  date: string;   // "2026-08-20"
  text: string;   // one sentence, no trailing period needed
  url?: string;   // optional link (paper, repo, announcement)
}

export const news: NewsItem[] = [
  {
    date: '2026-09-10',
    text: 'Lab website launched at aimsresearchlab.com',
  },
  {
    date: '2026-08-20',
    text: '"Same Ranking, Different Winner" accepted to Findings of EMNLP 2026',
    url: 'https://arxiv.org/abs/2605.24060',
  },
  {
    date: '2026-08-19',
    text: 'New preprint: "Outcome Monitors: Recovery Affordances for Silent Tool Failures"',
    url: 'https://arxiv.org/abs/2608.19303',
  },
  {
    date: '2026-06-19',
    text: 'New preprint: "Fixed RAG Compression Collapses Measured Reader Scaling"',
    url: 'https://arxiv.org/abs/2606.21807',
  },
  {
    date: '2026-01-01',
    text: 'Thin-object segmentation survey accepted to IEEE Internet of Things Journal',
    url: 'https://aquila.usm.edu/fac_pubs/22086/',
  },
];

export function recentNews(limit = 5): NewsItem[] {
  return [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

// "Aug 20, 2026"
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
}
