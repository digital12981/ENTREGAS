import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Cadastro from "@/pages/Cadastro";
import Municipios from "@/pages/Municipios";
import Recebedor from "@/pages/Recebedor";
import Finalizacao from "@/pages/Finalizacao";
import Entrega from "@/pages/Entrega";
import { useAppContext } from "@/contexts/AppContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/municipios" component={Municipios} />
      <Route path="/recebedor" component={Recebedor} />
      <Route path="/finalizacao" component={Finalizacao} />
      <Route path="/entrega" component={Entrega} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;