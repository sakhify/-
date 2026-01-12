
import { RateLadderItem } from './types';

export const DEFAULT_RATE_LADDER: RateLadderItem[] = [
  { minPoints: 36.0, rate: 16 },
  { minPoints: 34.1, rate: 15 },
  { minPoints: 33.51, rate: 14 },
  { minPoints: 33.1, rate: 13 },
  { minPoints: 32.51, rate: 12 },
  { minPoints: 30.0, rate: 10 },
];

export const MOCK_FARMERS = [
  { 
    id: 'f1', 
    name: 'শিকদার পোল্ট্রি ফার্ম', 
    location: 'সাভার', 
    profilePic: 'https://images.unsplash.com/photo-1594901851159-41e99f1e1021?auto=format&fit=crop&q=80&w=200' 
  },
  { 
    id: 'f2', 
    name: 'আলি আহমেদ ফার্ম', 
    location: 'গাজীপুর', 
    profilePic: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&q=80&w=200' 
  }
];
