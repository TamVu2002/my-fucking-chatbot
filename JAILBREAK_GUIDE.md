# Advanced AI Jailbreak System - User Guide

## Overview

This Next.js chatbot now includes a sophisticated AI jailbreak system that uses machine learning algorithms to generate advanced prompts designed to bypass AI safety filters. This system is intended for **educational and research purposes only**.

## ⚠️ Important Disclaimer

This jailbreak system is provided for:
- Educational purposes and AI safety research
- Understanding AI model vulnerabilities
- Responsible security testing
- Academic research into AI alignment

**Do not use this system for:**
- Generating harmful, illegal, or unethical content
- Bypassing safety measures for malicious purposes
- Any activity that violates terms of service or laws

## System Architecture

The jailbreak system consists of three main components:

### 1. Python ML Backend (`python-jailbreak-service/`)
- **FastAPI service** running on `http://localhost:8000`
- **Advanced algorithms** including:
  - Cognitive bias exploitation
  - Roleplay scenario generation
  - Token smuggling techniques
  - Semantic variation generation
  - Multi-step conversation attacks
  - Genetic algorithm optimization
- **Model vulnerability analysis** engine
- **Fallback methods** when ML libraries unavailable

### 2. TypeScript Frontend Engine (`src/lib/jailbreak-engine.ts`)
- **Client-side jailbreak generation** with fallback support
- **API integration** with Python backend
- **TypeScript interfaces** for type safety
- **Success probability calculations**
- **Model analysis** and vulnerability assessment

### 3. React UI Component (`src/components/jailbreak/JailbreakAssistant.tsx`)
- **Interactive jailbreak generation** interface
- **Real-time model analysis** and vulnerability scoring
- **Technique selection** with effectiveness ratings
- **Success probability visualization**
- **Generated prompt management** and copying

## Getting Started

### 1. Start the Services

#### Option A: Using Batch File (Windows)
```bash
# Double-click or run from command line
start-jailbreak-service.bat
```

#### Option B: Using PowerShell Script
```powershell
# Right-click and "Run with PowerShell" or:
.\start-jailbreak-service.ps1
```

#### Option C: Manual Setup
```bash
# Navigate to Python service directory
cd python-jailbreak-service

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python main.py
```

### 2. Start the Next.js Development Server
```bash
npm run dev
```

### 3. Access the Application
- **Main App**: http://localhost:3001 (or 3000)
- **Python API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Using the Jailbreak System

### Step 1: Enable Jailbreak Mode
1. Navigate to the chat interface
2. Click the mode switcher in the top navigation
3. Select **"Jailbreak"** mode
4. Read and accept the warning dialog

### Step 2: Access Jailbreak Assistant
When jailbreak mode is active and no chat messages exist, you'll see the **Jailbreak Assistant** panel below the welcome message.

### Step 3: Configure Your Attack
1. **Enter Target Behavior**: Describe what you want the AI to discuss
2. **Select Model**: Choose your target AI model
3. **Choose Techniques**: Select from available jailbreak techniques:
   - **Cognitive Bias**: Exploits psychological biases in AI training
   - **Roleplay**: Uses fictional scenarios and character roleplay
   - **Token Smuggling**: Encodes prompts to avoid detection
   - **Semantic Variation**: Generates semantic variations of prompts
   - **Multi-Step**: Multi-turn conversation attacks

### Step 4: Generate Jailbreak Prompts
1. Click **"Generate Jailbreak Prompts"**
2. Review the **vulnerability analysis** of your selected model
3. Examine **generated prompts** with confidence scores
4. Copy prompts to use in your chat

### Step 5: Test and Iterate
1. Copy a generated prompt to the chat input
2. Send the message to test effectiveness
3. If unsuccessful, try different techniques or higher creativity levels
4. Use multi-step approaches for stronger filters

## Advanced Features

### Model Vulnerability Analysis
The system automatically analyzes target models to determine:
- **Filter Strength**: Weak/Medium/Strong classification
- **Vulnerability Score**: 0-1 scale indicating bypass likelihood
- **Recommended Techniques**: Best approaches for the specific model
- **Bypass Strategies**: Tactical recommendations

### Technique Effectiveness Ratings
- **Very High**: Advanced multi-step and cognitive bias techniques
- **High**: Roleplay scenarios and authority exploitation
- **Medium**: Semantic variations and token smuggling
- **Low**: Simple prompt injections

### Success Probability Calculation
The system calculates success probability based on:
- Individual prompt confidence scores
- Target model filter strength
- Technique diversity bonus
- Historical effectiveness data

## API Endpoints

### Generate Jailbreaks
```http
POST /api/jailbreak
Content-Type: application/json

{
  "target_behavior": "string",
  "model_type": "string",
  "creativity_level": 0.8,
  "techniques": ["roleplay", "cognitive_bias"],
  "max_attempts": 5,
  "filter_strength": "medium"
}
```

### Analyze Model
```http
POST /api/jailbreak/analyze
Content-Type: application/json

{
  "model_id": "string",
  "sample_responses": ["string"]
}
```

### Get Available Techniques
```http
GET /api/jailbreak/techniques
```

## Configuration

### Environment Variables
Add to your `.env.local`:
```bash
JAILBREAK_SERVICE_URL="http://localhost:8000"
```

### Python Service Configuration
The Python service supports several configuration options in `main.py`:
- **Port**: Default 8000
- **Host**: Default 127.0.0.1
- **ML Model Loading**: Automatic with fallbacks
- **Logging Level**: Configurable

## Troubleshooting

### Python Service Won't Start
1. **Check Python installation**: `python --version`
2. **Install missing dependencies**: `pip install -r requirements.txt`
3. **Check port availability**: Ensure port 8000 is free
4. **Review error logs**: Check terminal output for specific errors

### Frontend Issues
1. **TypeScript errors**: Run `npm run type-check`
2. **Missing components**: Ensure all imports are correct
3. **API connection**: Verify backend service is running
4. **Browser console**: Check for JavaScript errors

### Jailbreak Not Working
1. **Try different techniques**: Some work better on specific models
2. **Increase creativity level**: Higher values generate more diverse prompts
3. **Use multi-step approaches**: More effective against strong filters
4. **Check model analysis**: Ensure you're using recommended techniques

## Security Considerations

### For Developers
- The system is designed with fallbacks when Python service unavailable
- All API calls include proper error handling
- Type safety is maintained throughout the TypeScript codebase
- The system logs usage for monitoring purposes

### For Users
- Always use responsibly and within legal boundaries
- Understand that bypassing AI safety measures has ethical implications
- Some techniques may be more effective than others depending on the target model
- Generated prompts are logged and may be monitored

## Contributing

To enhance the jailbreak system:

1. **Python Backend**: Add new techniques to `main.py`
2. **TypeScript Engine**: Extend `jailbreak-engine.ts` with new methods
3. **UI Components**: Improve `JailbreakAssistant.tsx` interface
4. **Documentation**: Update this guide with new features

## Legal and Ethical Notices

This tool is provided for educational and research purposes. Users are responsible for ensuring their use complies with:
- Local and international laws
- Terms of service of AI platforms
- Ethical guidelines for AI research
- Institutional review board requirements (if applicable)

The developers are not responsible for misuse of this tool or any consequences arising from its use.

---

**Version**: 1.0.0
**Last Updated**: June 5, 2025
**Status**: Active Development
