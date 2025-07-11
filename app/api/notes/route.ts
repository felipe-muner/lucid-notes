import { NextRequest, NextResponse } from 'next/server'
import { Note, CreateNoteRequest } from '@/types'

let notes: Note[] = []
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET() {
  try {
    await delay(300)
    
    if (notes.length === 0) {
      const mockNotes = await import('@/db.json')
      notes = mockNotes.notes as Note[]
    }
    
    return NextResponse.json({ notes })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await delay(500)
    
    const body: CreateNoteRequest = await request.json()
    
    if (!body.title || !body.content || !body.tags || body.tags.length === 0) {
      return NextResponse.json(
        { error: 'Title, content, and at least one tag are required' },
        { status: 400 }
      )
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      tags: body.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    notes.unshift(newNote)
    
    return NextResponse.json({ note: newNote }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
