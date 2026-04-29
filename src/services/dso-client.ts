const API_KEY = process.env.DSO_API_KEY || '';
const BASE_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/toepasbareregelsuitvoerenservices/v3';

export interface DSOQuestion {
  id: number;
  text: string;
  answerType: 'boolean' | 'numeriek' | 'lijstwaarde' | 'datum' | 'string';
  options?: Array<{ id: string; label: string }>;
}

export interface PermitCheckResponse {
  requires_permit: boolean;
  permit_type?: string;
  description?: string;
  questions_needed: boolean;
  questions?: DSOQuestion[];
}

function logRequestBody(body: any) {
  console.log('   📦 Full request body:');
  console.log(JSON.stringify(body, null, 2).substring(0, 500));
}

// Convert user-friendly answers to DSO API format
function convertAnswer(answer: string, answerType: string): string {
  if (answerType === 'boolean') {
    // Convert Dutch ja/nee to true/false
    if (answer.toLowerCase() === 'ja') return 'true';
    if (answer.toLowerCase() === 'nee') return 'false';
    return answer;
  }
  return answer;
}

export async function checkPermitRequirement(request: {
  coordinates: [number, number];
  werkzaamheid: string;
  answers?: Array<{ id: number; answer: string; answerType?: string }>;
}): Promise<PermitCheckResponse> {
  const url = `${BASE_URL}/conclusie/_bepaal`;
  
  console.log(`\n🔍 DSO Request:`);
  console.log(`   Activity: ${request.werkzaamheid}`);
  console.log(`   Coordinates: [${request.coordinates[0]}, ${request.coordinates[1]}]`);
  
  const functioneleStructuurRef: any = {
    functioneleStructuurRef: `http://toepasbare-regels.omgevingswet.overheid.nl/werkzaamheden/id/concept/${request.werkzaamheid}`
  };
  
  if (request.answers && request.answers.length > 0) {
    functioneleStructuurRef.antwoorden = request.answers.map(a => ({
      id: a.id,
      antwoord: convertAnswer(a.answer, a.answerType || 'string')
    }));
    console.log(`   📤 Sending ${request.answers.length} formatted answers`);
  }
  
  const body = {
    functioneleStructuurRefs: [functioneleStructuurRef],
    _geo: {
      intersects: {
        type: 'Point',
        coordinates: request.coordinates
      }
    }
  };
  
  logRequestBody(body);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Crs': 'EPSG:28992',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log(`   Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ DSO API Error (${response.status}):`, errorText);
      return {
        requires_permit: true,
        permit_type: 'unknown',
        description: 'Unable to determine — check with municipality',
        questions_needed: false
      };
    }

    const data = await response.json();
    const firstResult = Array.isArray(data) ? data[0] : data;
    
    for (const activiteit of firstResult?.activiteiten || []) {
      if (activiteit.conclusies && activiteit.conclusies.length > 0) {
        const c = activiteit.conclusies[0];
        console.log(`   ✅ Conclusion: ${c.toestemmingstype?.code} - ${c.toestemmingstype?.waarde}`);
        return {
          requires_permit: c.toestemmingstype?.code === 'Vergunningplicht' || c.toestemmingstype?.code === 'Verbod',
          permit_type: c.toestemmingstype?.code,
          description: c.toestemmingstype?.waarde,
          questions_needed: false
        };
      }
    }
    
    for (const activiteit of firstResult?.activiteiten || []) {
      if (activiteit.vraaggroepen && activiteit.vraaggroepen.length > 0) {
        const questions: DSOQuestion[] = [];
        for (const groep of activiteit.vraaggroepen) {
          for (const v of groep.vragen || []) {
            questions.push({
              id: v.id,
              text: v.tekst || v.omschrijving || 'Vraag',
              answerType: v.antwoordType || 'string',
              options: v.opties?.map((o: any) => ({ id: o.optieTekst || o.id, label: o.optieTekst || o.label }))
            });
          }
        }
        console.log(`   ❓ Got ${questions.length} questions`);
        return {
          requires_permit: true,
          description: `${questions.length} questions need answers`,
          questions_needed: true,
          questions
        };
      }
    }
    
    console.log(`   ⚠️ No conclusion or questions found`);
    return {
      requires_permit: false,
      description: 'Geen vergunning nodig (Toestemmingsvrij)',
      questions_needed: false
    };
    
  } catch (error) {
    console.error(`   ❌ DSO request failed:`, error);
    return {
      requires_permit: true,
      permit_type: 'error',
      description: 'Service temporarily unavailable — check manually',
      questions_needed: false
    };
  }
}
