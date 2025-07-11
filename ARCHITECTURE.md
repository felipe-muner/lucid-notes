# Architecture Documentation

## Overview

LucidNotes is a modern note-taking application built with Next.js 15, featuring AI-powered assistance, analytics, and a clean, responsive interface. The application follows a component-based architecture with clear separation of concerns.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **AI Integration**: OpenAI API
- **Charts**: Recharts
- **Date Handling**: date-fns

## Component Architecture

### Directory Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── ai/route.ts          # AI features endpoint
│   │   └── notes/               # Notes CRUD operations
│   ├── globals.css              # Global styles & theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React Components
│   ├── ai/                      # AI-related components
│   ├── analytics/               # Analytics dashboard
│   ├── layout/                  # Layout components
│   ├── notes/                   # Note management
│   └── ui/                      # shadcn/ui components
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities and data store
├── store/                       # Zustand state stores
└── types/                       # TypeScript definitions
```

### Component Hierarchy

```
MainLayout
├── Sidebar
│   ├── Navigation (Notes/Analytics)
│   ├── Search & Filters
│   ├── NotesList
│   └── TagFilter
├── Main Content Area
│   ├── NoteEditor
│   │   ├── TagInput
│   │   └── AIAssistant
│   └── AnalyticsDashboard
└── ThemeToggle
```

## State Management Strategy

### Zustand Stores

We use Zustand for predictable state management with two main stores:

#### 1. Notes Store (`store/notes.ts`)
```typescript
interface NotesStore {
  notes: Note[]
  isLoading: boolean
  error: string | null
  searchFilters: SearchFilters
  selectedNoteId: string | null
  
  // Actions for CRUD operations
  // Computed selectors for filtering
}
```

**Design Choices:**
- **Centralized note management**: All note operations go through this store
- **Optimistic updates**: UI updates immediately, with error handling
- **Derived state**: Filtered notes computed from base state and filters
- **Immutable updates**: Uses spread operators for clean state updates

#### 2. Analytics Store (`store/analytics.ts`)
```typescript
interface AnalyticsStore {
  aiUsageCount: number
  aiFeatureUsage: Record<string, number>
  
  incrementAIUsage: (feature: string) => void
  getAnalyticsData: (notes: Note[]) => AnalyticsData
}
```

**Design Choices:**
- **Computed analytics**: Real-time calculation from notes data
- **Persistent counters**: AI usage tracking across sessions
- **Separation of concerns**: Analytics logic isolated from notes

### Why Zustand Over Redux/Context?

1. **Simplicity**: No boilerplate, direct state access
2. **TypeScript-first**: Excellent TS integration
3. **Performance**: Minimal re-renders, selective subscriptions
4. **Bundle size**: Lightweight (~800 bytes)
5. **DevTools**: Great debugging experience

## Data Flow Architecture

### Client-Side Flow
```
User Action → Component → Zustand Store → API Call → Update Store → Re-render
```

### Server-Side Flow
```
API Route → Data Store → Business Logic → Response → Client Update
```

### Current Data Storage

**In-Memory Store** (`lib/data-store.ts`):
- Simple array-based storage
- Shared across API routes
- Initialized with mock data
- Suitable for development/demo

## API Design

### RESTful Endpoints

```
GET    /api/notes           # List all notes
POST   /api/notes           # Create new note
GET    /api/notes/[id]      # Get specific note
PUT    /api/notes/[id]      # Update note
DELETE /api/notes/[id]      # Delete note
POST   /api/ai              # AI operations
```

### Error Handling Strategy

1. **Validation**: Input validation at API boundaries
2. **Graceful degradation**: Fallback responses when AI fails
3. **User feedback**: Clear error messages in UI
4. **Retry logic**: Implemented in components for transient failures

## AI Integration Architecture

### Features
- **Summarization**: Condense note content
- **Auto-titling**: Generate descriptive titles
- **Content generation**: Expand brief ideas

### Implementation Strategy
```typescript
// Fallback pattern for reliability
if (!openai_available) {
  return fallback_response
}

try {
  return await openai.generate()
} catch (error) {
  return fallback_response
}
```

## Performance Considerations

### Current Optimizations

1. **Component Optimization**:
   - React.memo for expensive renders
   - Proper key props for lists
   - Debounced search inputs

2. **State Management**:
   - Selective subscriptions in Zustand
   - Computed values cached
   - Minimal state updates

3. **Bundle Optimization**:
   - Tree-shaking enabled
   - Dynamic imports for heavy components
   - Optimized Tailwind CSS

### Monitoring Points

- **Bundle size**: Currently ~200KB
- **Time to Interactive**: Sub-2s target
- **API response times**: <500ms average
- **Memory usage**: Stable with large note collections

---

## Scaling to 10× Users & Data

### Infrastructure Scaling

#### Database Layer
**Current**: In-memory storage
**Scaled**: PostgreSQL with read replicas

```sql
-- Optimized schema design
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_notes_user_updated ON notes(user_id, updated_at DESC);
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

#### Caching Strategy
```typescript
// Multi-layer caching
interface CacheStrategy {
  // 1. Browser cache (stale-while-revalidate)
  swr: 'max-age=60, stale-while-revalidate=300'
  
  // 2. CDN cache for static assets
  cdn: 'max-age=31536000, immutable'
  
  // 3. Redis for API responses
  redis: {
    notes_list: '5min',
    user_profile: '1hour',
    analytics: '15min'
  }
  
  // 4. Application-level cache
  memory: LRUCache<string, Note[]>
}
```

#### Real-time Features
```typescript
// WebSocket integration for live collaboration
const useRealtimeNotes = () => {
  useEffect(() => {
    const ws = new WebSocket('/api/ws/notes')
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)
      
      switch (type) {
        case 'note_updated':
          updateNote(data.id, data.changes)
          break
        case 'note_deleted':
          deleteNote(data.id)
          break
      }
    }
    
    return () => ws.close()
  }, [])
}
```

### Application Architecture Evolution

#### Microservices Decomposition
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │   API Gateway   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                ┌────────────────────────────────┐
                │         API Gateway            │
                │    (Authentication, Routing)   │
                └────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Notes Service │    │ Analytics Service│    │   AI Service    │
│   (CRUD)      │    │   (Metrics)      │    │ (OpenAI Proxy)  │
└───────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                        │
┌───────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  PostgreSQL   │    │     ClickHouse   │    │  Redis Queue    │
│   (Primary)   │    │   (Analytics)    │    │  (AI Jobs)      │
└───────────────┘    └──────────────────┘    └─────────────────┘
```

#### State Management at Scale
```typescript
// Federated state with micro-frontends
interface ScaledStateArchitecture {
  // 1. Module federation for code splitting
  modules: {
    notes: '@lucid/notes-module',
    analytics: '@lucid/analytics-module',
    ai: '@lucid/ai-module'
  }
  
  // 2. Shared state bus
  eventBus: EventEmitter<{
    'note:created': Note
    'note:updated': { id: string, changes: Partial<Note> }
    'user:activity': UserActivity
  }>
  
  // 3. Optimistic updates with conflict resolution
  sync: OptimisticSync<Note>
}
```

### Performance at Scale

#### Database Optimization
```typescript
// Connection pooling and read replicas
const dbConfig = {
  primary: { 
    host: 'primary.db.lucid.com',
    maxConnections: 20 
  },
  replicas: [
    { host: 'replica-1.db.lucid.com', weight: 0.5 },
    { host: 'replica-2.db.lucid.com', weight: 0.5 }
  ],
  
  // Intelligent query routing
  queryRouter: (query: string) => 
    query.includes('SELECT') ? 'replica' : 'primary'
}
```

#### Search Optimization
```typescript
// Elasticsearch for advanced search
interface SearchIndex {
  notes: {
    mapping: {
      title: { type: 'text', analyzer: 'standard' },
      content: { type: 'text', analyzer: 'standard' },
      tags: { type: 'keyword' },
      embedding: { type: 'dense_vector', dims: 384 }
    }
  }
  
  // Semantic search with embeddings
  semanticSearch: (query: string) => Promise<Note[]>
}
```

### Security at Scale

```typescript
interface SecurityStrategy {
  authentication: {
    provider: 'Auth0' | 'Firebase Auth',
    mfa: true,
    sessionTimeout: '24h'
  },
  
  authorization: {
    rbac: RoleBasedAccessControl,
    policies: AttributeBasedPolicies
  },
  
  dataProtection: {
    encryption: 'AES-256-GCM',
    keyRotation: '30days',
    backups: 'encrypted'
  }
}
```

### Monitoring & Observability

```typescript
// Comprehensive monitoring stack
interface MonitoringStack {
  metrics: {
    application: 'DataDog/New Relic',
    infrastructure: 'Prometheus + Grafana',
    realUserMonitoring: 'Sentry/LogRocket'
  },
  
  logging: {
    structured: 'winston + ELK Stack',
    distributed: 'Jaeger tracing',
    alerts: 'PagerDuty integration'
  },
  
  analytics: {
    userBehavior: 'Mixpanel/Amplitude',
    performance: 'Core Web Vitals',
    business: 'Custom dashboards'
  }
}
```

### Migration Strategy

#### Phase 1: Database Migration (Months 1-2)
- Replace in-memory store with PostgreSQL
- Implement proper authentication
- Add data validation and migrations

#### Phase 2: Performance (Months 3-4)
- Add Redis caching layer
- Implement CDN for static assets
- Optimize database queries and indexes

#### Phase 3: Scalability (Months 5-6)
- Microservices decomposition
- Load balancer setup
- Real-time features with WebSockets

#### Phase 4: Advanced Features (Months 7-8)
- Elasticsearch for search
- Advanced analytics pipeline
- Mobile application development

### Estimated Resource Requirements (10× Scale)

```yaml
Infrastructure:
  - Load Balancers: 2× ALB (AWS)
  - Application Servers: 6× t3.large instances
  - Database: 1× primary + 2× read replicas (r5.xlarge)
  - Cache: 2× Redis clusters (r5.large)
  - CDN: CloudFront distribution
  - Search: 3× Elasticsearch nodes (m5.large)

Estimated Monthly Cost: $3,000-5,000
```

This architecture provides a clear path from the current MVP to a production-ready application capable of handling 10× the current scale while maintaining performance and user experience.
