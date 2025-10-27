'use client'

import { useState, useEffect } from 'react'

interface PassageSection {
  id: string
  number: number
  content: string
}

interface MatchingHeadingsQuestionProps {
  question: {
    id: string
    passage: {
      title: string
      sections: PassageSection[]
    }
    headings: string[]
    correctAnswers: Record<string, string>
    instructions: string
  }
  onAnswerChange: (answers: Record<string, string>) => void
  initialAnswers?: Record<string, string>
  disabled?: boolean
}

export default function MatchingHeadingsQuestion({
  question,
  onAnswerChange,
  initialAnswers = {},
  disabled = false
}: MatchingHeadingsQuestionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [draggedHeading, setDraggedHeading] = useState<string | null>(null)

  useEffect(() => {
    setAnswers(initialAnswers)
  }, [initialAnswers])

  const handleDragStart = (heading: string) => {
    if (!disabled) {
      setDraggedHeading(heading)
    }
  }

  const handleDragEnd = () => {
    setDraggedHeading(null)
  }

  const handleDrop = (sectionId: string) => {
    if (draggedHeading && !disabled) {
      const newAnswers = { ...answers, [sectionId]: draggedHeading }
      setAnswers(newAnswers)
      onAnswerChange(newAnswers)
      setDraggedHeading(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const getAnswerForSection = (sectionId: string) => {
    return answers[sectionId] || ''
  }

  const isHeadingUsed = (heading: string) => {
    return Object.values(answers).includes(heading)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Instructions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Questions 1-{question.passage.sections.length}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {question.instructions}
            </p>
          </div>
          <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200">
            Help
          </button>
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-0">
        {/* Left Panel - Reading Passage */}
        <div className="bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Part 1
            </span>
            <p className="text-sm text-gray-600 mt-2">
              Read the text below and answer questions 1-{question.passage.sections.length}
            </p>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {question.passage.title}
          </h2>
          
          <div className="space-y-6">
            {question.passage.sections.map((section, index) => {
              const answer = getAnswerForSection(section.id)
              return (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {/* Drop zone for heading */}
                      <div
                        className={`min-h-[40px] border-2 border-dashed rounded-lg p-3 mb-3 transition-colors ${
                          answer
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 hover:border-blue-400'
                        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onDrop={() => handleDrop(section.id)}
                        onDragOver={handleDragOver}
                        onClick={() => {
                          if (!disabled && draggedHeading) {
                            handleDrop(section.id)
                          }
                        }}
                      >
                        {answer ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">
                              {answer}
                            </span>
                            {!disabled && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const newAnswers = { ...answers }
                                  delete newAnswers[section.id]
                                  setAnswers(newAnswers)
                                  onAnswerChange(newAnswers)
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Drop heading here
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-900 leading-relaxed text-sm">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Panel - Headings List */}
        <div className="bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Questions 1-{question.passage.sections.length}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose the correct heading for each section and move it into the gap.
            </p>
          </div>

          {/* Arrow pointing left */}
          <div className="flex justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* Headings List */}
          <div className="space-y-2">
            {question.headings.map((heading, index) => {
              const isUsed = isHeadingUsed(heading)
              const isDragging = draggedHeading === heading
              
              return (
                <div
                  key={heading}
                  draggable={!disabled && !isUsed}
                  onDragStart={() => handleDragStart(heading)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                    isUsed
                      ? 'bg-green-50 border-green-200 text-green-800 opacity-60 cursor-not-allowed'
                      : isDragging
                      ? 'bg-blue-100 border-blue-300 shadow-lg transform scale-105'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  } ${disabled ? 'cursor-not-allowed' : ''}`}
                >
                  <span className="text-sm font-medium">{heading}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to validate answers
export function validateMatchingHeadingsAnswers(
  userAnswers: Record<string, string>,
  correctAnswers: Record<string, string>
): { score: number; total: number; feedback: Record<string, { correct: boolean; message: string }> } {
  let score = 0
  const total = Object.keys(correctAnswers).length
  const feedback: Record<string, { correct: boolean; message: string }> = {}

  Object.keys(correctAnswers).forEach(sectionId => {
    const userAnswer = userAnswers[sectionId]
    const correctAnswer = correctAnswers[sectionId]
    const isCorrect = userAnswer === correctAnswer

    if (isCorrect) {
      score++
    }

    feedback[sectionId] = {
      correct: isCorrect,
      message: isCorrect 
        ? 'Correct heading!' 
        : `Incorrect. The correct heading is: ${correctAnswer}`
    }
  })

  return { score, total, feedback }
}
