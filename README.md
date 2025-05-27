# MySQL AI Assistant - React Frontend

This is the React frontend for the MySQL AI Assistant, built with Vite for fast development and optimized builds.

## Features

- **Modern React UI**: Built with React 18 and Vite for optimal performance
- **Database Connection Management**: Connect to MySQL databases with a user-friendly interface
- **Interactive Chat Interface**: Natural language queries with AI-powered responses
- **Data Visualization**: Smart formatting and grouping of query results
- **Export Functionality**: Export query results to CSV and JSON formats
- **Performance Settings**: Configure AI model settings for optimal performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Status Updates**: Live connection and query status indicators

## Prerequisites

- Node.js 16+ and npm
- MySQL AI Assistant backend running on port 5000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and will automatically proxy API calls to the Flask backend at `http://localhost:5000`.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Database connection and settings
│   ├── ChatArea.jsx         # Main chat interface
│   ├── Message.jsx          # Individual message display
│   ├── MessageInput.jsx     # User input component
│   ├── DataResults.jsx      # Query results display
│   └── SQLQuery.jsx         # SQL query display with copy
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
├── index.css                # Global styles
└── App.css                  # Component-specific styles
```

## Key Components

### Sidebar
- Database connection form
- Table selection interface
- Performance settings configuration
- Connection status display

### ChatArea
- Message history display
- Loading indicators
- Export functionality
- Auto-scrolling

### Message
- Formatted message display
- AI response formatting (markdown-like)
- SQL query integration
- Data results integration

### DataResults
- Smart field grouping
- Formatted data display
- Export buttons (CSV/JSON)
- Pagination for large datasets

## API Integration

The frontend communicates with the Flask backend through these endpoints:

- `POST /api/connect` - Database connection
- `POST /api/disconnect` - Database disconnection  
- `GET /api/connection_status` - Check connection status
- `GET /api/get_tables` - Fetch database tables
- `POST /api/process_table` - Process and analyze table schema
- `POST /api/query` - Send natural language queries
- `GET /api/performance_config` - Get performance settings
- `POST /api/performance_config` - Save performance settings

## Key Features

### Complete Flow Implementation
- **Database Connection**: Connect with host, port, username, password, database
- **Table Processing**: Select and process tables for AI analysis (required before querying)
- **Natural Language Queries**: Ask questions about your data in plain English
- **AI-Powered Responses**: Get intelligent summaries and insights
- **SQL Query Display**: See the generated SQL with copy functionality
- **Data Export**: Export results to CSV and JSON formats
- **Performance Monitoring**: View execution times and optimization suggestions

### Workflow
1. **Connect** to your MySQL database using the sidebar form
2. **Load Tables** to see available tables in your database
3. **Process Table** by entering a table name and clicking "Process Table"
4. **Query** your data using natural language in the chat interface
5. **Export** results and view performance information

## Styling

The application uses CSS custom properties (variables) for consistent theming:

- Modern color palette with primary, secondary, and semantic colors
- Responsive design with mobile-first approach
- Smooth animations and transitions
- FontAwesome icons for UI elements

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for React best practices
- Functional components with hooks
- Consistent naming conventions
- Modular component architecture

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include responsive design considerations
4. Test on multiple browsers
5. Update documentation as needed
