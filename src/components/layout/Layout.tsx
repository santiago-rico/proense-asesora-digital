import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SkipLinks from "@/components/shared/SkipLinks";

interface LayoutProps {
  children: React.ReactNode;
  handleOpenLeadDialog: () => void;
}

function Layout({ children, handleOpenLeadDialog }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipLinks />
      <Navbar handleOpenLeadDialog={handleOpenLeadDialog} />
      <main id="main-content" className="flex-grow pt-16" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
