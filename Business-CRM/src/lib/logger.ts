/**
 * Simple logger utility for production-safe logging
 * In production, this could be replaced with a proper logging service
 */

const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
    // In production, you might want to send warnings to a logging service
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args)
    }
    // In production, you should send errors to an error tracking service
    // Example: Sentry.captureException(args[0])
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

export default logger