import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.js";
import { Toaster } from "@/components/ui/toaster.js";
import { I18nProvider } from "@/lib/i18n/index.js";
import NotFound from "@/pages/not-found.js";
import Home from "@/pages/Home.js";
import About from "@/pages/About.js";
import Services from "@/pages/Services.js";
import Contact from "@/pages/Contact.js";
import Investors from "@/pages/Investors.js";
import PrivacyPolicy from "@/pages/PrivacyPolicy.js";
import Navbar from "@/components/layout/Navbar.js";
import Footer from "@/components/layout/Footer.js";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/contact" component={Contact} />
          <Route path="/investors" component={Investors} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Router />
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;