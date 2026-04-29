import fs from 'fs';
import path from 'path';

const API_KEY = process.env.DSO_API_KEY || '357661e4-a1e1-47f0-a12f-6fe9909627f6';
const BASE_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/opvragenwerkzaamheden/v1/werkzaamheden';
const CACHE_FILE = path.join(__dirname, '../../public/werkzaamheden-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  timestamp: number;
  activities: string[];
}

export async function getValidWerkzaamheden(): Promise<string[]> {
  // Check cache first
  if (fs.existsSync(CACHE_FILE)) {
    const cache: CacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    if (Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached activities: ${cache.activities.length} items`);
      return cache.activities;
    }
  }
  
  // Fetch fresh from DSO
  console.log('🔄 Fetching fresh activities from DSO...');
  const activities: string[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const url = `${BASE_URL}?page=${page}&pageSize=100`;
      const response = await fetch(url, {
        headers: { 'x-api-key': API_KEY }
      });
      
      if (!response.ok) break;
      
      const data = await response.json();
      
      if (data._embedded?.werkzaamheden) {
        data._embedded.werkzaamheden.forEach((w: any) => {
          activities.push(w.urn);
        });
      }
      
      hasMore = !!data._links?.next;
      page++;
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }
  
  activities.sort();
  console.log(`✅ Fetched ${activities.length} valid activities`);
  
  // Save to cache
  const cache: CacheData = { timestamp: Date.now(), activities };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  
  return activities;
}
