import { analyzeProject } from './services/permit-intelligence-engine';

async function test() {
  console.log('\n🧪 Testing Permit Intelligence Platform\n');
  console.log('═'.repeat(50));
  
  const result = await analyzeProject({
    address: 'Oudegracht 187, Utrecht',
    project_type: 'housing_new',
    housing_units: 8
  });
  
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Test complete!\n');
}

test().catch(console.error);