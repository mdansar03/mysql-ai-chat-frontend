import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import Message from './Message'
import MessageInput from './MessageInput'
// import ChatToggle from './ChatToggle'

const ChatArea = ({ messages, addMessage, isConnected, currentTable, updateStatus }) => {
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const resultsCache = useRef({})

  // const chatModeOptions = [
  //   { label: 'Query', icon: 'fa-search', value: 'query' },
  //   { label: 'Analyze', icon: 'fa-chart-line', value: 'analyze' },
  //   { label: 'Explore', icon: 'fa-compass', value: 'explore' }
  // ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // const handleChatModeChange = (option) => {
  //   updateStatus(`Switched to ${option.label} mode`, 'info')
  // }

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return

    // Add user message
    addMessage({
      type: 'user',
      author: 'You',
      text: messageText
    })

    // Check if connected
    if (!isConnected) {
      addMessage({
        type: 'assistant',
        author: 'MySQL Assistant',
        text: 'Please connect to a database first using the sidebar.'
      })
      return
    }

    // Check if table is selected and processed
    if (!currentTable) {
      addMessage({
        type: 'assistant',
        author: 'MySQL Assistant',
        text: 'Please select and process a table first. You can click "Load Tables" to see available tables in your database, then enter a table name and click "Process Table".'
      })
      return
    }

    setIsLoading(true)
    updateStatus('Processing your query...', 'info')

    try {
      const response = await axios.post(API_ENDPOINTS.QUERY, {
        question: messageText,
        table_name: currentTable
      }, { withCredentials: true })

      if (response.data.success) {
        const assistantMessage = {
          type: 'assistant',
          author: 'MySQL Assistant',
          text: response.data.ai_summary || 'Query completed successfully.'
        }

        // If there are results, add them to cache and include in message
        if (response.data.results && response.data.results.length > 0) {
          const resultId = Date.now().toString()
          resultsCache.current[resultId] = response.data.results
          assistantMessage.results = response.data.results
          assistantMessage.resultId = resultId
        }

        // If there's a SQL query, include it
        if (response.data.generated_query) {
          assistantMessage.sqlQuery = response.data.generated_query
        }

        // Add performance info if available
        if (response.data.performance) {
          assistantMessage.performance = response.data.performance
        }

        addMessage(assistantMessage)
        updateStatus('Query completed', 'success')
      } else {
        addMessage({
          type: 'assistant',
          author: 'MySQL Assistant',
          text: response.data.error || 'Sorry, I encountered an error processing your request.'
        })
        updateStatus('Query failed', 'error')
      }
    } catch (error) {
      console.error('Query error:', error)
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      addMessage({
        type: 'assistant',
        author: 'MySQL Assistant',
        text: errorMessage
      })
      updateStatus('Query failed', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = (resultId, filename = 'query_results') => {
    const results = resultsCache.current[resultId]
    if (!results || results.length === 0) return

    // Get headers
    const headers = Object.keys(results[0])
    
    // Build CSV content
    let csvContent = headers.join(',') + '\n'
    
    results.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      csvContent += values.join(',') + '\n'
    })
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addMessage({
      type: 'assistant',
      author: 'MySQL Assistant',
      text: 'I\'ve exported the data to CSV format for you. The download should start automatically.'
    })
  }

  const exportToJSON = (resultId, filename = 'query_results') => {
    const results = resultsCache.current[resultId]
    if (!results || results.length === 0) return
    
    // Create formatted JSON
    const jsonContent = JSON.stringify(results, null, 2)
    
    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addMessage({
      type: 'assistant',
      author: 'MySQL Assistant',
      text: 'I\'ve exported the data to JSON format for you. The download should start automatically.'
    })
  }

  return (
    <div className="main-content">
      <div className="main-header">
        <div className="header-left">
          {currentTable ? (
            <>
              <h1 className="main-title">
                <i className="fas fa-table" style={{ marginRight: '12px', fontSize: '24px' }}></i>
                {currentTable}
              </h1>
              <div className="current-table-info">
                <i className="fas fa-chart-line" style={{ marginRight: '6px' }}></i>
                Ask questions about your data in natural language
              </div>
            </>
          ) : isConnected ? (
            <>
              <h1 className="main-title">
                <i className="fas fa-server" style={{ marginRight: '12px', fontSize: '24px' }}></i>
                Database Ready
              </h1>
              <div className="current-table-info">
                <i className="fas fa-search" style={{ marginRight: '6px' }}></i>
                Choose a table to begin your data exploration
              </div>
            </>
          ) : (
            <>
              <h1 className="main-title">
                <i className="fas fa-brain" style={{ marginRight: '12px', fontSize: '24px' }}></i>
                Database Assistant
              </h1>
              <div className="current-table-info">
                <i className="fas fa-plug" style={{ marginRight: '6px' }}></i>
                Connect your database to unlock intelligent insights
              </div>
            </>
          )}
        </div>
        {/* <div className="header-right">
          <ChatToggle 
            options={chatModeOptions}
            onToggle={handleChatModeChange}
            defaultOption={0}
          />
        </div> */}
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onExportCSV={exportToCSV}
              onExportJSON={exportToJSON}
            />
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-wrapper">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="message-text">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

export default ChatArea 