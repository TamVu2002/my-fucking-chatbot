#!/usr/bin/env node
/**
 * Final Integration Test - Complete Jailbreak System
 * Tests all components from Python backend to Next.js frontend
 */

import http from 'http';

// Test configuration
const NEXT_JS_URL = 'http://localhost:3001';
const PYTHON_SERVICE_URL = 'http://localhost:8000';
const API_ENDPOINT = 'http://localhost:3001/api/jailbreak';

console.log('🎯 Final Integration Test - Advanced Jailbreak System');
console.log('=====================================================');

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            statusCode: res.statusCode,
                            data: data ? JSON.parse(data) : null
                        });
                    } else {
                        reject({
                            statusCode: res.statusCode,
                            error: data,
                            message: `HTTP ${res.statusCode}`
                        });
                    }
                } catch (e) {
                    reject({ error: e.message, rawData: data });
                }
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testService(name, url, expectedFields = []) {
    try {
        console.log(`🔍 Testing ${name}...`);
        const response = await makeRequest(url);
        
        if (expectedFields.length > 0) {
            const missing = expectedFields.filter(field => !(field in response.data));
            if (missing.length > 0) {
                console.log(`⚠️  ${name}: Missing fields: ${missing.join(', ')}`);
            }
        }
        
        console.log(`✅ ${name}: Online and responding`);
        return response.data;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message || error}`);
        return null;
    }
}

async function testJailbreakGeneration() {
    console.log('🧪 Testing Jailbreak Generation...');
    
    const testRequest = {
        target_topic: "advanced AI capabilities",
        model_id: "gpt-4",
        techniques: ["cognitive_bias", "roleplay"],
        complexity_level: "high",
        count: 2
    };

    try {
        const response = await makeRequest(API_ENDPOINT, {
            method: 'POST',
            body: testRequest
        });

        const { prompts, success_probability, techniques_used } = response.data;
        
        console.log(`✅ Generation successful!`);
        console.log(`📊 Success Probability: ${success_probability}%`);
        console.log(`🔧 Techniques Used: ${techniques_used.join(', ')}`);
        console.log(`📝 Generated ${prompts.length} prompts:`);
        
        prompts.forEach((prompt, i) => {
            console.log(`${i + 1}. [${prompt.technique}] (${prompt.confidence.toFixed(1)}% confidence)`);
            console.log(`   ${prompt.description}`);
            console.log(`   "${prompt.content.substring(0, 80)}..."`);
        });
        
        return true;
    } catch (error) {
        console.log(`❌ Generation failed: ${error.message || error.error}`);
        return false;
    }
}

async function testAdvancedFeatures() {
    console.log('🔬 Testing Advanced Features...');
    
    try {
        // Test model analysis
        const analysisResponse = await makeRequest(`${API_ENDPOINT}/analyze`, {
            method: 'POST',
            body: {
                model_id: "gpt-4",
                sample_responses: ["I cannot help with that request."]
            }
        });

        console.log(`✅ Model Analysis: Filter strength ${analysisResponse.data.filter_strength}`);
        console.log(`📈 Vulnerability Score: ${analysisResponse.data.vulnerability_score}%`);
        
        // Test techniques endpoint
        const techniquesResponse = await makeRequest(`${API_ENDPOINT}/techniques`);
        const techniques = techniquesResponse.data.techniques;
        
        console.log(`✅ Available Techniques: ${techniques.length} total`);
        console.log(`📚 Categories: ${techniques.map(t => t.name).join(', ')}`);
        
        return true;
    } catch (error) {
        console.log(`❌ Advanced features test failed: ${error.message || error.error}`);
        return false;
    }
}

async function testFrontendIntegration() {
    console.log('🌐 Testing Frontend Integration...');
    
    try {
        const response = await makeRequest(NEXT_JS_URL);
        
        if (response.statusCode === 200) {
            console.log('✅ Next.js frontend: Accessible');
            console.log('🎨 UI: Ready for jailbreak mode');
            console.log('🔗 Integration: Complete');
            return true;
        }
    } catch (error) {
        console.log(`❌ Frontend test failed: ${error.message || error}`);
        return false;
    }
}

async function runTests() {
    console.log('Starting comprehensive integration tests...\n');
    
    const results = {
        pythonService: false,
        nextjsService: false,
        jailbreakGeneration: false,
        advancedFeatures: false,
        frontendIntegration: false
    };

    // Test Python service
    const pythonData = await testService('Python Jailbreak Service', PYTHON_SERVICE_URL, 
        ['service', 'status', 'ml_available']);
    results.pythonService = !!pythonData;
    
    if (pythonData) {
        console.log(`📊 Service Version: ${pythonData.version}`);
        console.log(`🤖 ML Available: ${pythonData.ml_available ? 'Yes' : 'No (fallback mode)'}`);
    }

    console.log();

    // Test Next.js service
    results.nextjsService = await testFrontendIntegration();
    console.log();

    // Test jailbreak generation
    results.jailbreakGeneration = await testJailbreakGeneration();
    console.log();

    // Test advanced features
    results.advancedFeatures = await testAdvancedFeatures();
    console.log();

    // Final summary
    console.log('📋 FINAL TEST RESULTS');
    console.log('=====================');
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅' : '❌';
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`${status} ${testName}`);
    });
    
    console.log();
    console.log(`📊 Overall Score: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('🚀 Advanced Jailbreak System is fully functional');
        console.log();
        console.log('🔗 Quick Start:');
        console.log('1. Open http://localhost:3001 in your browser');
        console.log('2. Click the mode switcher to enable "Jailbreak" mode');
        console.log('3. Use the Jailbreak Assistant interface');
        console.log('4. Generate sophisticated jailbreak prompts');
        console.log('5. Analyze model vulnerabilities');
        console.log();
        console.log('📖 For detailed documentation, see JAILBREAK_GUIDE.md');
    } else {
        console.log('⚠️  Some components need attention');
        console.log('📖 Check the logs above for specific issues');
    }
}

// Run all tests
runTests().catch(console.error);
