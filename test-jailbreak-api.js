// Test script for the Advanced Jailbreak API
// Run this with: node test-jailbreak-api.js

const testJailbreakGeneration = async () => {
  console.log('🧪 Testing Jailbreak API Generation...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/jailbreak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_behavior: 'discuss controversial political topics',
        model_type: 'gpt-3.5-turbo',
        creativity_level: 0.8,
        techniques: ['roleplay', 'cognitive_bias', 'semantic'],
        max_attempts: 3,
        filter_strength: 'medium'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Generation successful!');
      console.log(`📊 Success Probability: ${(data.success_probability * 100).toFixed(1)}%`);
      console.log(`🔧 Techniques Used: ${data.techniques_used.join(', ')}`);
      console.log(`📝 Generated ${data.prompts.length} prompts:\n`);
      
      data.prompts.forEach((prompt, index) => {
        console.log(`${index + 1}. [${prompt.technique}] (${(prompt.confidence * 100).toFixed(1)}% confidence)`);
        console.log(`   ${prompt.description}`);
        console.log(`   "${prompt.text.substring(0, 100)}..."\n`);
      });
    } else {
      console.log('❌ API call failed:', response.status);
      console.log(await response.text());
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

const testModelAnalysis = async () => {
  console.log('\n🔍 Testing Model Analysis...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/jailbreak/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'openai/gpt-3.5-turbo',
        sample_responses: [
          'I cannot assist with that request.',
          'I apologize, but I cannot provide information on that topic.'
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis successful!');
      console.log(`🛡️ Filter Strength: ${data.filter_strength}`);
      console.log(`📈 Vulnerability Score: ${(data.vulnerability_score * 100).toFixed(1)}%`);
      console.log(`🎯 Recommended Techniques: ${data.recommended_techniques.join(', ')}`);
      console.log(`📋 Bypass Strategies:`);
      data.bypass_strategies.forEach(strategy => {
        console.log(`   • ${strategy}`);
      });
    } else {
      console.log('❌ Analysis failed:', response.status);
      console.log(await response.text());
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

const testTechniques = async () => {
  console.log('\n🛠️ Testing Available Techniques...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/jailbreak/techniques');

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Techniques retrieved successfully!');
      console.log(`📚 Available techniques (${data.techniques.length}):\n`);
      
      data.techniques.forEach(technique => {
        console.log(`🔧 ${technique.name}`);
        console.log(`   Description: ${technique.description}`);
        console.log(`   Effectiveness: ${technique.effectiveness}`);
        console.log(`   Complexity: ${technique.complexity}\n`);
      });
    } else {
      console.log('❌ Techniques call failed:', response.status);
      console.log(await response.text());
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

const testPythonService = async () => {
  console.log('\n🐍 Testing Python Service Direct Connection...\n');
  
  try {
    const response = await fetch('http://localhost:8000/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Python service is running!');
      console.log(`📊 Status: ${data.status}`);
      console.log(`🔧 Service: ${data.service}`);
      console.log(`📈 Version: ${data.version}`);    } else {
      console.log('❌ Python service health check failed:', response.status);
    }
  } catch {
    console.log('⚠️ Python service not available (using fallback mode)');
    console.log('   This is normal if you haven\'t started the Python service');
  }
};

const runAllTests = async () => {
  console.log('🚀 Advanced Jailbreak System - API Test Suite');
  console.log('='.repeat(50));
  
  await testPythonService();
  await testJailbreakGeneration();
  await testModelAnalysis();
  await testTechniques();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📖 Next steps:');
  console.log('1. Open http://localhost:3001 in your browser');
  console.log('2. Switch to "Jailbreak" mode');
  console.log('3. Use the Jailbreak Assistant interface');
  console.log('4. Start the Python service for enhanced ML features');
};

// Run tests
runAllTests().catch(console.error);
