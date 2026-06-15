import React from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";

const PrimaryLayout = ({ children, fitScreen = false }) => {
  return (
    <div
      className={
        fitScreen
          ? "flex flex-col overflow-hidden h-screen md:h-auto md:overflow-visible"
          : "page-container"
      }
    >
      {/* nav */}
      <Nav />
      <div className={fitScreen ? "flex-1 min-h-0 overflow-hidden" : "main-content"}>
        {children}
      </div>
      {/* footer */}
      <Footer />
    </div>
  );
};

export default PrimaryLayout;
