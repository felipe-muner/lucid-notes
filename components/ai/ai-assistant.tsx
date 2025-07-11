'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Wand2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAnalyticsStore } from '@/store/analytics'

interface AIAssistantProps {
  content: string
  onResult: (result: string, type: 'title' | 'content') => void
}

export function AIAssistant({ content, onResult }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState('')
  const { incrementAIUsage } = useAnalyticsStore()

  const handleAIAction = async (action: 'summarize' | 'autoTitle' | 'generate') => {
    if (!content.trim() && action !== 'generate') {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          content,
          prompt: action === 'generate' ? generatePrompt : undefined
        })
      })

      const data = await response.json()
      
      if (data.success) {
        incrementAIUsage(action)
        if (action === 'autoTitle') {
          onResult(data.result, 'title')
        } else {
          onResult(data.result, 'content')
        }
      } else {
        // Use fallback if available
        if (data.fallback) {
          if (action === 'autoTitle') {
            onResult(data.fallback, 'title')
          } else {
            onResult(data.fallback, 'content')
          }
        }
      }
    } catch (error) {
      console.error('AI request failed:', error)
    } finally {
      setIsLoading(false)
      if (action === 'generate') {
        setGeneratePrompt('')
      }
    }
  }

  return (
    <div className="border-l border-border p-4 w-80 bg-muted/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4" />
        <h3 className="font-medium">AI Assistant</h3>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAIAction('summarize')}
          disabled={isLoading || !content.trim()}
          className="w-full justify-start"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Summarize Note
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAIAction('autoTitle')}
          disabled={isLoading || !content.trim()}
          className="w-full justify-start"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          Auto-Title
        </Button>

        <div className="space-y-2">
          <Input
            placeholder="Describe what to generate..."
            value={generatePrompt}
            onChange={(e) => setGeneratePrompt(e.target.value)}
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAIAction('generate')}
            disabled={isLoading || !generatePrompt.trim()}
            className="w-full justify-start"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Note
          </Button>
        </div>
      </div>
    </div>
  )
}
