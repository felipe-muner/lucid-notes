import { NextRequest, NextResponse } from 'next/server'
import { UpdateNoteRequest } from '@/types'
import {
  findNoteInStore,
  updateNoteInStore,
  deleteNoteFromStore,
  initializeStore
} from '@/lib/data-store'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(200)
    await initializeStore()

    const note = findNoteInStore(params.id)

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Failed to fetch note:', error)
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(400)
    await initializeStore()

    const body: UpdateNoteRequest = await request.json()

    if (body.tags && body.tags.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required' }, { status: 400 })
    }

    const updatedNote = updateNoteInStore(params.id, {
      ...body,
      updatedAt: new Date().toISOString()
    })

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note: updatedNote })
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(300)
    await initializeStore()

    const deletedNote = deleteNoteFromStore(params.id)

    if (!deletedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note: deletedNote })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
