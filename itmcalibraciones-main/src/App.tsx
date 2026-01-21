import { RouterProvider } from "react-router-dom";
import { router } from "./router/AppRouter";
import { AppTheme } from "./theme/AppTheme";
import "./App.css";

function App() {
  return (
    <AppTheme>
      <RouterProvider router={router} />
    </AppTheme>
  );
}

export default App;
