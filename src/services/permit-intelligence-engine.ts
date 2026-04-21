import { addressToCoordinates } from './pdok-geocoder';
import { checkPermitRequirement } from './dso-client';
import { checkParticipationRequirement, ProjectSpec } from './participation-checker';
import { generateVerslagTemplateHTML, generateMunicipalitySpecificNotesHTML } from './verslag-template-generator';

export interface AnalyzeProjectRequest {
  address: string;
  werkzaamheid?: string;
  project_type?: string;
  housing_units?: number;
  building_height_meters?: number;
}

export async function analyzeProject(request: AnalyzeProjectRequest) {
  console.log(`📍 Geocoding: ${request.address}`);
  const coords = await addressToCoordinates(request.address);
  const municipality = coords.municipality;
  
  console.log(`   ✅ ${coords.address}`);
  console.log(`   RD: [${coords.rd[0].toFixed(0)}, ${coords.rd[1].toFixed(0)}]`);
  
  const werkzaamheid = request.werkzaamheid || 'AanbouwPlaatsen';
  console.log(`\n🔍 DSO Check: ${werkzaamheid}`);
  
  let permitResult;
  try {
    permitResult = await checkPermitRequirement({
      coordinates: coords.rd,
      werkzaamheid
    });
    console.log(`   Required: ${permitResult.requires_permit ? 'Yes' : 'No'}`);
    console.log(`   ${permitResult.description || ''}`);
  } catch (error) {
    console.log(`   ⚠️ DSO API error — assuming permit required`);
    permitResult = { requires_permit: true, description: 'Check manually', questions_needed: false };
  }
  
  let projectType: any = 'other';
  if (werkzaamheid.includes('Woning') || werkzaamheid.includes('woning')) projectType = 'housing_new';
  else if (werkzaamheid.includes('Aanbouw') || werkzaamheid.includes('Verbouw')) projectType = 'housing_renovation';
  else if (werkzaamheid.includes('Zonne')) projectType = 'renewable_energy';
  else if (werkzaamheid.includes('Bedrijf') || werkzaamheid.includes('Kantoor')) projectType = 'commercial';
  
  const projectSpec: ProjectSpec = {
    type: projectType,
    housing_units: request.housing_units,
    building_height_meters: request.building_height_meters,
    location_type: 'urban'
  };
  
  console.log(`\n👥 Participation (${municipality}):`);
  const participation = checkParticipationRequirement(municipality, projectSpec);
  console.log(`   Required: ${participation.required}`);
  console.log(`   Architecture: ${participation.architecture}`);
  
  // Generate HTML template for Word
  const templateData = {
    projectName: `Project ${coords.address.split(',')[0]}`,
    projectAddress: coords.address,
    municipality: municipality,
    activityType: werkzaamheid,
    housingUnits: request.housing_units
  };
  
  const verslagTemplate = generateVerslagTemplateHTML(templateData);
  const municipalityNotes = generateMunicipalitySpecificNotesHTML(municipality);
  
  // Combine template with municipality-specific notes
  const fullTemplate = verslagTemplate.replace('</body>', municipalityNotes + '\n</body>');
  
  return {
    address: coords.address,
    municipality,
    coordinates: coords.rd,
    permit: permitResult,
    participation: {
      required: participation.required,
      architecture: participation.architecture,
      documents_required: participation.documents_required || [],
      next_steps: participation.next_steps || []
    },
    verslag_template: fullTemplate
  };
}
