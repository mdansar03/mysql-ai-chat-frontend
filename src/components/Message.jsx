import DataResults from './DataResults'
import SQLQuery from './SQLQuery'

const Message = ({ message, onExportCSV, onExportJSON }) => {
  const formatAIResponse = (text) => {
    // Since we're now receiving properly formatted HTML from the backend,
    // we just need to ensure it's safe and clean
    
    // If the text is already HTML (starts with <p>), return it as is
    if (text.trim().startsWith('<p>') || text.trim().startsWith('<div>')) {
      return text
    }
    
    // If it's plain text, convert to HTML paragraphs
    const paragraphs = text.split(/\n\n+/)
    const formatted = paragraphs.map(para => {
      const trimmed = para.trim()
      if (trimmed) {
        // Convert single line breaks to <br> within paragraphs
        const withBreaks = trimmed.replace(/\n/g, '<br>')
        return `<p>${withBreaks}</p>`
      }
      return ''
    }).filter(para => para).join('')
    
    return formatted || `<p>${text}</p>`
  }

  return (
    <div className={`message ${message.type}`}>
      <div className="message-wrapper">
        <div className="message-avatar">
          {message.type === 'user' ? (
            <i className="fas fa-user"></i>
          ) : (
            <i className="fas fa-robot"></i>
          )}
        </div>
        <div className="message-content">
          <div className="message-header">
            <span className="message-author">{message.author}</span>
            <span className="message-time">{message.timestamp}</span>
          </div>
          <div className="message-text">
            {message.type === 'assistant' ? (
              <div dangerouslySetInnerHTML={{ __html: formatAIResponse(message.text) }} />
            ) : (
              message.text
            )}
          </div>
          
          {/* SQL Query Display */}
          {message.sqlQuery && (
            <SQLQuery query={message.sqlQuery} />
          )}
          
          {/* Data Results Display */}
          {message.results && message.resultId && (
            <DataResults
              results={message.results}
              resultId={message.resultId}
              onExportCSV={onExportCSV}
              onExportJSON={onExportJSON}
            />
          )}
          
          {/* Performance Information */}
          {message.performance && (
            <div className="performance-info" style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
                <i className="fas fa-tachometer-alt" style={{ marginRight: '6px' }}></i>
                Performance Information
              </div>
              <div>
                <strong>Execution Time:</strong> {message.performance.execution_time}
              </div>
              {message.performance.timing_breakdown && (
                <div style={{ marginTop: '4px' }}>
                  <strong>Breakdown:</strong> SQL: {message.performance.timing_breakdown.sql_generation}, 
                  Query: {message.performance.timing_breakdown.query_execution}, 
                  AI: {message.performance.timing_breakdown.ai_response}
                </div>
              )}
              {message.performance.optimization_suggestions && message.performance.optimization_suggestions.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Optimization Suggestions:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '16px' }}>
                    {message.performance.optimization_suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message