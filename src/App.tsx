import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Report from "./pages/Report.tsx";
import CaseStudy from "./pages/CaseStudy.tsx";
import Osmosis from "./pages/Osmosis.tsx";
import GetStarted from "./pages/GetStarted.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import Summary from "./pages/Summary.tsx";
import Admin from "./pages/Admin.tsx";
import Methodology from "./pages/Methodology.tsx";
import Reviews from "./pages/Reviews.tsx";
import Privacy from "./pages/Privacy.tsx";
import DemandIntake from "./pages/DemandIntake.tsx";
import DemandPreview from "./pages/DemandPreview.tsx";
import NotFound from "./pages/NotFound.tsx";
import { ScanProvider } from "./contexts/ScanContext.tsx";
const queryClient = new QueryClient({});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <ScanProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/report" element={<Report />} />
            <Route path="/case-study" element={<CaseStudy />} />
            <Route path="/osmosis" element={<Osmosis />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/demand-intake" element={<DemandIntake />} />
            <Route path="/demand-preview" element={<DemandPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScanProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
