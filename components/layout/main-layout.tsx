'use client'

import { useState } from 'react'
import { Search, Plus, BarChart3, Menu, X, TrendingUp, Brain, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useNotesStore } from '@/store/notes'
import { useAnalyticsStore } from '@/store/analytics'
import { NotesList } from '@/components/notes/notes-list'
import { NoteEditor } from '@/components/notes/note-editor'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { TagFilter } from '@/components/notes/tag-filter'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export function MainLayout() {
  const [currentView, setCurrentView] = useState<'notes' | 'analytics'>('notes')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Changed default to false for mobile-first
  
  const { 
    searchFilters, 
    setSearchFilters, 
    setSelectedNoteId,
    notes 
  } = useNotesStore()

  const { getAnalyticsData } = useAnalyticsStore()
  const analytics = getAnalyticsData(notes)

  const handleNewNote = () => {
    setSelectedNoteId(null)
    setCurrentView('notes')
    // Close sidebar on mobile after action
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchFilters({ query })
  }

  const handleViewChange = (view: 'notes' | 'analytics') => {
    setCurrentView(view)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Mobile/Tablet Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 top-0 left-0 h-full z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-full max-w-sm lg:w-80 lg:max-w-none
        border-r border-border 
        flex flex-col
        bg-background
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">LucidNotes</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={currentView === 'notes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('notes')}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-1 lg:mr-0 lg:hidden" />
              Notes
            </Button>
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('analytics')}
              className="flex-1"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </Button>
          </div>

          {/* Search and New Note - Only show for Notes view */}
          {currentView === 'notes' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchFilters.query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleNewNote} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'notes' ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border lg:border-b-0">
                <TagFilter />
              </div>
              <div className="flex-1 overflow-y-auto">
                <NotesList />
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto h-full">
              <h3 className="font-medium text-lg lg:text-base">Quick Stats</h3>
              
              {/* Quick Stats Cards */}
              <div className="space-y-3">
                <Card className="p-4 lg:p-3">
                  <div className="flex items-center gap-3 lg:gap-2">
                    <FileText className="h-5 w-5 lg:h-4 lg:w-4 text-blue-500" />
                    <div>
                      <p className="text-sm lg:text-xs text-muted-foreground">Total Notes</p>
                      <p className="text-xl lg:text-base font-bold">{analytics.totalNotes}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 lg:p-3">
                  <div className="flex items-center gap-3 lg:gap-2">
                    <Brain className="h-5 w-5 lg:h-4 lg:w-4 text-purple-500" />
                    <div>
                      <p className="text-sm lg:text-xs text-muted-foreground">AI Features Used</p>
                      <p className="text-xl lg:text-base font-bold">{analytics.aiUsageCount}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 lg:p-3">
                  <div className="flex items-center gap-3 lg:gap-2">
                    <TrendingUp className="h-5 w-5 lg:h-4 lg:w-4 text-green-500" />
                    <div>
                      <p className="text-sm lg:text-xs text-muted-foreground">This Week</p>
                      <p className="text-xl lg:text-base font-bold">{analytics.notesThisWeek}</p>
                    </div>
                  </div>
                </Card>
              </div>              
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="font-bold text-lg">LucidNotes</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Editor/Analytics Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'notes' ? (
            <NoteEditor />
          ) : (
            <div className="p-4 lg:p-8 h-full overflow-y-auto">
              <AnalyticsDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}