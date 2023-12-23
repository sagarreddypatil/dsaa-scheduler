import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import TaskList from "./pages/task-list.tsx";
import Task from "./pages/task.tsx";
import CreateTask from "./pages/create-task.tsx";
import Login from "./Login.tsx";
import ApiToken from "./pages/api-token.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <TaskList />,
      },
      {
        path: "/task/idle",
        element: <TaskList />,
      },
      {
        path: "/task/:id",
        element: <Task />,
      },
      {
        path: "/create",
        element: <CreateTask />,
      },
      {
        path: "/token",
        element: <ApiToken />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
