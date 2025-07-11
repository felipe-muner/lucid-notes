import { NextRequest, NextResponse } from 'next/server'
import { CreateNoteRequest } from '@/types'
import { getNotesStore, addNoteToStore, initializeStore } from '@/lib/data-store'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET() {
  try {
    await delay(300)
    await initializeStore()
    
    const notes = getNotesStore()
    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await delay(500)
    await initializeStore()
    
    const body: CreateNoteRequest = await request.json()
    
    if (!body.title || !body.content || !body.tags || body.tags.length === 0) {
      return NextResponse.json(
        { error: 'Title, content, and at least one tag are required' },
        { status: 400 }
      )
    }

    const newNote = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      tags: body.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addNoteToStore(newNote)
    
    return NextResponse.json({ note: newNote }, { status: 201 })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
