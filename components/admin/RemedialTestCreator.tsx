'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMockTests } from '@/lib/actions/mock-tests'

interface PassageSection {
  id: string
  number: number
  content: string
}

interface QuestionData {
  id: string
  passage?: {
    title: string
    sections: PassageSection[]
  }
  headings?: string[]
  questions?: string[]
  correctAnswers: Record<string, string>
  instructions: string
}

interface MockTest {
  id: string
  title: string
  description: string | null
  modules: Array<{ type: string }>
}

interface RemedialTestData {
  title: string
  description: string
  type: string
  module: string
  difficulty: string
  duration: number
  mockTestId?: string
  questions: QuestionData[]
}

export default function RemedialTestCreator() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mockTests, setMockTests] = useState<MockTest[]>([])
  const [testData, setTestData] = useState<RemedialTestData>({
    title: '',
    description: '',
    type: 'MATCHING_HEADINGS',
    module: 'READING',
    difficulty: 'INTERMEDIATE',
    duration: 20,
    mockTestId: '',
    questions: []
  })

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData>({
    id: 'q1',
    passage: {
      title: '',
      sections: []
    },
    headings: [],
    questions: [],
    correctAnswers: {},
    instructions: ''
  })

  useEffect(() => {
    fetchMockTests()
  }, [])

  const fetchMockTests = async () => {
    try {
      console.log('Fetching mock tests...')
      const result = await getMockTests()
      console.log('Mock tests result:', result)
      
      if (result.success) {
        setMockTests(result.mockTests || [])
      } else {
        console.error('Failed to fetch mock tests:', result.error)
      }
    } catch (error) {
      console.error('Error fetching mock tests:', error)
    }
  }

  const questionTypes = [
    { value: 'MATCHING_HEADINGS', label: 'Matching Headings', description: 'Students match headings to reading passage sections' },
    { value: 'INFORMATION_MATCHING', label: 'Information Matching', description: 'Students match statements to passage sections' },
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', description: 'Students choose from multiple answer options' },
    { value: 'NOTES_COMPLETION', label: 'Notes Completion', description: 'Students complete notes from audio or text' }
  ]

  const modules = [
    { value: 'READING', label: 'Reading' },
    { value: 'LISTENING', label: 'Listening' },
    { value: 'WRITING', label: 'Writing' },
    { value: 'SPEAKING', label: 'Speaking' }
  ]

  const difficulties = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ]

  const handleBasicInfoChange = (field: string, value: string | number) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuestionChange = (field: string, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPassageSection = () => {
    const newSection: PassageSection = {
      id: `section-${currentQuestion.passage?.sections.length || 0 + 1}`,
      number: (currentQuestion.passage?.sections.length || 0) + 1,
      content: ''
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      passage: {
        ...prev.passage!,
        sections: [...(prev.passage?.sections || []), newSection]
      }
    }))
  }

  const updatePassageSection = (sectionId: string, field: string, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      passage: {
        ...prev.passage!,
        sections: prev.passage?.sections.map(section => 
          section.id === sectionId ? { ...section, [field]: value } : section
        ) || []
      }
    }))
  }

  const removePassageSection = (sectionId: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      passage: {
        ...prev.passage!,
        sections: prev.passage?.sections.filter(section => section.id !== sectionId) || []
      }
    }))
  }

  const addHeading = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      headings: [...(prev.headings || []), '']
    }))
  }

  const updateHeading = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      headings: prev.headings?.map((heading, i) => i === index ? value : heading) || []
    }))
  }

  const removeHeading = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      headings: prev.headings?.filter((_, i) => i !== index) || []
    }))
  }

  const addQuestion = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      questions: [...(prev.questions || []), '']
    }))
  }

  const updateQuestion = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      questions: prev.questions?.map((question, i) => i === index ? value : question) || []
    }))
  }

  const removeQuestion = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }))
  }

  const addQuestionToTest = () => {
    setTestData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }))
    
    // Reset current question
    setCurrentQuestion({
      id: `q${testData.questions.length + 2}`,
      passage: {
        title: '',
        sections: []
      },
      headings: [],
      questions: [],
      correctAnswers: {},
      instructions: ''
    })
  }

  const handleSubmit = async () => {
    // Validate form data
    if (!testData.title || !testData.type || !testData.module) {
      alert('Please fill in all required fields')
      return
    }

    if (testData.questions.length === 0) {
      alert('Please add at least one question to the test')
      return
    }

    setLoading(true)
    try {
      console.log('Submitting test data:', testData)
      
      const response = await fetch('/api/admin/remedial-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Test created successfully:', result)
        router.push('/admin/remedial-tests')
      } else {
        const errorData = await response.json()
        console.error('Failed to create remedial test:', errorData)
        alert(`Failed to create remedial test: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating remedial test:', error)
      alert('Error creating remedial test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={testData.title}
              onChange={(e) => handleBasicInfoChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter test title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module *
            </label>
            <select
              value={testData.module}
              onChange={(e) => handleBasicInfoChange('module', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {modules.map(module => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type *
            </label>
            <select
              value={testData.type}
              onChange={(e) => handleBasicInfoChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {questionTypes.find(t => t.value === testData.type)?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              value={testData.difficulty}
              onChange={(e) => handleBasicInfoChange('difficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={testData.duration}
              onChange={(e) => handleBasicInfoChange('duration', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              min="5"
              max="120"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Mock Test (Optional)
            </label>
            <select
              value={testData.mockTestId || ''}
              onChange={(e) => handleBasicInfoChange('mockTestId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a mock test (optional)</option>
              {mockTests.length > 0 ? (
                mockTests.map((mockTest) => (
                  <option key={mockTest.id} value={mockTest.id}>
                    {mockTest.title} - {mockTest.modules.map(m => m.type).join(', ')}
                  </option>
                ))
              ) : (
                <option value="" disabled>No mock tests available</option>
              )}
            </select>
              <p className="text-sm text-gray-500 mt-1">
                {mockTests.length > 0 
                  ? `Found ${mockTests.length} mock test(s) available for linking. Link this remedial test to a specific mock test for better tracking and analytics.`
                  : 'No mock tests found. Create some mock tests first, or leave this field empty to create a standalone remedial test.'
                }
              </p>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={testData.description}
            onChange={(e) => handleBasicInfoChange('description', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter test description"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Question Content</h3>
        
        {/* Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions *
          </label>
          <textarea
            value={currentQuestion.instructions}
            onChange={(e) => handleQuestionChange('instructions', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter question instructions"
          />
        </div>

        {/* Passage Content for Reading Questions */}
        {(testData.type === 'MATCHING_HEADINGS' || testData.type === 'INFORMATION_MATCHING') && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Reading Passage
              </label>
              <button
                type="button"
                onClick={addPassageSection}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Section
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={currentQuestion.passage?.title || ''}
                onChange={(e) => handleQuestionChange('passage', {
                  ...currentQuestion.passage,
                  title: e.target.value
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                placeholder="Passage Title"
              />
            </div>
            
            <div className="space-y-4">
              {currentQuestion.passage?.sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Section {section.number}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePassageSection(section.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updatePassageSection(section.id, 'content', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter section content"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Headings for Matching Headings */}
        {testData.type === 'MATCHING_HEADINGS' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Headings
              </label>
              <button
                type="button"
                onClick={addHeading}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Heading
              </button>
            </div>
            
            <div className="space-y-2">
              {currentQuestion.headings?.map((heading, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 w-8">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <input
                    type="text"
                    value={heading}
                    onChange={(e) => updateHeading(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter heading"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeading(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions for Information Matching */}
        {testData.type === 'INFORMATION_MATCHING' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Questions
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Question
              </button>
            </div>
            
            <div className="space-y-2">
              {currentQuestion.questions?.map((question, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 w-8">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter question"
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Create</h3>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Test Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Title:</span>
              <span className="ml-2 font-medium">{testData.title}</span>
            </div>
            <div>
              <span className="text-gray-600">Module:</span>
              <span className="ml-2 font-medium">{testData.module}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">
                {questionTypes.find(t => t.value === testData.type)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Difficulty:</span>
              <span className="ml-2 font-medium">{testData.difficulty}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{testData.duration} minutes</span>
            </div>
            <div>
              <span className="text-gray-600">Questions:</span>
              <span className="ml-2 font-medium">{testData.questions.length}</span>
            </div>
            {testData.mockTestId && (
              <div>
                <span className="text-gray-600">Linked Mock Test:</span>
                <span className="ml-2 font-medium">
                  {mockTests.find(mt => mt.id === testData.mockTestId)?.title || 'Unknown'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Remedial Test</h1>
        <p className="mt-2 text-gray-600">
          Create personalized remedial tests to help students improve their weak areas.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Question Content'}
                {step === 3 && 'Review & Create'}
              </div>
              {step < 3 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-4">
            {currentStep === 2 && (
              <button
                onClick={addQuestionToTest}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Question to Test
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !testData.title || !testData.type || !testData.module || testData.questions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Test'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
