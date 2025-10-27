import {
  calculateListeningBand,
  calculateReadingBand,
  calculateWritingBand,
  calculateOverallBand,
  applyIELTSRounding,
  getBandDescription
} from '@/lib/scoring/band-calculator'

describe('Band Calculator', () => {
  describe('calculateListeningBand', () => {
    it('should return correct band for perfect score', () => {
      expect(calculateListeningBand(40)).toBe(9.0)
    })

    it('should return correct band for good score', () => {
      expect(calculateListeningBand(35)).toBe(6.5)
    })

    it('should return correct band for average score', () => {
      expect(calculateListeningBand(25)).toBe(4.5)
    })

    it('should return 0 for no correct answers', () => {
      expect(calculateListeningBand(0)).toBe(0.0)
    })
  })

  describe('calculateReadingBand', () => {
    it('should return correct band for perfect score', () => {
      expect(calculateReadingBand(40)).toBe(9.0)
    })

    it('should return correct band for good score', () => {
      expect(calculateReadingBand(35)).toBe(6.5)
    })
  })

  describe('calculateWritingBand', () => {
    it('should calculate average correctly', () => {
      const criteriaScores = {
        taskAchievement: 6.0,
        coherenceCohesion: 6.5,
        lexicalResource: 7.0,
        grammarAccuracy: 6.5
      }
      const result = calculateWritingBand(criteriaScores)
      expect(result).toBe(6.5) // Average of 6.5
    })

    it('should apply IELTS rounding rules', () => {
      const criteriaScores = {
        taskAchievement: 6.0,
        coherenceCohesion: 6.0,
        lexicalResource: 6.0,
        grammarAccuracy: 6.0
      }
      const result = calculateWritingBand(criteriaScores)
      expect(result).toBe(6.0)
    })
  })

  describe('calculateOverallBand', () => {
    it('should calculate overall band correctly', () => {
      const bands = {
        listening: 7.0,
        reading: 6.5,
        writing: 6.0,
        speaking: 6.5
      }
      const result = calculateOverallBand(bands)
      expect(result).toBe(6.5)
    })
  })

  describe('applyIELTSRounding', () => {
    it('should round down for scores less than 0.25', () => {
      expect(applyIELTSRounding(6.2)).toBe(6.0)
    })

    it('should round to 0.5 for scores between 0.25 and 0.74', () => {
      expect(applyIELTSRounding(6.3)).toBe(6.5)
      expect(applyIELTSRounding(6.6)).toBe(6.5)
    })

    it('should round up for scores 0.75 and above', () => {
      expect(applyIELTSRounding(6.8)).toBe(7.0)
    })
  })

  describe('getBandDescription', () => {
    it('should return correct description for band 9', () => {
      expect(getBandDescription(9.0)).toBe('Expert User')
    })

    it('should return correct description for band 7', () => {
      expect(getBandDescription(7.0)).toBe('Good User')
    })

    it('should return correct description for band 5', () => {
      expect(getBandDescription(5.0)).toBe('Modest User')
    })

    it('should return correct description for band 0', () => {
      expect(getBandDescription(0.0)).toBe('Did not attempt')
    })
  })
})
