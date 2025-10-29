import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth/jwt'
import { generateStudentToken } from '@/lib/auth/token-generator'

function mapQuestionType(remedialType: string): string {
  const typeMap: Record<string, string> = {
    'MATCHING_HEADINGS': 'MATCHING',
    'INFORMATION_MATCHING': 'MATCHING',
    'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
    'TRUE_FALSE_NOT_GIVEN': 'TRUE_FALSE_NOT_GIVEN',
    'TRUE_FALSE': 'TRUE_FALSE',
    'FIB': 'FIB',
    'NOTES_COMPLETION': 'NOTES_COMPLETION',
    'SUMMARY_COMPLETION': 'SUMMARY_COMPLETION'
  }
  
  return typeMap[remedialType] || 'MULTIPLE_CHOICE'
}

export async function POST(request: NextRequest) {
  try {
    // Verify student authentication
    const token = request.cookies.get('student-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { remedialTestId } = await request.json()

    if (!remedialTestId) {
      return NextResponse.json({ error: 'Remedial test ID is required' }, { status: 400 })
    }

    // Get the remedial test template
    const remedialTest = await prisma.remedialTestTemplate.findUnique({
      where: { id: remedialTestId },
      include: {
        mockTest: true
      }
    })

    if (!remedialTest) {
      return NextResponse.json({ error: 'Remedial test not found' }, { status: 404 })
    }

    if (!remedialTest.isActive) {
      return NextResponse.json({ error: 'Remedial test is not active' }, { status: 400 })
    }

    // Generate a unique token for this remedial test session
    const candidateNumber = `R${Date.now()}`
    const now = new Date()
    const validUntil = new Date(now.getTime() + remedialTest.duration * 60 * 1000)
    const sessionToken = generateStudentToken(candidateNumber, now, validUntil)

    // Create a remedial test session
    const session = await prisma.remedialTestSession.create({
      data: {
        studentId: decoded.userId,
        templateId: remedialTestId,
        testType: 'REMEDIAL',
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + remedialTest.duration * 60 * 1000), // Convert minutes to milliseconds
        answers: {}
      }
    })

    // Transform remedial test questions to the format expected by the frontend
    const transformedQuestions = Array.isArray(remedialTest.questions) 
      ? remedialTest.questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          type: mapQuestionType(remedialTest.type),
          content: q.questions?.[0] || q.content || 'Question',
          options: q.options || [],
          correctAnswer: q.correctAnswer || q.correctAnswers?.["0"] || '',
          points: 1,
          part: 1,
          instructions: q.instructions || '',
          questionAudios: q.questionAudios || []
        }))
      : []

    // Create a mock test structure for the remedial test
    // This allows us to reuse the existing test infrastructure
    const mockTest = await prisma.mock.create({
      data: {
        title: `Remedial Test: ${remedialTest.title}`,
        description: remedialTest.description || '',
        createdBy: decoded.userId, // Use student's ID for remedial tests
        modules: {
          create: [
            {
              type: remedialTest.module as any,
              durationMinutes: remedialTest.duration,
              instructions: `Complete this ${remedialTest.type.replace(/_/g, ' ').toLowerCase()} practice test.`,
              audioUrl: remedialTest.audioUrl,
              order: 1,
              questions: {
                create: transformedQuestions.map((q, index) => ({
                  order: index + 1,
                  correctAnswerJson: q.correctAnswer,
                  questionBank: {
                    create: {
                      type: q.type as any,
                      contentJson: {
                        content: q.content,
                        options: q.options,
                        instructions: q.instructions,
                        questionAudios: q.questionAudios,
                        correctAnswers: { "0": q.correctAnswer }
                      }
                    }
                  }
                }))
              }
            }
          ]
        }
      }
    })

    // Create listening module data if this is a listening test
    if (remedialTest.module === 'LISTENING' && remedialTest.audioUrl) {
      // Fetch the created mock test with modules to get the module ID
      const mockTestWithModules = await prisma.mock.findUnique({
        where: { id: mockTest.id },
        include: { modules: true }
      })
      
      if (mockTestWithModules) {
        const listeningModule = mockTestWithModules.modules.find(m => m.type === 'LISTENING')
        if (listeningModule) {
          await prisma.listeningModuleData.create({
            data: {
              moduleId: listeningModule.id,
              audioUrl: remedialTest.audioUrl,
              audioPublicId: remedialTest.audioPublicId,
              audioDuration: 300, // Default 5 minutes, can be updated later
              part1Content: 'Listen to the audio and answer the questions.',
              part2Content: 'Continue listening to the audio.',
              part3Content: 'Complete the listening test.',
              part1Instructions: 'Listen carefully and choose the best answer.',
              part2Instructions: 'Pay attention to details in the audio.',
              part3Instructions: 'Focus on the main ideas and supporting details.'
            }
          })
        }
      }
    }

    // Create an assignment for the student
    const assignment = await prisma.assignment.create({
      data: {
        studentId: decoded.userId,
        mockId: mockTest.id,
        candidateNumber: candidateNumber, // Use the same candidate number
        tokenHash: sessionToken, // Store the token as tokenHash
        validFrom: now,
        validUntil: validUntil,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      token: sessionToken,
      assignmentId: assignment.id,
      sessionId: session.id,
      testTitle: remedialTest.title,
      duration: remedialTest.duration,
      module: remedialTest.module
    })

  } catch (error: any) {
    console.error('Error starting remedial test session:', error)
    return NextResponse.json(
      { error: 'Failed to start remedial test session', details: error.message },
      { status: 500 }
    )
  }
}
