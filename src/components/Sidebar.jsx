import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import ThemeToggle from './ThemeToggle'

const Sidebar = ({
  isConnected,
  setIsConnected,
  connectionInfo,
  setConnectionInfo,
  tables,
  setTables,
  currentTable,
  setCurrentTable,
  updateStatus,
  status,
  addMessage,
  isMobileMenuOpen,
  closeMobileMenu
}) => {
  const [connectionForm, setConnectionForm] = useState({
    host: 'localhost',
    port: '3306',
    user: '',
    password: '',
    database: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [tableInput, setTableInput] = useState('')
  const [isProcessingTable, setIsProcessingTable] = useState(false)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [performanceSettings, setPerformanceSettings] = useState({
    useFasterModel: false,
    reduceAiContext: false,
    enableVectorSearch: true,
    enablePerformanceAnalysis: false
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Load performance settings on component mount
  useEffect(() => {
    loadPerformanceSettings()
  }, [])

  // Update table input when currentTable changes
  useEffect(() => {
    setTableInput(currentTable)
  }, [currentTable])

  const loadPerformanceSettings = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PERFORMANCE_CONFIG, {
        withCredentials: true
      })
      if (response.data) {
        setPerformanceSettings({
          useFasterModel: response.data.use_faster_model || false,
          reduceAiContext: response.data.reduce_ai_context || false,
          enableVectorSearch: response.data.enable_vector_search || true,
          enablePerformanceAnalysis: response.data.enable_performance_analysis || false
        })
      }
    } catch (error) {
      console.error('Error loading performance settings:', error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    updateStatus('Connecting to database...', 'info')

    try {
      const response = await axios.post(API_ENDPOINTS.CONNECT, connectionForm, {
        withCredentials: true
      })
      
      if (response.data.success) {
        setIsConnected(true)
        setConnectionInfo(connectionForm)
        updateStatus('Connected successfully', 'success')
        
        // Load tables
        await handleLoadTables()
      } else {
        updateStatus(response.data.error || 'Connection failed', 'error')
      }
    } catch (error) {
      updateStatus(error.response?.data?.error || 'Connection failed', 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await axios.post(API_ENDPOINTS.DISCONNECT, {}, {
        withCredentials: true
      })
      setIsConnected(false)
      setConnectionInfo(null)
      setTables([])
      setCurrentTable('')
      setTableInput('')
      updateStatus('Disconnected', 'info')
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  const handleLoadTables = async () => {
    setIsLoadingTables(true)
    updateStatus('Loading tables...', 'info')

    try {
      const response = await axios.get(API_ENDPOINTS.GET_TABLES, {
        withCredentials: true
      })
      if (response.data && response.data.tables) {
        setTables(response.data.tables)
        updateStatus('Tables loaded successfully', 'success')
      } else {
        updateStatus(response.data.error || 'Failed to load tables', 'error')
      }
    } catch (error) {
      console.error('Error loading tables:', error)
      updateStatus('Failed to load tables', 'error')
    } finally {
      setIsLoadingTables(false)
    }
  }

  const handleTableSelect = (tableName) => {
    setCurrentTable(tableName)
    setTableInput(tableName)
  }

  const handleProcessTable = async () => {
    const tableName = tableInput.trim()
    
    if (!tableName) {
      updateStatus('Please enter a table name', 'error')
      return
    }

    setIsProcessingTable(true)
    updateStatus('Processing table...', 'info')

    try {
      const response = await axios.post(API_ENDPOINTS.PROCESS_TABLE, {
        table_name: tableName
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        setCurrentTable(tableName)
        updateStatus(`Table "${tableName}" processed successfully`, 'success')
        
        // Add assistant message
        addMessage({
          type: 'assistant',
          author: 'MySQL Assistant',
          text: `Great! I've analyzed the <strong>${tableName}</strong> table and I'm ready to help you explore your data. Feel free to ask me anything about the information stored in this table.`
        })
      } else {
        updateStatus(response.data.error || 'Failed to process table', 'error')
        
        // Add error message
        addMessage({
          type: 'assistant',
          author: 'MySQL Assistant',
          text: `I encountered an issue while processing the <strong>${tableName}</strong> table. ${response.data.error || 'Please check if the table exists and try again.'}`
        })
      }
    } catch (error) {
      console.error('Error processing table:', error)
      updateStatus('Error processing table', 'error')
      
      // Add error message
      addMessage({
        type: 'assistant',
        author: 'MySQL Assistant',
        text: 'I\'m having trouble connecting to the database. Please check your connection and try again.'
      })
    } finally {
      setIsProcessingTable(false)
    }
  }

  const savePerformanceSettings = async () => {
    setIsSavingSettings(true)

    try {
      const settings = {
        use_faster_model: performanceSettings.useFasterModel,
        reduce_ai_context: performanceSettings.reduceAiContext,
        enable_vector_search: performanceSettings.enableVectorSearch,
        enable_performance_analysis: performanceSettings.enablePerformanceAnalysis,
        max_retries: 1
      }

      const response = await axios.post(API_ENDPOINTS.PERFORMANCE_CONFIG, settings, {
        withCredentials: true
      })

      if (response.data.success) {
        updateStatus('Performance settings saved', 'success')
      } else {
        updateStatus('Failed to save settings', 'error')
      }
    } catch (error) {
      console.error('Error saving performance settings:', error)
      updateStatus('Error saving settings', 'error')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleTableInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProcessTable()
    }
  }

  return (
    <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-database"></i>
          MySQL Assistant
        </div>
        <button 
          className="sidebar-close-btn"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <i className="fas fa-times"></i>
        </button>
        <ThemeToggle />
      </div>

      <div className="sidebar-content">
        {/* Connection Form */}
        <div className="sidebar-section connection-form">
          <h3 className="section-title">Database Connection</h3>
          
          <div className="form-group">
            <label className="form-label">Host</label>
            <input
              type="text"
              className="form-input"
              value={connectionForm.host}
              onChange={(e) => setConnectionForm(prev => ({ ...prev, host: e.target.value }))}
              placeholder="localhost"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Port</label>
            <input
              type="text"
              className="form-input"
              value={connectionForm.port}
              onChange={(e) => setConnectionForm(prev => ({ ...prev, port: e.target.value }))}
              placeholder="3306"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={connectionForm.user}
              onChange={(e) => setConnectionForm(prev => ({ ...prev, user: e.target.value }))}
              placeholder="root"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={connectionForm.password}
              onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Database</label>
            <input
              type="text"
              className="form-input"
              value={connectionForm.database}
              onChange={(e) => setConnectionForm(prev => ({ ...prev, database: e.target.value }))}
              placeholder="Database name"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Connecting...
              </>
            ) : (
              <>
                <i className="fas fa-plug"></i>
                Connect
              </>
            )}
          </button>
        </div>

        {/* Connection Info */}
        {isConnected && connectionInfo && (
          <div className="sidebar-section connection-required">
            <h3 className="section-title">Connection Info</h3>
            <div className="connection-info">
              <strong>Connected to:</strong><br />
              {connectionInfo.host}:{connectionInfo.port}<br />
              Database: {connectionInfo.database}
            </div>
            <button className="btn btn-danger" onClick={handleDisconnect}>
              <i className="fas fa-times"></i>
              Disconnect
            </button>
          </div>
        )}

        {/* Table Setup */}
        {isConnected && (
          <div className="sidebar-section connection-required">
            <h3 className="section-title">Table Setup</h3>
            
            <div className="form-group">
              <label className="form-label">Table Name</label>
              <input
                type="text"
                className="form-input"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                onKeyPress={handleTableInputKeyPress}
                placeholder="Enter table name"
              />
            </div>

            <div className="form-group">
              <button
                className="btn btn-primary"
                onClick={handleProcessTable}
                disabled={isProcessingTable}
              >
                {isProcessingTable ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cog"></i>
                    Process Table
                  </>
                )}
              </button>
            </div>

            <div className="form-group">
              <button
                className="btn btn-secondary"
                onClick={handleLoadTables}
                disabled={isLoadingTables}
              >
                {isLoadingTables ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt"></i>
                    Load Tables
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tables List */}
        {isConnected && tables.length > 0 && (
          <div className="sidebar-section connection-required">
            <h3 className="section-title">Tables ({tables.length})</h3>
            <div className="tables-list">
              {tables.map((table) => (
                <div
                  key={table}
                  className={`table-item ${currentTable === table ? 'selected' : ''}`}
                  onClick={() => handleTableSelect(table)}
                >
                  <i className="fas fa-table"></i>
                  <span className="table-item-name">{table}</span>
                </div>
              ))}
            </div>
            {currentTable && (
              <div className="selected-table-info">
                <i className="fas fa-check-circle"></i>
                Selected: {currentTable}
              </div>
            )}
          </div>
        )}

        {/* Empty state for tables */}
        {isConnected && tables.length === 0 && (
          <div className="sidebar-section connection-required">
            <h3 className="section-title">Tables</h3>
            <div className="tables-list-empty">
              <i className="fas fa-table"></i>
              No tables found. Click "Load Tables" to refresh.
            </div>
          </div>
        )}

        {/* Performance Settings */}
        <div className="sidebar-section">
          <h3 className="section-title">Performance Settings</h3>
          
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={performanceSettings.useFasterModel}
                onChange={(e) => setPerformanceSettings(prev => ({ 
                  ...prev, 
                  useFasterModel: e.target.checked 
                }))}
              />
              Use Faster Model
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={performanceSettings.reduceAiContext}
                onChange={(e) => setPerformanceSettings(prev => ({ 
                  ...prev, 
                  reduceAiContext: e.target.checked 
                }))}
              />
              Reduce AI Context
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={performanceSettings.enableVectorSearch}
                onChange={(e) => setPerformanceSettings(prev => ({ 
                  ...prev, 
                  enableVectorSearch: e.target.checked 
                }))}
              />
              Enable Vector Search
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={performanceSettings.enablePerformanceAnalysis}
                onChange={(e) => setPerformanceSettings(prev => ({ 
                  ...prev, 
                  enablePerformanceAnalysis: e.target.checked 
                }))}
              />
              Enable Performance Analysis
            </label>
          </div>

          <button
            className="btn btn-secondary"
            onClick={savePerformanceSettings}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Status */}
        <div className="sidebar-section">
          <div className={`status-badge status-${status.type}`}>
            <i className={`fas fa-${status.type === 'success' ? 'check-circle' : status.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
            {status.message}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 