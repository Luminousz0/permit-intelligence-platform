import fs from 'fs';

const API_KEY = '357661e4-a1e1-47f0-a12f-6fe9909627f6';
const BASE_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/opvragenwerkzaamheden/v1/werkzaamheden';

async function fetchAllWerkzaamheden() {
  console.log('Fetching all werkzaamheden...');
  
  const allWerkzaamheden: string[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${BASE_URL}?page=${page}&pageSize=100`;
    console.log(`  Page ${page}...`);
    
    try {
      const response = await fetch(url, {
        headers: { 'x-api-key': API_KEY, 'Accept': 'application/json' }
      });
      
      if (!response.ok) break;
      
      const data = await response.json();
      
      if (data._embedded?.werkzaamheden) {
        data._embedded.werkzaamheden.forEach((w: any) => {
          allWerkzaamheden.push(w.urn);
        });
      }
      
      hasMore = !!data._links?.next;
      page++;
      
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      hasMore = false;
    }
  }
  
  allWerkzaamheden.sort();
  console.log(`✅ Total: ${allWerkzaamheden.length}`);
  
  const tsContent = `// Auto-generated from DSO API\nexport const WERKZAAMHEDEN = ${JSON.stringify(allWerkzaamheden, null, 2)} as const;\n`;
  fs.writeFileSync('src/werkzaamheden-list.ts', tsContent);
  console.log('✅ Saved to src/werkzaamheden-list.ts');
}

fetchAllWerkzaamheden();
