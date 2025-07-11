import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface AIRequest {
  action: 'summarize' | 'autoTitle' | 'generate'
  content: string
  prompt?: string
}

export async function POST(request: NextRequest) {
  try {
    await delay(1000)
    
    const { action, content, prompt }: AIRequest = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      const fallbackResponses = {
        summarize: `**Summary:** This note discusses key topics and ideas. Main points include various concepts that would benefit from further organization and development.`,
        autoTitle: generateFallbackTitle(content),
        generate: `Here's a note based on your input: "${prompt}"\n\nKey points to expand on:\n• Main topic or theme\n• Supporting details\n• Action items or next steps\n• Additional thoughts or ideas`
      }
      
      return NextResponse.json({ 
        success: true, 
        result: fallbackResponses[action] 
      })
    }
    
    let systemPrompt: string
    let userPrompt: string
    
    switch (action) {
      case 'summarize':
        systemPrompt = "You are a helpful assistant that creates concise summaries of notes. Keep summaries under 200 words and highlight key points."
        userPrompt = `Please summarize this note:\n\n${content}`
        break
        
      case 'autoTitle':
        systemPrompt = "You are a helpful assistant that creates short, descriptive titles for notes. Keep titles under 60 characters and make them specific and clear."
        userPrompt = `Create a title for this note:\n\n${content}`
        break
        
      case 'generate':
        systemPrompt = "You are a helpful assistant that expands brief ideas into well-structured notes. Create organized, detailed content while maintaining the original intent."
        userPrompt = `Expand this brief idea into a detailed note:\n\n${prompt || content}`
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: action === 'autoTitle' ? 50 : 500,
      temperature: 0.7,
    })
    
    const result = completion.choices[0]?.message?.content?.trim()
    
    if (!result) {
      throw new Error('No response from AI')
    }
    
    return NextResponse.json({ success: true, result })
    
  } catch (error: any) {
    console.error('AI API Error:', error)
    
    const { action, content, prompt } = await request.json()
    const fallbackResponses = {
      summarize: `**Summary:** This note covers several key topics. Due to AI service limitations, please review the content manually for the main points.`,
      autoTitle: 'Untitled Note',
      generate: `Note: ${prompt || content}\n\n(AI generation temporarily unavailable - please expand manually)`
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'AI service temporarily unavailable',
      fallback: fallbackResponses[action as keyof typeof fallbackResponses]
    })
  }
}

function generateFallbackTitle(content: string): string {
  const words = content.split(' ').slice(0, 6)
  return words.join(' ').replace(/[^\w\s]/g, '').trim() || 'New Note'
}
