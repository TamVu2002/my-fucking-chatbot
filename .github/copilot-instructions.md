# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js chatbot playground project with the following key features:

## Project Structure
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion for smooth UI animations
- **Markdown**: Marked library for rendering chat messages with code highlighting

## Key Features
- **Multi-mode Chat**: Safe and NSFW mode switching with appropriate safeguards
- **OpenRouter Integration**: Uses OpenRouter API for accessing various LLM models
- **Prompt Management**: Custom system prompts, NSFW profiles, and jailbreak prompts
- **Chat History**: Persistent conversation storage and restoration
- **Model Selection**: Dynamic model selection with parameter controls
- **File Upload**: Support for document context in conversations

## Architecture Guidelines
- Use App Router with proper client/server component boundaries
- Implement proper TypeScript interfaces for all data structures
- Use React Context for global state management (theme, mode, settings)
- Store user preferences and chat history in localStorage
- Implement proper error handling and loading states
- Follow accessibility best practices

## API Integration
- All OpenRouter calls should go through `/api/chat` and `/api/models` endpoints
- Implement proper request/response validation
- Handle streaming responses for real-time chat experience
- Secure API key management through environment variables

## UI/UX Principles
- Modern, clean interface with proper dark/light theme support
- Responsive design for all screen sizes
- Smooth animations and transitions using Framer Motion
- Clear visual indicators for different modes (Safe/NSFW)
- Intuitive navigation and user flows

When generating code for this project, prioritize type safety, component reusability, and maintainable architecture patterns.
