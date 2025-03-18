
# Silvia Fang Rigetti Take Home Assessment

Check out the frontend design file [here](https://www.figma.com/design/2OIuS6N2AdTuLBHEOFCy2L/Silvia-Fang-Rigetti-Take-Home?node-id=1-2&t=72m3eP6DU7hF3NmJ-1)

## Description

This project is a full-stack application that displays and manages instrument data in real-time. It consists of a React frontend and a Python FastAPI backend, allowing users to view and interact with data in different modes: Dummy, Live, and Historical.

## Getting Started

### Dependencies

- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Installing

1. Clone the repository:

    ```zsh
    git clone https://github.com/verisorry/rigetti-takehome-2025.git
    cd rigetti-takehome-2025
    ```

2. Install backend dependencies:

    ```zsh
    cd backend
    pip install -r requirements.txt
    ```

3. Install frontend dependencies:

    ```zsh
    cd ../frontend
    npm install
    ```

### Executing program

1. Start the backend server:

    ```zsh
    cd backend
    python app.py
    ```

    This launches the FastAPI server on <http://localhost:8000>

2. Start the frontend development server:

    ```zsh
    cd ../frontend
    npm run dev
    ```

    This launches the Next.js development server on <http://localhost:3000>

3. Access the application by opening <http://localhost:3000> in your web browser

## Help

Common Issues

- WebSocket Connection Failures: If the live data mode isn't working, ensure your backend server is running and accessible. Check browser console for connection errors.
- Slow Compilation: The project may take time to compile initially due to its dependencies. Subsequent compilations should be faster due to caching.
- Component Styling Issues: If components appear unstyled, try refreshing the page or clearing your browser cache. The application uses Ant Design components which may have styling dependencies.

## Features

- Multiple Data Modes:
    - Dummy Mode: Displays static sample data
    - Live Mode: Real-time data updates via WebSockets
    - Historical Mode: Paginated historical data with filtering
- Interactive Dashboard:
    - Data visualization and filtering
    - Real-time updates
    - Pagination for historical data

## Project Structure

```plaintext
project-root/
├── frontend/                               # Next.js frontend application
│   ├── src/
│   │   ├── app/                            # Next.js app directory
│   │   │   ├── dashboard.tsx               # Main dashboard page
│   │   │   ├── WebSocketContext.tsx        # WebSocket connection manager
│   │   │   └── ...
│   │   └── components/                     # Reusable components
│   │       ├── dataTable.tsx               # Data table component
│   │       ├── button.tsx                  # Button component
│   │       └── filterChip.tsx              # Filter chip component
│   └── ...
└── backend/                                # Python FastAPI backend
    ├── app.py                              # Main API server
    └── data.json                           # Dummy data
```

## Authors

[@SilviaFang](mailto:fang.silvia@gmail.com)

## Version History

* 0.1
  * Initial release: basic functionality including dummy data and bonus functionality
  * See [commit change]() or See [release history]()

## License

This project is created as a take-home assessment for Rigetti Computing.
