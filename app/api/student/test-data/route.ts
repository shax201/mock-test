import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testToken = searchParams.get('token')
    const moduleType = searchParams.get('module')
    const requestedModuleType = moduleType?.toUpperCase()
    // When client requests MATCHING_HEADINGS, serve it under the READING module
    const effectiveModuleType = requestedModuleType === 'MATCHING_HEADINGS' ? 'READING' : requestedModuleType

    if (!testToken) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verify the test token
    const assignment = await prisma.assignment.findUnique({
      where: { tokenHash: testToken },
      include: {
        student: true,
        mock: {
          include: {
            modules: {
              include: {
                questions: {
                  include: {
                    questionBank: true
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid test token' }, { status: 404 })
    }

    // Check if assignment is still valid
    const now = new Date()
    if (now < assignment.validFrom || now > assignment.validUntil) {
      return NextResponse.json({ error: 'Test token has expired' }, { status: 403 })
    }

    // Find the specific module with related data
    const module = assignment.mock.modules.find(m => m.type === effectiveModuleType)
    
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Fetch module-specific data
    let readingData = null
    let listeningData = null

    if (module.type === 'READING') {
      readingData = await prisma.readingModuleData.findUnique({
        where: { moduleId: module.id }
      })
    } else if (module.type === 'LISTENING') {
      listeningData = await prisma.listeningModuleData.findUnique({
        where: { moduleId: module.id }
      })
    }

    // Transform questions for the frontend
    const questions = module.questions
      .filter(q => {
        // If explicitly requesting MATCHING_HEADINGS, only include matching-heading style questions
        if (requestedModuleType === 'MATCHING_HEADINGS') {
          const content = q.questionBank.contentJson as any
          return (
            q.questionBank.type === 'MATCHING' && content && content.passage && Array.isArray(content.headings)
          )
        }
        return true
      })
      .map(q => {
        const content = q.questionBank.contentJson as any

        // Serve matching-headings payload when requested or when stored as such
        if (
          requestedModuleType === 'MATCHING_HEADINGS' ||
          q.questionBank.type === 'MATCHING'
        ) {
          // Accept either explicit MATCHING_HEADINGS type or MATCHING with passage/headings
          if (content && content.passage && Array.isArray(content.headings)) {
            return {
              id: q.id,
              type: 'MATCHING_HEADINGS',
              passage: content.passage || { title: '', sections: [] },
              headings: content.headings || [],
              correctAnswers: content.correctAnswers || {},
              instructions: content.instructions || '',
              points: q.points,
              part: content.part || 1
            }
          }
        }

        // Handle remedial test questions with questionAudios
        if (content?.questionAudios && Array.isArray(content.questionAudios)) {
          return {
            id: q.id,
            type: q.questionBank.type,
            content: content?.content || '',
            options: content?.options || [],
            fibData: content?.fibData || null,
            matchingData: content?.matchingData || null,
            notesCompletionData: content?.notesCompletionData || null,
            summaryCompletionData: content?.summaryCompletionData || null,
            trueFalseNotGivenData: content?.trueFalseNotGivenData || null,
            instructions: content?.instructions || '',
            points: q.points,
            correctAnswer: q.correctAnswerJson,
            part: content?.part || 1,
            questionAudios: content.questionAudios
          }
        }

        return {
          id: q.id,
          type: q.questionBank.type,
          content: content?.content || '',
          options: content?.options || [],
          fibData: content?.fibData || null,
          matchingData: content?.matchingData || null,
          notesCompletionData: content?.notesCompletionData || null,
          summaryCompletionData: content?.summaryCompletionData || null,
          trueFalseNotGivenData: content?.trueFalseNotGivenData || null,
          instructions: content?.instructions || '',
          points: q.points,
          correctAnswer: q.correctAnswerJson,
          part: content?.part || 1
        }
      })

    return NextResponse.json({
      module: {
        id: module.id,
        type: module.type,
        duration: module.durationMinutes,
        audioUrl: module.audioUrl,
        instructions: module.instructions,
        passageContent: module.passageContent,
        readingData: readingData,
        listeningData: listeningData
      },
      questions,
      assignment: {
        id: assignment.id,
        candidateNumber: assignment.candidateNumber,
        studentName: assignment.student?.name || 'Student',
        mockTitle: assignment.mock.title
      }
    })

  } catch (error) {
    console.error('Error fetching test data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
