import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar.jsx";
import { Footer } from "@/components/layout/Footer.jsx";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { Home } from "@/pages/Home.jsx";
import { Convert } from "@/pages/Convert.jsx";
import { Trends } from "@/pages/Trends.jsx";
import { Budget } from "@/pages/Budget.jsx";
import { FavoritesPage } from "@/pages/FavoritesPage.jsx";
import { Showcase } from "@/pages/Showcase.jsx";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { backendDown } = useCurrencies();

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <ScrollTop />
      <Navbar backendDown={backendDown} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
