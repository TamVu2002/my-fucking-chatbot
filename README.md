# Chatbot Playground

A comprehensive Next.js-based chatbot playground featuring OpenRouter integration, multiple AI models, streaming responses, and a modern UI.

## Features

### 🤖 Multi-Model Support
- Access to various AI models through OpenRouter API
- Free and premium model options
- Real-time model switching

### 💬 Advanced Chat Features
- **Streaming Responses**: Real-time message streaming for immediate feedback
- **File Upload**: Support for text files, markdown, JSON, and CSV as context
- **Chat History**: Persistent conversation storage and restoration
- **Message Actions**: Copy messages, clear conversations

### 🎛️ Customizable Parameters
- Temperature control (0-2)
- Max tokens adjustment (256-4096)
- Top-p and Top-k parameters
- Custom system prompts

### 🔒 Multi-Mode Support
- **Safe Mode**: Family-friendly conversations with appropriate safeguards
- **NSFW Mode**: Adult content discussions with warning modals
- **Jailbreak Prompts**: Advanced prompt templates for specific use cases

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Automatic theme switching with system preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: Keyboard shortcuts and screen reader support

### ⚡ Technical Features
- **TypeScript**: Full type safety and IntelliSense
- **App Router**: Next.js 14+ with modern routing
- **Tailwind CSS**: Utility-first styling
- **Local Storage**: Persistent settings and history
- **Error Handling**: Comprehensive error states and retry mechanisms

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd my-chatbot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_HTTP_REFERER=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Chat
1. Select an AI model from the dropdown
2. Adjust parameters as needed (temperature, max tokens)
3. Type your message and press Enter or Ctrl+Enter to send
4. View streaming responses in real-time

### File Upload
1. Click the paperclip icon or drag & drop files
2. Supported formats: .txt, .md, .json, .csv
3. File content will be included as context in your message

### Mode Switching
- **Safe Mode**: Default mode for general conversations
- **NSFW Mode**: Enables adult content with confirmation dialog
- Toggle between modes using the switch in the navigation

### Chat History
1. Visit the History page to view past conversations
2. Click "Restore" to continue previous conversations
3. Use "Clear All History" to remove all saved sessions

### Settings
- **Safe Prompts**: Pre-defined system prompts for safe conversations
- **NSFW Profiles**: Custom profiles for adult content discussions
- **Jailbreak Prompts**: Advanced prompt templates for specific scenarios

## API Endpoints

### `/api/models`
- **Method**: GET
- **Description**: Fetch available models from OpenRouter
- **Response**: List of free models with details

### `/api/chat`
- **Method**: POST
- **Description**: Send chat completion requests
- **Parameters**:
  - `model`: Model ID
  - `messages`: Conversation history
  - `stream`: Enable streaming (default: true)
  - `temperature`: Randomness (0-2)
  - `max_tokens`: Response length limit
  - `top_p`: Nucleus sampling
  - `top_k`: Top-k sampling

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app_pages)/       # Main application pages
│   │   ├── chat/          # Chat interface
│   │   ├── history/       # Chat history
│   │   └── settings/      # Settings management
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion endpoint
│   │   └── models/        # Models fetching endpoint
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── common/           # Application-specific components
├── contexts/             # React Context providers
├── lib/                  # Utility functions
└── types/               # TypeScript type definitions
```

## Technologies Used

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Markdown**: Marked with syntax highlighting
- **API**: OpenRouter integration
- **State Management**: React Context + localStorage

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # TypeScript checking
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `OPENROUTER_HTTP_REFERER` | HTTP referer for OpenRouter | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel**: One-click deployment
- **Netlify**: Static site generation
- **Docker**: Containerized deployment
- **Traditional hosting**: Build and serve static files

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI model access
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
