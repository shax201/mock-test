import {
  generateStudentToken,
  validateStudentToken,
  isTokenExpired,
  isTokenActive
} from '@/lib/auth/token-generator'

describe('Token Generator', () => {
  const candidateNumber = 'CAND001'
  const validFrom = new Date('2024-01-15T00:00:00Z')
  const validUntil = new Date('2024-01-18T00:00:00Z')

  describe('generateStudentToken', () => {
    it('should generate a token with correct format', () => {
      const token = generateStudentToken(candidateNumber, validFrom, validUntil)
      expect(token).toMatch(/^CAND001-/)
      expect(token.split('-')).toHaveLength(2)
    })

    it('should generate different tokens for different dates', () => {
      const token1 = generateStudentToken(candidateNumber, validFrom, validUntil)
      const token2 = generateStudentToken(candidateNumber, new Date('2024-01-16T00:00:00Z'), validUntil)
      expect(token1).not.toBe(token2)
    })
  })

  describe('validateStudentToken', () => {
    it('should validate correctly formatted token', () => {
      const token = generateStudentToken(candidateNumber, validFrom, validUntil)
      const result = validateStudentToken(token)
      expect(result).toBeTruthy()
      expect(result?.candidateNumber).toBe(candidateNumber)
    })

    it('should return null for invalid token format', () => {
      const result = validateStudentToken('invalid')
      expect(result).toBeNull()
    })

    it('should return null for malformed token', () => {
      const result = validateStudentToken('not-a-valid-token-format')
      expect(result).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      expect(isTokenExpired(pastDate)).toBe(true)
    })

    it('should return false for future date', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      expect(isTokenExpired(futureDate)).toBe(false)
    })
  })

  describe('isTokenActive', () => {
    it('should return true for active token', () => {
      const validFrom = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      const validUntil = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      expect(isTokenActive(validFrom, validUntil)).toBe(true)
    })

    it('should return false for not yet active token', () => {
      const validFrom = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      const validUntil = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      expect(isTokenActive(validFrom, validUntil)).toBe(false)
    })

    it('should return false for expired token', () => {
      const validFrom = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const validUntil = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      expect(isTokenActive(validFrom, validUntil)).toBe(false)
    })
  })
})
