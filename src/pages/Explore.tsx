import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useNavigate } from "react-router-dom";

const Explore = () => {
  const navigate = useNavigate();

  return (
    <PrimaryLayout>
      {/* Fixed Background Container */}
      <div className="fixed inset-0 -z-10">
        <div className="relative h-full w-full">
          <img
            src="/images/product5.jpg" // Your hero image
            alt="Background"
            className="h-full w-full object-cover opacity-20" // Adjust opacity as needed
          />
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 mx-auto max-w-[74rem] mt-[3rem] relative bg-white bg-opacity-90">
        {/* First Flex Container - Image on Right */}
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16 mb-16">
          <div className="md:w-1/2">
            <h2 className="md:text-4xl text-2xl font-bold mb-6 tracking-tight">
              ENGINEERED FOR <span className="text-primary">PERFORMANCE</span>
            </h2>
            <p className="md:text-lg text-md mb-8 text-gray-700 md:w-[90%]">
              Our latest collection fuses cutting-edge technology with premium
              materials to give you the competitive edge. Experience the perfect
              balance of support, flexibility, and style.
            </p>
            <button
              onClick={() => navigate("/product")}
              className="border-solid px-6 py-2 border-black border-[1px] rounded-full hover:bg-black hover:text-white transition-all"
            >
              Shop Now
            </button>
          </div>
          <div className="md:w-[45%]">
            <img
              src="/images/product5.jpg"
              alt="Performance shoes"
              className="md:h-[38rem] h-[30rem] object-cover w-full md:shadow-xl"
            />
          </div>
        </div>

        {/* Second Flex Container - Image on Left */}
        <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center md:gap-18 gap-6">
          <div className="md:w-1/2 text-right">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              STREET-READY <span className="text-primary">STYLE</span>
            </h2>
            <p className="text-lg mb-8 text-gray-700">
              Designed for the urban athlete. Our lifestyle collection brings
              professional-grade comfort to your everyday wear without
              compromising on aesthetics.
            </p>
            <button
              onClick={() => navigate("/product")}
              className="border-solid px-6 py-2 border-black border-[1px] rounded-full hover:bg-black hover:text-white transition-all"
            >
              Shop Now
            </button>
          </div>
          <div className="md:w-[45%] w-full">
            <img
              src="/images/product3.jpg"
              alt="Urban style shoes"
              className="md:h-[38rem] h-[30rem] object-top object-cover w-full md:shadow-xl"
            />
          </div>
        </div>
      </section>
    </PrimaryLayout>
  );
};

export default Explore;
