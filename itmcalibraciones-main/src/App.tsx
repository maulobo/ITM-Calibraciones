import { RouterProvider } from "react-router-dom";
import { router } from "./router/AppRouter";
import { AppTheme } from "./theme/AppTheme";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <AppTheme>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </AppTheme>
  );
}

export default App;
