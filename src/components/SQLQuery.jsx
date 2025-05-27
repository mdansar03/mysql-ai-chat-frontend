import { useState } from 'react'

const SQLQuery = ({ query }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="sql-query">
      <button 
        className="copy-button" 
        onClick={copyToClipboard}
        style={{ backgroundColor: copied ? 'var(--success-color)' : 'var(--primary-color)' }}
      >
        <i className={`fas fa-${copied ? 'check' : 'copy'}`}></i> 
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre>{query}</pre>
    </div>
  )
}

export default SQLQuery 