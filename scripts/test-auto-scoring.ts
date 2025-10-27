#!/usr/bin/env tsx

import { prisma } from '../lib/db'
import { scoreReading, scoreListening } from '../lib/scoring/auto-scorer'
import { calculateReadingBand, calculateListeningBand } from '../lib/scoring/band-calculator'

async function testAutoScoring() {
  console.log('🧪 Testing Auto-Scoring System...\n')

  try {
    // Test data
    const studentAnswers = [
      { questionId: 'q1', answer: 'climate change' },
      { questionId: 'q2', answer: 'fossil fuels' },
      { questionId: 'q3', answer: 'renewable energy' },
      { questionId: 'q4', answer: 'solar power' },
      { questionId: 'q5', answer: 'wind energy' }
    ]

    const correctAnswers = [
      { questionId: 'q1', answer: 'climate change', type: 'FIB' as const },
      { questionId: 'q2', answer: 'fossil fuels', type: 'FIB' as const },
      { questionId: 'q3', answer: 'renewable energy', type: 'FIB' as const },
      { questionId: 'q4', answer: 'solar power', type: 'FIB' as const },
      { questionId: 'q5', answer: 'wind energy', type: 'FIB' as const }
    ]

    // Test Reading Scoring
    console.log('📖 Testing Reading Scoring:')
    const readingResult = scoreReading(studentAnswers, correctAnswers)
    const readingBand = calculateReadingBand(readingResult.correctCount)
    console.log(`   Correct: ${readingResult.correctCount}/${readingResult.totalQuestions}`)
    console.log(`   Band Score: ${readingBand}`)
    console.log()

    // Test Listening Scoring
    console.log('🎧 Testing Listening Scoring:')
    const listeningResult = scoreListening(studentAnswers, correctAnswers)
    const listeningBand = calculateListeningBand(listeningResult.correctCount)
    console.log(`   Correct: ${listeningResult.correctCount}/${listeningResult.totalQuestions}`)
    console.log(`   Band Score: ${listeningBand}`)
    console.log()

    // Test with wrong answers
    console.log('❌ Testing with Wrong Answers:')
    const wrongAnswers = [
      { questionId: 'q1', answer: 'wrong answer' },
      { questionId: 'q2', answer: 'incorrect' },
      { questionId: 'q3', answer: 'renewable energy' }, // This one is correct
      { questionId: 'q4', answer: 'wrong' },
      { questionId: 'q5', answer: 'incorrect' }
    ]

    const wrongReadingResult = scoreReading(wrongAnswers, correctAnswers)
    const wrongReadingBand = calculateReadingBand(wrongReadingResult.correctCount)
    console.log(`   Correct: ${wrongReadingResult.correctCount}/${wrongReadingResult.totalQuestions}`)
    console.log(`   Band Score: ${wrongReadingBand}`)
    console.log()

    // Check if we have any assignments with submissions
    console.log('📊 Checking Database for Submissions:')
    const assignments = await prisma.assignment.findMany({
      include: {
        submissions: {
          include: {
            module: true
          }
        },
        result: true
      }
    })

    console.log(`   Found ${assignments.length} assignments`)
    
    assignments.forEach((assignment, index) => {
      console.log(`   Assignment ${index + 1}:`)
      console.log(`     Status: ${assignment.status}`)
      console.log(`     Submissions: ${assignment.submissions.length}`)
      console.log(`     Has Result: ${assignment.result ? 'Yes' : 'No'}`)
      
      if (assignment.submissions.length > 0) {
        assignment.submissions.forEach(submission => {
          console.log(`       ${submission.module.type}: Auto Score = ${submission.autoScore || 'Not calculated'}`)
        })
      }
      
      if (assignment.result) {
        console.log(`     Result Bands:`)
        console.log(`       Listening: ${assignment.result.listeningBand}`)
        console.log(`       Reading: ${assignment.result.readingBand}`)
        console.log(`       Writing: ${assignment.result.writingBand}`)
        console.log(`       Speaking: ${assignment.result.speakingBand}`)
        console.log(`       Overall: ${assignment.result.overallBand}`)
      }
      console.log()
    })

    console.log('✅ Auto-scoring test completed!')

  } catch (error) {
    console.error('❌ Error testing auto-scoring:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutoScoring()
