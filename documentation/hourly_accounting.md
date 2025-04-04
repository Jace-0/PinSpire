# Working time records

|  Day   | Time(hours) | What i did                                                                                                                                                                                                                                                                                                                                             |
| :----: | :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.28. | 13          | Conducted research on Pinterest, its technologies, and core functionalities. Designed database schema and selected appropriate tech stacks. Configured PostgreSQL database for user data storage. Deployed Redis on Docker and reviewed documentation for Redis session management and caching to ensure efficient data retrieval and user experience. |
| 12.29. | 6           | Developed endpoints for user creation and thoroughly tested them. Set up the React frontend, installed necessary dependencies, and configured ESLint and Nginx for serving the build.                                                                                                                                                                  |
| 12.30. | 15          | Developed user registration and authentication pages, studied the proper utilization of the Context API for state management, created a user profile page, designed a navigation bar, and configured route handling using react-router-dom.                                                                                                            |
| 12.31. | 14          | Implemented comprehensive user interface components including:                                                                                                                                                                                                                                                                                         |

                - Designed and developed the user profile dashboard
                - Created an intuitive profile editing interface
                - Constructed a responsive landing page with modern aesthetics
                - Built a Pinterest-style home feed with masonry layout
                - Developed an interactive pin details page with social features |

| 1.1. | 10 | Implemented token refresh functionality and integrated error notifications using Material-UI. Developed backend mechanisms for user data caching and conducted thorough testing to ensure their efficacy. |

| 1.2. | 10 | Implemented notification update for the editProfile feature. Created Database models and migrations for pins, boards, followers, likes, comments, and comment replies. Additionally, restructured the models using class-based structures. |

| 1.3. | 8 | Implemented profile photo update functionality using Cloudinary and Multer. Developed and integrated an endpoint for pin creation. |

| 1.5. | 11 | Created endpoints for creating and retrieving pins, including functionality to post a pin with image uploads using multer. Implemented infinite scroll on the frontend to dynamically load pins as the user scrolls, utilizing cursor-based pagination for efficient data retrieval. Integrated Redis caching to optimize performance and reduce database load. |

| 1.6. | 13 | Enhance pin details view with like and comment functionality |

            - Implemented detailed view for individual pins
            - Added functionality to like and unlike pins
            - Integrated comment section with add and display features
            - Styled pin details page to match Pinterest aesthetics
            - Improved user interaction with dynamic updates for likes and comments
            - Ensured seamless navigation from pin feed to pin details |

| 1.8 - 9 | 16 | Enhance comment interaction and optimize Redis caching |

            - Implement functionality to like and reply to comments
            - Improve state management for comment interactions
            - Optimize Redis caching with metadata for efficient data retrieval
            - Simplify response structure for consistent API responses
            |

| 1.10 | 6 | implement user profile and follow system |

            - Add user profile functionality with different views for own/other profiles
            - Implement follow/unfollow system with database relationships
            - Add follower and following count display
            - Include profile statistics and bio section
            - Add notification system for follow events
            |

| 1.11 | 6 | implement user profile pin discovery and navigation |

            - Add dynamic pin viewing based on URL username parameter
            - Implement tab system for viewing created pins
            - Add profile-specific pin grid layout
            - Handle loading and empty states for pin discovery
            - Support viewing both own and other users' created pins

            Technical changes:
            - Add URL parameter handling for username-based navigation
            - Implement pin fetching based on user context
            - Add proper state management for pin loading
            - Implement responsive grid layout for pins display

            UI/UX:
            - Add loading spinner for pin fetching
            - Implement empty state messaging
            - Add responsive grid layout for pins
            - Maintain consistent Pinterest-style layout

            Testing:
            - Verify pin loading for different users
            - Test URL parameter handling
            - Validate grid layout across screen sizes
            |

| 1.12 | 4 | implement secure user logout and session management |

            - Add logout functionality with proper session cleanup
            - Implement navigation handling for authenticated states
            - Add visual logout indicator in navigation sidebar

            Technical changes:
            - Add sessionStorage cleanup on logout
            - Implement proper state management in AuthContext
            - Add conditional routing based on authentication state
            - Handle auth state transitions during logout
            |

| 1.13-14 | 13 | Implemented WebSocket support for enhanced notifications |

            - Utilized the `ws` WebSocket library for Node.js
            - Set up WebSocket for backend and frontend notifications

            **Technical Details:**

            Backend:
            - Configured secure WebSocket server using `ws`
            - Managed connection lifecycle (connect, disconnect, error handling)

            Client:
            - Managed WebSocket connections with automatic reconnection
            - Implemented heartbeat mechanism
            - Developed message handlers for various notifications

            UI Components:
            - Added notification indicator in the sidebar
            - Enabled real-time status updates
            - Implemented visual logout indicator
            - Integrated toast notifications for key events

            Dependencies:
            - `ws` WebSocket library for Node.js
            - Frontend WebSocket client
            - UI components for notifications
            - Authentication integration

| 1.14 | 6 | Resolved stacking context issue to ensure notifications appear above other elements |

| 1.21-27 (1week)| 56 | implement real-time messaging system with ws WebSocket NodeJS Library

            Implementations:
            - Created Chat and Message database models with migrations and API endpoints
            - Created Chat and Message database models and migrations
            - Implemented chat controllers and routes

            - Implement real-time message send/receive functionality
            - Added WebSocket message event listeners
            - Implemented message handling logic
            - refactor(websocket):
                - Restructured WebSocket client code
                - Added WebSocket connection manager
                - integrate WebSocket with ChatContext
                - implemeneted WebSocket message handling in ChatContext
                - TODO: Improve design structure

            - Add chat UI components and message display
            - implemented pinterest -style like chat UI,
            - implemented functionality to start a new message
                - allows user to search and select other users you want to send message to

            - Set up auto-scroll behavior for message history
                - Implemented smart scroll behavior for message history
                - TODO: needs improvement

            - Implemented new tab for viewing liked pins on User Profile Page
            - Added UI for displaying liked pins collection

            - Moved storage from render.io to supabase

|

| 1.30-3 | 32 | Implemented Integration Testing on the Backend using Supertest and Node.js Test Module

    Implementations:
    - Created an isolated testing environment in Docker
    - Improved error handling

    User Management & Social Features Integration Tests:
    - Authentication
    - Profile Operations
    - Follow Relationships and Notifications
    - WebSocket Communications
    - Integration Tests for Pin Management, Social Interaction Features & Notifications

    Pin Management Integration Tests:
    - Pin Creation and Validation
    - Pin Update Operations
    - Pin Deletion and Cleanup

    Social Interactions:
    - Pin Likes/Unlikes
    - Comment Operations
        - Adding Comments
        - Editing Comments
        - Nested Replies4

| 2.4-5-6-7 | 25 | Frontend Component Testing Implementation with Jest and React Testing Library

    Test Coverage Implementation:
    - Login Form Testing
    - Signup Form Testing
    - Pin Creation Testing
    - Profile Page Testing

|

| 2.18-23 | 43 | E2E Testing Implementation with Playwright

    Test Implementation Details:

    Authentication Flows
    - Home page navigation and interactions
    - User registration process
    - Login functionality verification
    - Logout flow validation
    - Profile management testing
    - Profile editing capabilities

    Social Features Testing
    - Follow/Unfollow functionality
    - Real-time messaging system
    - User search functionality
    - Notification system integration

    Content Management
    - Pin creation tool validation
    - Pin feed interaction testing
    - Content interaction features:
    - Like functionality
    - Comment system
    - Reply mechanism
    - Notification triggers

    Additional Feature Implementations

    Real-time Features
    - Message notification system
    - Enhanced user search functionality

    Technical Improvements
    - Route persistence implementation
    - SessionStorage integration
    - Authentication state handling
    - User location preservation
    - Login redirect optimization

    UI Enhancements
    - CSS layout improvements
    - Visual consistency updates

|
| 24 | 1 | Configure custom webpack build for React app

    Implementation Details:
    - Add automatic JSX runtime to support new React transform
    - Configure CopyWebpackPlugin for static assets and manifest
    - Add proper environment variable handling with dotenv-webpack
    - Set up webpack-dev-server with hot reloading for development
    - Optimize babel loader configuration for JSX/JS processing

|
| 3 | 3 | flat threaded comment system with mentions

    Implementation Details:
    - Add recursive CTE query for infinite nested replies
    - Implement @username mentions in comments and replies
    - Maintain chronological ordering within reply threads
    - Include like counts for all comments and replies
    - Add depth tracking for visual thread hierarchy

    Changes:
    - Comment structure changed from nested to flat array
    - Reply queries now use recursive CTE instead of joins
    - fix bugs

|
| 3-6 | 20 | Implemented comprehensive board functionality

    Added complete Pinterest-style board management:
    - Create boards when adding new pins
    - View all boards in dedicated profile tab
    - View individual board contents with pin grid
    - Support direct URL navigation to specific boards
    - Add download capability for pins on detail page
    - Implement save-to-board functionality on pin details
    - Improve board data model for better performance
    - Create dedicated API routes and controllers
    - Implement responsive UI with proper error handling

    This completes the core social saving functionality, allowing users to organize pins into collections.

|
| 7 | 2 | CICD setup

    Implementation:
     - Frontend CI
     - Backend CI
     - E2E-TEST CI
     - discord Notification and version tag

|

| Total | null |
