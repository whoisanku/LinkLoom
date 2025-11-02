import type { TIntroducer, TTarget } from "../type/data";

export const INTRODUCER_DATA: TIntroducer[] = [
  {
    id: 'intro_001',
    username: 'sarah_chen',
    score: 95,
    connections: ['target_003', 'target_007', 'target_012', 'target_015'],
  },
  {
    id: 'intro_002',
    username: 'michael_rodriguez',
    score: 88,
    connections: ['target_001', 'target_005', 'target_009'],
  },
  {
    id: 'intro_003',
    username: 'emily_watson',
    score: 92,
    connections: ['target_002', 'target_006', 'target_010', 'target_014', 'target_018'],
  },
  {
    id: 'intro_004',
    username: 'james_patel',
    score: 78,
    connections: ['target_004', 'target_008'],
  },
  {
    id: 'intro_005',
    username: 'lisa_nguyen',
    score: 85,
    connections: ['target_011', 'target_013', 'target_016', 'target_019'],
  },
  {
    id: 'intro_006',
    username: 'david_kim',
    score: 91,
    connections: ['target_017', 'target_020', 'target_021'],
  },
  {
    id: 'intro_007',
    username: 'amanda_foster',
    score: 82,
    connections: ['target_022', 'target_023', 'target_024', 'target_025'],
  },
];

export const TARGET_DATA: TTarget[] = [
  {
    id: 'target_001',
    username: 'alex_johnson',
    score: 87,
    relevance: 'High interest in tech startups and blockchain',
  },
  {
    id: 'target_002',
    username: 'priya_sharma',
    score: 93,
    relevance: 'Active in AI/ML communities, seeking mentorship',
  },
  {
    id: 'target_003',
    username: 'carlos_martinez',
    score: 76,
    relevance: 'Looking for co-founders in fintech space',
  },
  {
    id: 'target_004',
    username: 'olivia_brown',
    score: 89,
    relevance: 'Product designer interested in SaaS collaboration',
  },
  {
    id: 'target_005',
    username: 'ryan_taylor',
    score: 81,
    relevance: 'DevOps engineer seeking open source contributors',
  },
  {
    id: 'target_006',
    username: 'sophia_anderson',
    score: 95,
    relevance: 'Venture capital connections, actively investing',
  },
  {
    id: 'target_007',
    username: 'nathan_lee',
    score: 72,
    relevance: 'Early-stage founder in edtech sector',
  },
  {
    id: 'target_008',
    username: 'isabella_garcia',
    score: 88,
    relevance: 'Growth marketing expert for B2B SaaS',
  },
  {
    id: 'target_009',
    username: 'ethan_wilson',
    score: 84,
    relevance: 'Mobile developer interested in healthtech',
  },
  {
    id: 'target_010',
    username: 'mia_thompson',
    score: 91,
    relevance: 'Angel investor focused on climate tech',
  },
  {
    id: 'target_011',
    username: 'lucas_white',
    score: 79,
    relevance: 'Data scientist exploring freelance opportunities',
  },
  {
    id: 'target_012',
    username: 'ava_harris',
    score: 86,
    relevance: 'Content strategist for tech companies',
  },
  {
    id: 'target_013',
    username: 'noah_martin',
    score: 90,
    relevance: 'Full-stack developer, startup enthusiast',
  },
  {
    id: 'target_014',
    username: 'emma_clark',
    score: 83,
    relevance: 'Legal advisor specializing in tech contracts',
  },
  {
    id: 'target_015',
    username: 'liam_lewis',
    score: 77,
    relevance: 'Sales professional in enterprise software',
  },
  {
    id: 'target_016',
    username: 'charlotte_walker',
    score: 92,
    relevance: 'UX researcher for consumer apps',
  },
  {
    id: 'target_017',
    username: 'mason_hall',
    score: 85,
    relevance: 'Cybersecurity expert seeking partnerships',
  },
  {
    id: 'target_018',
    username: 'amelia_young',
    score: 80,
    relevance: 'Community manager for web3 projects',
  },
  {
    id: 'target_019',
    username: 'oliver_king',
    score: 94,
    relevance: 'Technical co-founder with exit experience',
  },
  {
    id: 'target_020',
    username: 'harper_wright',
    score: 75,
    relevance: 'Financial analyst for tech IPOs',
  },
  {
    id: 'target_021',
    username: 'elijah_lopez',
    score: 88,
    relevance: 'Cloud architect specializing in scalability',
  },
  {
    id: 'target_022',
    username: 'evelyn_hill',
    score: 82,
    relevance: 'HR consultant for fast-growing startups',
  },
  {
    id: 'target_023',
    username: 'william_scott',
    score: 87,
    relevance: 'Backend engineer interested in distributed systems',
  },
  {
    id: 'target_024',
    username: 'abigail_green',
    score: 78,
    relevance: 'PR specialist for technology brands',
  },
  {
    id: 'target_025',
    username: 'benjamin_adams',
    score: 91,
    relevance: 'Serial entrepreneur in consumer tech',
  },
];
