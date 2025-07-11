'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Brain, Tag } from 'lucide-react'
import { useNotesStore } from '@/store/notes'
import { useAnalyticsStore } from '@/store/analytics'

export function AnalyticsDashboard() {
  const { notes } = useNotesStore()
  const { getAnalyticsData } = useAnalyticsStore()

  const analytics = getAnalyticsData(notes)

  // Colors for the pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98']

  // Prepare data for tag chart (top 8 tags for better visualization)
  const tagChartData = analytics.tagPopularity.slice(0, 8).map((tag, index) => ({
    ...tag,
    fill: COLORS[index % COLORS.length]
  }))

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

      {/* Tag Popularity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Tag Popularity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tagChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {tagChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} notes`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
