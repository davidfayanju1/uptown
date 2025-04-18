import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";

const Home = () => {
  return (
    <PrimaryLayout>
      <div className="page-container overflow-hidden mt-[5.6rem] min-h-screen">
        <section className="image-section bg-white flex items-center justify-center relative h-[40rem]">
          <div className="text-container absolute inset-0 h-full w-full flex flex-col items-center justify-center">
            <span className="block md:text-[1.4rem] text-[1.1rem] font-bold mx-auto text-center md:w-[50%] w-[80%] text-white mb-[2rem]">
              A statement piece, not an everyday cap. Crafted with precision.
              Released in rarity
            </span>

            <button className="rounded-full text-white w-[12rem] border-solid border-white border-[1px] px-2 py-3 flex items-center justify-center text-[.9rem]">
              Request Access
            </button>
          </div>
          <img
            src="/images/hero3.jpg"
            alt="hero-image"
            className="md:w-[50%] w-[90%] h-full object-cover object-top"
          />
        </section>
      </div>
    </PrimaryLayout>
  );
};

export default Home;
