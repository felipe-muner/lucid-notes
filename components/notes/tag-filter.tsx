'use client'

import { X, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNotesStore } from '@/store/notes'

export function TagFilter() {
  const { 
    searchFilters, 
    setSearchFilters, 
    getAllTags 
  } = useNotesStore()

  const allTags = getAllTags()
  const selectedTags = searchFilters.tags

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    
    setSearchFilters({ tags: newTags })
  }

  const clearFilters = () => {
    setSearchFilters({ tags: [] })
  }

  if (allTags.length === 0) {
    return null
  }

  return (
    <div>
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Active Filters
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="text-xs cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="text-xs font-medium text-muted-foreground mb-2 block">
          Filter by Tags
        </span>
        <div className="flex flex-wrap gap-1">
          {allTags
            .filter(tag => !selectedTags.includes(tag))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-accent"
                onClick={() => handleTagToggle(tag)}
              >
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )
}
