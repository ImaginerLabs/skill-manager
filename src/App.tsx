import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import SkillBrowsePage from "./pages/SkillBrowsePage";
import WorkflowPage from "./pages/WorkflowPage";
import SyncPage from "./pages/SyncPage";
import ImportPage from "./pages/ImportPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

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
