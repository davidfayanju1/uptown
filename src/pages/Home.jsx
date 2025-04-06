import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";

const Home = () => {
  return (
    <PrimaryLayout>
      <div className="page-container min-h-screen">
        <section className="image-section">
          <img
            src="/images/hero.jpg"
            alt="hero-image"
            className="h-[40rem] w-full object-cover object-top"
          />
        </section>
      </div>
    </PrimaryLayout>
  );
};

export default Home;
