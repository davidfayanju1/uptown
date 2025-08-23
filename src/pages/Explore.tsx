import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { Link, useNavigate } from "react-router-dom";

const Explore = () => {
  const navigate = useNavigate();

  const productList = [
    {
      name: "PLAIN TEE",
      img: "/images/product1.jpg",
      price: "$29.99",
      colors: ["Black", "White", "Gray"],
    },
    {
      name: "ROLLERS TEE",
      img: "/images/product2.jpg",
      price: "$34.99",
      colors: ["Red", "Blue", "Green"],
    },
    {
      name: "PLAIN TEE",
      img: "/images/product3.jpg",
      price: "$27.99",
      colors: ["Navy", "Beige"],
    },
    {
      name: "ROLLERS TEE",
      img: "/images/product4.jpg",
      price: "$31.99",
      colors: ["Yellow", "Orange"],
    },
  ];

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
        <div className="container mx-auto md:px-4 px-3 flex flex-col md:flex-row items-center gap-16 mb-16">
          <div className="md:w-1/2">
            <h2 className="md:text-4xl text-2xl font-bold mb-6 tracking-tight">
              A TESTAMENT TO CRAFTSMANSHIP
              <span className="text-primary">
                {" "}
                &
                <br /> <span className="text-red-500"> EXCLUSIVITY</span>
              </span>
            </h2>
            <p className="md:text-lg text-md mb-8 text-gray-700 md:w-[80%] w-[88%]">
              Our Apparel are not created for the crowd they are reserved for
              the uncompromising. Every detail is intentional, shaped with quiet
              mastery.
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
              src="/images/victory2.jpeg"
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

        <div className="container mt-[6rem] mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Discover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {productList.map((product, index) => (
              <div key={index} className="group relative w-full">
                <div className="h-[22rem] w-full overflow-hidden bg-gray-200">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover object-top group-hover:opacity-75 transition-opacity"
                  />
                </div>
                <div className="mt-4">
                  <Link to={`/product/${index}`}>
                    <h3 className="text-sm font-medium text-gray-900">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-gray-700">{product.price}</p>
                  <div className="mt-2 flex space-x-1">
                    {product.colors.map((color, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PrimaryLayout>
  );
};

export default Explore;
