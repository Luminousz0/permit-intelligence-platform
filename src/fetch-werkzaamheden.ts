import fs from 'fs';
import path from 'path';

const API_KEY = '357661e4-a1e1-47f0-a12f-6fe9909627f6';
const WERKZAAMHEDEN_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/opvragenwerkzaamheden/v1/werkzaamheden?pageSize=300';

async function fetchAllWerkzaamheden() {
  console.log('Fetching all werkzaamheden from DSO API...');
  
  const allWerkzaamheden: string[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${WERKZAAMHEDEN_URL}&page=${page}`;
    console.log(`  Fetching page ${page}...`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'x-api-key': API_KEY,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data._embedded?.werkzaamheden) {
        const items = data._embedded.werkzaamheden;
        items.forEach((item: any) => allWerkzaamheden.push(item.urn));
        console.log(`    Got ${items.length} items`);
      }
      
      // Check if there's a next page
      hasMore = !!data._links?.next;
      page++;
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }
  
  // Sort alphabetically
  allWerkzaamheden.sort();
  
  console.log(`\n✅ Total werkzaamheden fetched: ${allWerkzaamheden.length}`);
  
  // Save to JSON file
  const outputPath = path.join(__dirname, '../public/werkzaamheden.json');
  fs.writeFileSync(outputPath, JSON.stringify(allWerkzaamheden, null, 2));
  console.log(`✅ Saved to ${outputPath}`);
  
  // Also save as TypeScript file for backup
  const tsOutputPath = path.join(__dirname, 'werkzaamheden-list.ts');
  const tsContent = `// Auto-generated from DSO API\n// Total: ${allWerkzaamheden.length} items\n\nexport const WERKZAAMHEDEN = ${JSON.stringify(allWerkzaamheden, null, 2)} as const;\n`;
  fs.writeFileSync(tsOutputPath, tsContent);
  console.log(`✅ Saved TypeScript version to ${tsOutputPath}`);
}

fetchAllWerkzaamheden().catch(console.error);
