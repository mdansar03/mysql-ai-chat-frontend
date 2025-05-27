import { useState, useEffect, useRef } from 'react'

const ChatToggle = ({ options, onToggle, defaultOption = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(defaultOption)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const toggleRef = useRef(null)
  const optionRefs = useRef([])

  useEffect(() => {
    updateIndicatorPosition()
  }, [activeIndex])

  useEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateIndicatorPosition = () => {
    if (optionRefs.current[activeIndex] && toggleRef.current) {
      const activeOption = optionRefs.current[activeIndex]
      
      const left = activeOption.offsetLeft
      const width = activeOption.offsetWidth
      
      setIndicatorStyle({
        left: `${left}px`,
        width: `${width}px`,
        transform: 'translateX(0)',
        opacity: 1
      })
    }
  }

  const handleOptionClick = (index, option) => {
    if (index !== activeIndex) {
      setActiveIndex(index)
      onToggle(option)
    }
  }

  return (
    <div className="chat-toggle-container">
      <div className="chat-toggle" ref={toggleRef}>
        <div 
          className="toggle-indicator" 
          style={indicatorStyle}
        />
        {options.map((option, index) => (
          <button
            key={index}
            ref={el => optionRefs.current[index] = el}
            className={`toggle-option ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleOptionClick(index, option)}
            type="button"
            aria-pressed={index === activeIndex}
            title={`Switch to ${option.label} mode`}
          >
            <i className={`fas ${option.icon}`}></i>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatToggle 