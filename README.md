# Optiplanner

Optiplanner is a project management software built with React and Vite. It provides a minimal setup to get React working in Vite with Hot Module Replacement (HMR) and some ESLint rules. The application includes various features such as drag-and-drop functionality, chart rendering, and Firebase integration.

## Features

- **React**: A JavaScript library for building user interfaces.
- **Vite**: A fast build tool and development server.
- **Firebase**: A BaaS-platform for building web and mobile applications.
- **Drag-and-Drop**: Implemented using `react-beautiful-dnd`.
- **Routing**: Implemented using `react-router-dom`.
- **@xyflow/react & react-flow-renderer**: used for making Critical Path Method.

### Prerequisites

- Node.js (version 16 or higher)
- Docker (for containerization)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/nuksnuks/optiplanner.git
   cd optiplanner
   ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a .env file in the root directory and add your Firebase configuration:

    ```sh
    VITE_API_KEY=your_api_key
    VITE_AUTH_DOMAIN=your_auth_domain
    VITE_DATABASE_URL=your_database_url
    VITE_PROJECT_ID=your_project_id
    VITE_STORAGE_BUCKET=your_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_APP_ID=your_app_id
    VITE_MEASUREMENT_ID=your_measurement_id
    ```

### Development

1. Start the development server with Hot Module Replacement (HMR):

    ```sh
    npm run dev
    ```

### Build & Deploy

1. Obtain a Firebase authentication token:

    - Install the Firebase CLI if you haven't already:

        ```sh
        npm install -g firebase-tools
        ```

    - Log in to Firebase:

        ```sh
        firebase login
        ```

    - Get the Firebase token:

        ```sh
        firebase login:ci
        ```

    - Copy the token provided by the command and add it to your GitHub repository secrets as `FIREBASE_TOKEN`.

3. A GitHub workflow has been set up to automate the deployment of the project to Firebase. When changes are pushed to the master branch, the build and deploy process begins automatically.