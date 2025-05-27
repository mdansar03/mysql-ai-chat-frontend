const DataResults = ({ results, resultId, onExportCSV, onExportJSON }) => {
  const MAX_DISPLAY_RESULTS = 10

  const formatFieldValue = (field, value) => {
    // Format dates
    if (field.toLowerCase().includes('date') || field.toLowerCase().includes('_at')) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleString()
        }
      } catch {
        // If date parsing fails, return original value
      }
    }

    // Format UIDs and IDs
    if (field.toLowerCase().includes('uid') || field.toLowerCase().includes('id')) {
      return value
    }

    // Format status fields
    if (field.toLowerCase().includes('status') || field.toLowerCase().includes('is_')) {
      const statusValue = parseInt(value)
      const statusText = statusValue === 1 ? 'Yes' : 'No'
      return statusText
    }

    // Format boolean values
    if (typeof value === 'boolean' || value === '0' || value === '1') {
      const boolValue = value === true || value === '1'
      return boolValue ? 'Yes' : 'No'
    }

    // Default formatting
    return String(value)
  }

  const formatFieldName = (field) => {
    // Convert field name to display format
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const groupFieldsDynamically = (fields) => {
    const groups = {
      'Basic Information': [],
      'Contact Details': [],
      'Device Information': [],
      'Account Status': [],
      'Dates': [],
      'Identifiers': [],
      'Other': []
    }

    // Define field patterns for each group
    const patterns = {
      'Basic Information': ['name', 'user_name', 'product_name'],
      'Contact Details': ['email', 'phone', 'address', 'city'],
      'Device Information': ['device', 'os', 'type', 'ip'],
      'Account Status': ['status', 'signed_up', 'login', 'active'],
      'Dates': ['date', 'created', 'modified', 'expired'],
      'Identifiers': ['id', 'uid', 'code', 'token']
    }

    fields.forEach(([key, value]) => {
      let assigned = false
      
      // Try to match field to a group based on patterns
      for (const [group, groupPatterns] of Object.entries(patterns)) {
        if (groupPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
          groups[group].push([key, value])
          assigned = true
          break
        }
      }
      
      // If no group matched, add to Other
      if (!assigned) {
        groups['Other'].push([key, value])
      }
    })

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([, fields]) => fields.length > 0)
    )
  }

  if (!results || results.length === 0) {
    return null
  }

  const totalCount = results.length
  const displayCount = Math.min(totalCount, MAX_DISPLAY_RESULTS)

  return (
    <div className="data-results">
      <div className="data-header">
        <div className="data-title">
          Query Results ({totalCount} {totalCount === 1 ? 'result' : 'results'})
        </div>
        <div className="export-buttons">
          <button 
            className="export-btn" 
            onClick={() => onExportCSV(resultId)}
            title="Export to CSV"
          >
            <i className="fas fa-file-csv"></i> CSV
          </button>
          <button 
            className="export-btn" 
            onClick={() => onExportJSON(resultId)}
            title="Export to JSON"
          >
            <i className="fas fa-file-code"></i> JSON
          </button>
        </div>
      </div>

      {totalCount > displayCount && (
        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Showing first {displayCount} results. Use export buttons to get all data.
        </p>
      )}

      {/* Show results */}
      {results.slice(0, displayCount).map((result, index) => {
        const fields = Object.entries(result).filter(([, value]) => 
          value !== null && value !== undefined && value !== ''
        )
        const groupedFields = groupFieldsDynamically(fields)

        return (
          <div key={index} className="data-point">
            {Object.entries(groupedFields).map(([groupName, groupFields]) => (
              <div key={groupName} className="data-group">
                <div className="group-title">{groupName}</div>
                {groupFields.map(([field, value]) => (
                  <p key={field}>
                    <strong>{formatFieldName(field)}:</strong> {formatFieldValue(field, value)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )
      })}

      {results.length > displayCount && (
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          <em>...and {results.length - displayCount} more results. Use the export buttons above to get all data.</em>
        </p>
      )}
    </div>
  )
}

export default DataResults 