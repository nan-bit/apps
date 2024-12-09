import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { Reader } from "./pages/Reader";

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/read/:id" component={Reader} />
          <Route>404 Page Not Found</Route>
        </Switch>
        <Toaster />
      </QueryClientProvider>
    </StrictMode>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
