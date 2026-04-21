import { analyzeProject } from './services/permit-intelligence-engine';

async function testDadsProject() {
  console.log('\n🧪 Testing Dad\'s Project — John Daltonstraat, Almere\n');
  console.log('═'.repeat(60));
  
  const result = await analyzeProject({
    address: 'John Daltonstraat 13, 1349DV Almere',
    project_type: 'housing_new',
    housing_units: 1  // Adjust based on what he actually built
  });
  
  console.log('\n📊 FULL ANALYSIS:\n');
  
  console.log('📍 ADDRESS:');
  console.log(`   ${result.address}`);
  console.log(`   Municipality: ${result.municipality}`);
  console.log(`   RD Coordinates: [${result.coordinates[0].toFixed(0)}, ${result.coordinates[1].toFixed(0)}]`);
  
  console.log('\n📋 PERMIT CHECK:');
  console.log(`   Required: ${result.permit.requires_permit}`);
  console.log(`   Type: ${result.permit.permit_type || 'unknown'}`);
  console.log(`   Description: ${result.permit.description}`);
  console.log(`   Questions needed: ${result.permit.questions_needed}`);
  
  console.log('\n👥 PARTICIPATION (Almere):');
  console.log(`   Required: ${result.participation.required}`);
  console.log(`   Architecture: ${result.participation.architecture}`);
  console.log(`   Documents: ${result.participation.documents_required.join(', ') || 'none specified'}`);
  
  if (result.participation.next_steps.length > 0) {
    console.log('\n   Next steps:');
    result.participation.next_steps.slice(0, 3).forEach(step => {
      console.log(`     → ${step}`);
    });
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Analysis complete!\n');
}

testDadsProject().catch(console.error);