import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ImportPage from "./pages/import";
import NotFound from "./pages/NotFound";
import PathsPage from "./pages/PathsPage";
import SettingsPage from "./pages/SettingsPage";
import SkillBrowsePage from "./pages/SkillBrowsePage";
import SyncPage from "./pages/SyncPage";
import WorkflowPage from "./pages/WorkflowPage";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <SkillBrowsePage />,
      },
      {
        path: "/workflow",
        element: <WorkflowPage />,
      },
      {
        path: "/sync",
        element: <SyncPage />,
      },
      {
        path: "/import",
        element: <ImportPage />,
      },
      {
        path: "/paths",
        element: <PathsPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
