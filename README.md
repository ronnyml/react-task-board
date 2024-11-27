# Collaborative Task Board Real-time App

A real-time collaborative task board application that allows multiple users to manage tasks in columns such as "To Do," "In Progress," and "Done." 

- Users can drag and drop tasks between columns, add new tasks, and see which tasks are being edited by others in real-time. Creating, editing, deleting, and moving tasks between columns: “To Do”, “In Progress”, “Done”.
- View changes in real-time when multiple users interact with the board.
- Display the presence of other connected users and highlighting which task they are editing or moving at the moment.

The project uses a React-based TypeScript frontend with Tailwind CSS for styling and a Node.js server using Socket.io for real-time communication.

## Code Structure

The project structure follows a modular approach for better scalability and maintainability. Below is an overview of the key folders:

- **src**: The root of the project containing all source code.
  - **components**: Contains all UI components used in the app. This helps in breaking down the user interface into reusable parts, making the code more readable and maintainable.
  - **config**: Stores configuration settings such as server URLs, allowing for easy updates and centralized management of configuration values.
  - **contexts**: Manages global state using React Context API, which makes it easier to share state across components without prop drilling.
  - **hooks**: Contains custom hooks that encapsulate reusable logic, enhancing code reusability and readability.
  - **interfaces**: Defines TypeScript interfaces for type safety, ensuring that the data structures used across the project are consistent and reducing the chances of runtime errors.
  - **server**: Contains the backend code using Node.js and Socket.io to manage server-client interactions, ensuring the app’s real-time capabilities.
  - **styles**: Contains the styling files, which makes it easy to manage and update styles consistently across the application.
  - **main.tsx**: Entry point of the client-side application where the root component is rendered.
  - **vite-env.d.ts**: Environment types definition for Vite.

### Code Organization and structure

- **Modularization**: The codebase is divided into separate modules (components, contexts, hooks, etc.) to make it easier to manage, maintain, and scale. Each folder has a specific purpose, reducing complexity and improving readability.
- **Reusability**: By using components and custom hooks, the code becomes more reusable, allowing common functionality to be shared across the application.
- **Scalability**: This structure supports future growth by making it easy to add new features without significantly impacting existing code.
- **Separation of Concerns**: Each module has a distinct responsibility, which leads to a cleaner and more organized codebase. For example, UI logic is separated from state management and configuration settings, making debugging and maintenance easier.

## Code Decisions

- **State Management**: The app uses React Context API and hooks to manage the state of tasks, editing users, and connected users. The context is provided globally so that different components can easily access and modify the state.
- **Real-time Features**: Socket.io is used to handle real-time communication between the server and the client. This allows multiple users to collaborate on the task board seamlessly.
- **Drag and Drop**: The `@hello-pangea/dnd` library is used to provide drag-and-drop functionality. This library is highly customizable and integrates well with React.

## Libraries Used

### Client-side

- **React**: The main JavaScript library used for building the user interface.
- **Tailwind CSS**: A utility-first CSS framework that provides a quick way to style the UI with predefined classes.
- **@hello-pangea/dnd**: A drag-and-drop library that enables task movement between columns.
- **Jest**: A JavaScript testing framework used for unit testing React components.

### Server-side

- **Express**: A web application framework for Node.js used to create the server.
- **Socket.io**: A library for real-time web applications used to handle WebSocket connections between clients and the server.

## Installation

Follow these steps to get the app running locally:

1. **Install dependencies**:

   ```sh
   npm install
   ```

2. **Set up environment variables**:

   - Create a `.env` file in the root of the project in case you don't have the .env file.
   - Add the server URL:
     ```
     VITE_SERVER_URL=http://localhost:3000
     ```

3. **Run the client-side application**:

   ```sh
   npm run dev
   ```

4. **Run the server**:

   ```sh
   npm run server
   ```

## Running Tests

Unit tests are provided for key components and context. To run the tests, use:

```sh
npm run test
```

The tests are implemented using Jest and focus on ensuring that core features, such as task editing and drag-and-drop, function as expected.

## Key Features

- **Real-time Collaboration**: Users can see updates made by others in real-time, including task movement and editing.
- **Drag-and-Drop Interface**: Users can easily move tasks between columns.
- **Task Editing Awareness**: When another user is editing a task, it is highlighted to prevent conflicting edits.

## Technologies Used

- **Frontend**: React, Tailwind CSS, Socket.io client, Vite
- **Backend**: Node.js, Express, Socket.io
- **Testing**: Jest, React Testing Library
