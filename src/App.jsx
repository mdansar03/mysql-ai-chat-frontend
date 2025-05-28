import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { API_ENDPOINTS } from './config/api'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionInfo, setConnectionInfo] = useState(null)
  const [tables, setTables] = useState([])
  const [currentTable, setCurrentTable] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState({ message: 'Ready to connect', type: 'info' })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add initial welcome message
  useEffect(() => {
    setMessages([{
      id: 1,
      type: 'assistant',
      author: 'MySQL Assistant',
      text: 'Hello! I\'m your MySQL AI Assistant. Connect to your database using the sidebar, and I\'ll help you query and analyze your data using natural language.',
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [])

  // Check connection status on app load
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  // Handle mobile menu close on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CONNECTION_STATUS, {
        withCredentials: true
      })
      const data = response.data
      
      if (data.connected) {
        setIsConnected(true)
        setConnectionInfo({ database: data.database })
        updateStatus(`Connected to ${data.database}`, 'success')
        // Load tables if connected
        loadTables()
      } else {
        setIsConnected(false)
        setConnectionInfo(null)
        updateStatus('Not connected', 'info')
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      setIsConnected(false)
      setConnectionInfo(null)
      updateStatus('Connection check failed', 'error')
    }
  }

  const loadTables = async () => {
    try {
      console.log('App: Attempting to load tables...')
      const response = await axios.get(API_ENDPOINTS.GET_TABLES, {
        withCredentials: true
      })
      const data = response.data
      
      console.log('App: Tables response:', response.status, data)
      
      if (response.status === 200 && data.tables) {
        setTables(data.tables)
        console.log('App: Tables loaded successfully:', data.tables)
      } else {
        console.error('App: Failed to load tables:', data.error)
        updateStatus(data.error || 'Failed to load tables', 'error')
      }
    } catch (error) {
      console.error('App: Error loading tables:', error)
      console.error('App: Error response:', error.response?.data)
      console.error('App: Error status:', error.response?.status)
      
      if (error.response?.status === 401) {
        updateStatus('Authentication required. Please check your database connection.', 'error')
      } else {
        updateStatus('Failed to load tables', 'error')
      }
    }
  }

  const addMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...message
    }
    setMessages(prev => [...prev, newMessage])
  }

  const updateStatus = (message, type) => {
    setStatus({ message, type })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <ThemeProvider>
      <div className={`app-container ${isConnected ? 'connected' : ''}`}>
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Mobile Overlay */}
        <div 
          className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        ></div>

        <Sidebar
          isConnected={isConnected}
          setIsConnected={setIsConnected}
          connectionInfo={connectionInfo}
          setConnectionInfo={setConnectionInfo}
          tables={tables}
          setTables={setTables}
          currentTable={currentTable}
          setCurrentTable={setCurrentTable}
          updateStatus={updateStatus}
          status={status}
          addMessage={addMessage}
          isMobileMenuOpen={isMobileMenuOpen}
          closeMobileMenu={closeMobileMenu}
        />
        <ChatArea
          messages={messages}
          addMessage={addMessage}
          isConnected={isConnected}
          currentTable={currentTable}
          updateStatus={updateStatus}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
