import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { scoreListening } from '@/lib/scoring/auto-scorer'
import { calculateListeningBand } from '@/lib/scoring/band-calculator'
import { calculateAndStoreResults } from '@/lib/scoring/result-calculator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, answers, timeSpent } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find assignment by token
    const assignment = await prisma.assignment.findUnique({
      where: { tokenHash: token },
      include: {
        mock: {
          include: {
            modules: {
              where: { type: 'LISTENING' },
              include: {
                questions: {
                  include: {
                    questionBank: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const listeningModule = assignment.mock.modules[0]
    if (!listeningModule) {
      return NextResponse.json({ error: 'Listening module not found' }, { status: 404 })
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignment.id,
        moduleId: listeningModule.id
      }
    })

    // Calculate score
    const studentAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer: answer as string
    }))

    const correctAnswers = listeningModule.questions.map(q => {
      // Map Prisma QuestionType to the supported types in auto-scorer
      let mappedType: string = q.questionBank.type
      switch (q.questionBank.type) {
        case 'TRUE_FALSE_NOT_GIVEN':
          mappedType = 'NOT_GIVEN' // Map to the closest equivalent
          break
        case 'MULTIPLE_CHOICE':
          mappedType = 'MCQ' // Map to the closest equivalent
          break
        case 'NOTES_COMPLETION':
        case 'SUMMARY_COMPLETION':
          mappedType = 'FIB' // Map to the closest equivalent
          break
        default:
          mappedType = q.questionBank.type
          break
      }
      
      return {
        questionId: q.id,
        answer: typeof q.correctAnswerJson === 'string' ? q.correctAnswerJson : 
                Array.isArray(q.correctAnswerJson) ? q.correctAnswerJson.map(String) : 
                String(q.correctAnswerJson || ''),
        type: mappedType as 'MCQ' | 'FIB' | 'MATCHING' | 'TRUE_FALSE' | 'NOT_GIVEN'
      }
    })

    const scoreResult = scoreListening(studentAnswers, correctAnswers)
    const bandScore = calculateListeningBand(scoreResult.correctCount)

    let submission
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answersJson: answers,
          submittedAt: new Date(),
          autoScore: bandScore
        }
      })
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          moduleId: listeningModule.id,
          startedAt: new Date(),
          answersJson: answers,
          submittedAt: new Date(),
          autoScore: bandScore
        }
      })
    }

    // Calculate and store overall results
    try {
      await calculateAndStoreResults(assignment.id)
    } catch (error) {
      console.error('Error calculating results:', error)
      // Don't fail the submission if result calculation fails
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score: {
        correctCount: scoreResult.correctCount,
        totalQuestions: scoreResult.totalQuestions,
        bandScore: bandScore
      }
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 }
    )
  }
}
