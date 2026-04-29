import fs from 'fs';

const API_KEY = process.env.DSO_API_KEY || '357661e4-a1e1-47f0-a12f-6fe9909627f6';
const BASE_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/opvragenwerkzaamheden/v1/werkzaamheden';

async function fetchAllWerkzaamheden() {
  console.log('🚀 Fetching all werkzaamheden from DSO API...\n');
  
  const allWerkzaamheden: string[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${BASE_URL}?page=${page}&pageSize=100`;
    console.log(`   Fetching page ${page}...`);
    
    try {
      const response = await fetch(url, {
        headers: { 
          'x-api-key': API_KEY
          // Don't set Accept header - let server decide
        }
      });
      
      if (!response.ok) {
        console.error(`   ❌ Error on page ${page}: ${response.status}`);
        const text = await response.text();
        console.error(`   Response: ${text.substring(0, 200)}`);
        break;
      }
      
      const data = await response.json();
      
      if (data._embedded?.werkzaamheden) {
        const items = data._embedded.werkzaamheden;
        items.forEach((w: any) => allWerkzaamheden.push(w.urn));
        console.log(`   ✅ Got ${items.length} items`);
      }
      
      hasMore = !!data._links?.next;
      page++;
      
    } catch (error) {
      console.error(`   ❌ Error on page ${page}:`, error);
      hasMore = false;
    }
  }
  
  allWerkzaamheden.sort();
  console.log(`\n📊 Total werkzaamheden fetched: ${allWerkzaamheden.length}`);
  
  if (allWerkzaamheden.length > 0) {
    fs.writeFileSync('public/werkzaamheden.json', JSON.stringify(allWerkzaamheden, null, 2));
    console.log('✅ Saved to public/werkzaamheden.json');
    
    const tsContent = `// Auto-generated from DSO API - ${new Date().toISOString()}\n// Total: ${allWerkzaamheden.length} items\n\nexport const WERKZAAMHEDEN = ${JSON.stringify(allWerkzaamheden, null, 2)} as const;\n`;
    fs.writeFileSync('src/werkzaamheden-list.ts', tsContent);
    console.log('✅ Saved to src/werkzaamheden-list.ts');
    
    console.log('\n📋 Sample activities:');
    allWerkzaamheden.slice(0, 10).forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
  } else {
    console.log('\n❌ No activities fetched. Using fallback list.');
  }
}

fetchAllWerkzaamheden();
