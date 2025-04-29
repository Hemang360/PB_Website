'use client';

import { useEffect } from 'react'
import logger from '../utils/logger'

export default function ExampleComponent() {
  useEffect(() => {
    logger.info('Component mounted')
    
    return () => {
      logger.info('Component unmounted')
    }
  }, [])

  const handleClick = () => {
    logger.info('Button clicked')
    // Do something
  }

  return (
    <div>
      <h1>Example Component</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}