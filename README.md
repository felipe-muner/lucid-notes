# LucidNotes 📝✨

**AI-Powered Note-Taking App** - A modern, responsive note-taking application with integrated AI features and analytics dashboard.

## 🎯 Project Overview

LucidNotes is a single-page web application that combines traditional note-taking with AI-powered features. Built for a seed-stage ed-tech founder, this MVP demonstrates clean architecture, seamless AI integration, and polished user experience.

## ✨ Features

### Core Functionality

- 📝 **CRUD Operations** - Create, edit, delete, and organize notes
- 🏷️ **Tagging System** - Required tags for organization and filtering
- 🔍 **Search & Filter** - Search by text content or filter by tags
- 📱 **Responsive Design** - Optimized for desktop and mobile devices

### AI-Powered Features

- 🤖 **Note Summarization** - AI-powered summaries of long notes
- ✍️ **Auto-Title Generation** - Intelligent title suggestions
- 📄 **Smart Note Generation** - Create notes from shorthand input

### Analytics Dashboard

- 📊 **Usage Metrics** - Notes created per day/week
- 🤖 **AI Feature Usage** - Track AI feature utilization
- 🏷️ **Tag Popularity** - Most used tags and trends

### User Experience

- 🌙 **Dark/Light Theme** - Toggle between themes
- ⚡ **Smooth Animations** - Micro-interactions and transitions
- 🛡️ **Error Handling** - Graceful handling of empty states and API failures
- ♿ **Accessibility** - ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand
- **AI**: OpenAI API
- **Backend**: JSON Server (mock API)
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd lucid-notes
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start the development servers**

```bash
# Start the mock API server
pnpm run json-server

# In another terminal, start Next.js
pnpm dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
lucid-notes/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── notes/          # Note-related components
│   │   ├── analytics/      # Dashboard components
│   │   └── layout/         # Layout components
│   ├── lib/                # Utilities and configurations
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── store/              # Zustand store
├── db.json                 # Mock database
├── estimates.csv           # Time tracking
└── public/                 # Static assets
```

## 🧪 Testing & Quality

### Performance Targets

- ⚡ Lighthouse Performance Score: ≥90
- ♿ Lighthouse Accessibility Score: ≥90
- 📱 Mobile-first responsive design
- 🚀 Optimized bundle size and loading

### Manual Testing Checklist

- [ ] CRUD operations work smoothly
- [ ] Search and filtering functions correctly
- [ ] AI features handle errors gracefully
- [ ] Analytics display accurate data
- [ ] Responsive design on mobile devices
- [ ] Dark/light theme switching
- [ ] Empty states and loading states
- [ ] Keyboard navigation and accessibility

## 🔧 Available Scripts

```bash
# Development
pnpm dev                    # Start Next.js development server
pnpm json-server           # Start mock API server

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server

# Utilities
pnpm lint                  # Run ESLint
pnpm type-check           # Run TypeScript check
```

## 🌐 Deployment

### Live Demo

🔗 **[Live Application](your-deployment-url-here)**

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Remember to add your `OPENAI_API_KEY` to Vercel's environment variables.

## 📊 Time Tracking

See `estimates.csv` for detailed time estimates vs actual time spent on each feature.

## 🎥 Demo Video

📹 **[Feature Walkthrough](https://lucid-notes-git-main-felipe-muner.vercel.app/)** - Complete demo showing all features, AI integration, and architecture overview.

## 📋 Trade-offs & Future Improvements

### Current Limitations

- Mock backend (JSON Server) - would use real database in production
- Simple AI prompts - could be optimized for better results
- Basic analytics - could add more sophisticated metrics
- No user authentication - would implement in production

### Future Enhancements

- Real-time collaboration
- Advanced AI features (note suggestions, content enhancement)
- Export functionality (PDF, Markdown)
- Advanced search with vector embeddings
- Offline support with sync

## 🏗️ Architecture

See `ARCHITECTURE.md` for detailed information about:

- Component structure and organization
- State management patterns
- API design and data flow
- Scaling considerations

## 📄 License

This project is built as part of a technical assessment.

## 🤝 Contributing

This is a demonstration project. For questions or feedback, please reach out via the submission email.

---

**Built with ❤️ using Next.js 15, TypeScript, and shadcn/ui**
