import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}`}></i>
          </div>
        </div>
        <span className="toggle-label">
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
      </button>
    </div>
  )
}

export default ThemeToggle 