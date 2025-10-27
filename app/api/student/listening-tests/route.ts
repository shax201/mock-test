import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get current user from token
    let currentUserId: string | null = null
    const token = request.cookies.get('student-token')?.value

    if (token) {
      try {
        const decoded = await verifyJWT(token)
        if (decoded && decoded.role === 'STUDENT') {
          currentUserId = decoded.userId
        }
      } catch (error) {
        // Token is invalid, continue without user context
        console.log('Invalid token, proceeding without user context')
      }
    }

    // Fetch all mock tests that have listening modules
    const mockTests = await prisma.mock.findMany({
      where: {
        modules: {
          some: {
            type: 'LISTENING'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        modules: {
          where: {
            type: 'LISTENING'
          },
          select: {
            id: true,
            type: true,
            durationMinutes: true,
            audioUrl: true,
            instructions: true
          }
        },
        assignments: {
          where: currentUserId ? {
            studentId: currentUserId
          } : {
            studentId: 'nonexistent'
          },
          include: {
            submissions: {
              include: {
                module: {
                  select: {
                    type: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedMockTests = mockTests.map(mock => {
      const listeningModule = mock.modules[0] // Get the listening module
      
      // Check if user has completed this listening test
      let status = 'AVAILABLE'
      let completionInfo = null

      if (currentUserId && mock.assignments && mock.assignments.length > 0) {
        const assignment = mock.assignments[0]
        const listeningSubmission = assignment.submissions?.find(sub => sub.module && sub.module.type === 'LISTENING')
        
        if (listeningSubmission && listeningSubmission.submittedAt) {
          status = 'COMPLETED'
          completionInfo = {
            completedAt: listeningSubmission.submittedAt,
            autoScore: listeningSubmission.autoScore
          }
        }
      }
      
      return {
        id: mock.id,
        title: mock.title,
        description: mock.description || 'IELTS Listening Test',
        duration: listeningModule?.durationMinutes || 40,
        status: status,
        createdAt: mock.createdAt,
        audioUrl: listeningModule?.audioUrl,
        instructions: listeningModule?.instructions,
        moduleId: listeningModule?.id,
        completionInfo: completionInfo
      }
    })

    return NextResponse.json({
      success: true,
      mockTests: transformedMockTests
    })
  } catch (error) {
    console.error('Error fetching listening tests:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch listening tests' 
      },
      { status: 500 }
    )
  }
}
