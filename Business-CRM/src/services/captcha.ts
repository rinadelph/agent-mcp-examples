// Since we don't have a backend server, we'll implement a client-side secure captcha
// with session storage and cryptographic validation

interface CaptchaSession {
  id: string
  answer: number
  timestamp: number
  attempts: number
}

class CaptchaService {
  private static readonly MAX_ATTEMPTS = 3
  private static readonly EXPIRY_TIME = 5 * 60 * 1000 // 5 minutes
  private static readonly SESSION_KEY = 'captcha_sessions'

  // Generate a cryptographic hash of the answer for validation
  private static async hashAnswer(answer: number, sessionId: string): Promise<string> {
    const text = `${answer}_${sessionId}_salt_925silver`
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Generate a new captcha challenge
  static async generateCaptcha(): Promise<{
    sessionId: string
    question: string
    hashedAnswer: string
  }> {
    // Generate simple math problem
    const num1 = Math.floor(Math.random() * 20) + 1
    const num2 = Math.floor(Math.random() * 20) + 1
    const operators = ['+', '-', '*']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let answer: number
    let question: string
    
    switch (operator) {
      case '+':
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case '-':
        // Ensure positive result
        const [larger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1]
        answer = larger - smaller
        question = `${larger} - ${smaller}`
        break
      case '*':
        // Use smaller numbers for multiplication
        const smallNum1 = Math.floor(Math.random() * 10) + 1
        const smallNum2 = Math.floor(Math.random() * 10) + 1
        answer = smallNum1 * smallNum2
        question = `${smallNum1} × ${smallNum2}`
        break
      default:
        throw new Error('Invalid operator')
    }

    // Generate session ID
    const sessionId = crypto.randomUUID()
    
    // Hash the answer for secure storage
    const hashedAnswer = await this.hashAnswer(answer, sessionId)
    
    // Store session in localStorage with expiry
    const session: CaptchaSession = {
      id: sessionId,
      answer: answer,
      timestamp: Date.now(),
      attempts: 0
    }
    
    this.storeSession(session)
    
    return {
      sessionId,
      question: `${question} = ?`,
      hashedAnswer
    }
  }

  // Validate captcha answer
  static async validateCaptcha(
    sessionId: string, 
    userAnswer: number, 
    hashedAnswer: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Get session from storage
      const session = this.getSession(sessionId)
      
      if (!session) {
        return { valid: false, error: 'Captcha session expired. Please refresh.' }
      }

      // Check if session has expired
      if (Date.now() - session.timestamp > this.EXPIRY_TIME) {
        this.removeSession(sessionId)
        return { valid: false, error: 'Captcha expired. Please refresh.' }
      }

      // Check attempt limit
      if (session.attempts >= this.MAX_ATTEMPTS) {
        this.removeSession(sessionId)
        return { valid: false, error: 'Too many attempts. Please refresh captcha.' }
      }

      // Increment attempts
      session.attempts++
      this.storeSession(session)

      // Validate the hashed answer
      const expectedHash = await this.hashAnswer(session.answer, sessionId)
      if (expectedHash !== hashedAnswer) {
        return { valid: false, error: 'Invalid captcha session.' }
      }

      // Check if the answer is correct
      if (userAnswer === session.answer) {
        // Remove session after successful validation
        this.removeSession(sessionId)
        return { valid: true }
      } else {
        return { valid: false, error: 'Incorrect answer. Please try again.' }
      }
    } catch (error) {
      return { valid: false, error: 'Captcha validation failed.' }
    }
  }

  // Store session in localStorage
  private static storeSession(session: CaptchaSession): void {
    try {
      const sessions = this.getAllSessions()
      sessions[session.id] = session
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to store captcha session:', error)
    }
  }

  // Get session from localStorage
  private static getSession(sessionId: string): CaptchaSession | null {
    try {
      const sessions = this.getAllSessions()
      return sessions[sessionId] || null
    } catch (error) {
      console.error('Failed to get captcha session:', error)
      return null
    }
  }

  // Remove session from localStorage
  private static removeSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions()
      delete sessions[sessionId]
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to remove captcha session:', error)
    }
  }

  // Get all sessions from localStorage
  private static getAllSessions(): Record<string, CaptchaSession> {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to get captcha sessions:', error)
      return {}
    }
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    try {
      const sessions = this.getAllSessions()
      const now = Date.now()
      const validSessions: Record<string, CaptchaSession> = {}

      Object.values(sessions).forEach(session => {
        if (now - session.timestamp < this.EXPIRY_TIME) {
          validSessions[session.id] = session
        }
      })

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(validSessions))
    } catch (error) {
      console.error('Failed to cleanup captcha sessions:', error)
    }
  }
}

export default CaptchaService