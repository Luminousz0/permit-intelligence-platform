import { addressToCoordinates } from './pdok-geocoder';
import { checkPermitRequirement, DSOQuestion } from './dso-client';
import { checkParticipationRequirement } from './participation-checker';
import { generateVerslagTemplate } from './verslag-template-generator';

export interface AnalyzeRequest {
  address: string;
  werkzaamheid: string;
  housing_units?: number;
  answers?: Array<{ id: number; answer: string }>;
}

export async function analyzeProject(request: AnalyzeRequest) {
  console.log(`\n📍 Analyzing: ${request.address}`);
  const coords = await addressToCoordinates(request.address);
  console.log(`   Municipality: ${coords.municipality}`);
  
  const permitResult = await checkPermitRequirement({
    coordinates: coords.rd,
    werkzaamheid: request.werkzaamheid,
    answers: request.answers
  });
  
  const participation = checkParticipationRequirement(coords.municipality, {
    type: 'housing_new',
    housing_units: request.housing_units,
    location_type: 'urban'
  });
  
  const verslag = generateVerslagTemplate({
    projectName: `Project ${coords.address.split(',')[0]}`,
    projectAddress: coords.address,
    municipality: coords.municipality,
    activityType: request.werkzaamheid
  });
  
  return {
    address: coords.address,
    municipality: coords.municipality,
    permit: permitResult,
    participation: {
      required: participation.required,
      architecture: participation.architecture,
      documents_required: participation.documents_required,
      next_steps: participation.next_steps
    },
    verslag_template: verslag
  };
}
