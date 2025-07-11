'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Brain, Tag } from 'lucide-react'
import { useNotesStore } from '@/store/notes'
import { useAnalyticsStore } from '@/store/analytics'

export function AnalyticsDashboard() {
  const { notes } = useNotesStore()
  const { getAnalyticsData } = useAnalyticsStore()
  
  const analytics = getAnalyticsData(notes)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
              <p className="text-2xl font-bold">{analytics.totalNotes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">AI Features Used</p>
              <p className="text-2xl font-bold">{analytics.aiUsageCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Notes This Week</p>
              <p className="text-2xl font-bold">{analytics.notesThisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Notes Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Notes Created (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.dailyNoteCount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Usage Breakdown */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">AI Feature Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Summarize</span>
              <Badge variant="secondary">{analytics.aiFeatureUsage.summarize}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto Title</span>
              <Badge variant="secondary">{analytics.aiFeatureUsage.autoTitle}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Generate</span>
              <Badge variant="secondary">{analytics.aiFeatureUsage.generate}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Tag Popularity */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {analytics.tagPopularity.slice(0, 10).map((tag) => (
            <Badge key={tag.name} variant="outline" className="text-sm">
              {tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}
