import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DoubtsList from "./pages/DoubtsList";
import DoubtDetail from "./pages/DoubtDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateDoubt from "./pages/AdminCreateDoubt";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/doubts"} component={DoubtsList} />
      <Route path={"/doubt/:slug"} component={DoubtDetail} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/create"} component={AdminCreateDoubt} />
      <Route path={"/admin/edit/:id"} component={AdminCreateDoubt} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
