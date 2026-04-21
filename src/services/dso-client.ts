/**
 * DSO Client — Permit Requirement Checking
 * Permit Intelligence Platform
 */

const API_KEY = '357661e4-a1e1-47f0-a12f-6fe9909627f6';
const BASE_URL = 'https://service.pre.omgevingswet.overheid.nl/publiek/toepasbare-regels/api/toepasbareregelsuitvoerenservices/v3';

export interface PermitCheckRequest {
  coordinates: [number, number];
  werkzaamheid: string;
}

export interface PermitCheckResponse {
  requires_permit: boolean;
  permit_type?: string;
  description?: string;
  questions_needed?: boolean;
}

export async function checkPermitRequirement(
  request: PermitCheckRequest
): Promise<PermitCheckResponse> {
  const url = `${BASE_URL}/conclusie/_bepaal`;
  
  const body = {
    functioneleStructuurRefs: [{
      functioneleStructuurRef: `http://toepasbare-regels.omgevingswet.overheid.nl/werkzaamheden/id/concept/${request.werkzaamheid}`
    }],
    _geo: {
      intersects: {
        type: 'Point',
        coordinates: request.coordinates
      }
    }
  };

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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DSO API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  const firstResult = Array.isArray(data) ? data[0] : data;
  
  if (!firstResult?.activiteiten) {
    console.log('   [DEBUG] No activiteiten found');
    return {
      requires_permit: false,
      description: 'No activities found in response',
      questions_needed: false
    };
  }
  
  // Search through ALL activiteiten for a conclusion
  for (const activiteit of firstResult.activiteiten) {
    if (activiteit.conclusies && activiteit.conclusies.length > 0) {
      const conclusie = activiteit.conclusies[0];
      const code = conclusie.toestemmingstype?.code;
      const waarde = conclusie.toestemmingstype?.waarde;
      
      console.log(`   [DEBUG] Found conclusie: ${code} - ${waarde}`);
      console.log(`   [DEBUG] Activiteit: ${activiteit.subactiviteitNaam || 'unknown'}`);
      
      return {
        requires_permit: code === 'Vergunningplicht' || code === 'Verbod',
        permit_type: code,
        description: waarde,
        questions_needed: false
      };
    }
    
    if (activiteit.vraaggroepen && activiteit.vraaggroepen.length > 0) {
      console.log(`   [DEBUG] Found vraaggroepen in: ${activiteit.subactiviteitNaam || 'unknown'}`);
      return {
        requires_permit: true,
        description: `Additional questions needed for ${activiteit.subactiviteitNaam || 'activity'}`,
        questions_needed: true
      };
    }
  }
  
  // No conclusion or questions found in any activiteit
  console.log(`   [DEBUG] No conclusion found in ${firstResult.activiteiten.length} activiteiten`);
  
  return {
    requires_permit: false,
    description: 'No permit conclusion found — check manually',
    questions_needed: false
  };
}