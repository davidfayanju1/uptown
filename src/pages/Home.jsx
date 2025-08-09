import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <PrimaryLayout>
      <div className="page-container bg-black  overflow-hidden mt-[5.6rem] min-h-[47rem]">
        <section className="image-section bg-gray-100 flex items-center justify-center relative h-[50rem]">
          <div className="text-container absolute inset-0 bg-black/20 h-full w-full flex flex-col items-center justify-center">
            <span className="block md:text-[1.4rem] text-[1.1rem] font-bold mx-auto text-center md:w-[50%] w-[80%] text-white mb-[2rem]">
              A statement piece, not an everyday cap. Crafted with precision.
              Released in rarity
            </span>

            <button
              onClick={() => navigate("/explore")}
              className="rounded-full text-black cursor-pointer w-[10rem] bg-white border-none outline-none px-2 py-3 flex items-center justify-center text-[.9rem]"
            >
              Explore
            </button>
          </div>
          <img
            src="/images/hero5.jpg"
            alt="hero-image"
            className="md:w-[50%] w-[95%] h-full object-cover object-top"
          />
        </section>
      </div>
    </PrimaryLayout>
  );
};

export default Home;
