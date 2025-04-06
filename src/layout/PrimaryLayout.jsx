import React from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";

const PrimaryLayout = ({ children }) => {
  return (
    <div className="page-container">
      {/* nav */}

      <Nav />
      <div className="main-content">{children}</div>
      {/* footer */}
      <Footer />
    </div>
  );
};

export default PrimaryLayout;
