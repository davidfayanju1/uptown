import React from "react";
import PrimaryLayout from "../layout/PrimaryLayout";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();

  console.log(id, "id");

  return (
    <PrimaryLayout>
      <div className="">
        <div className="flex-container">
          <div className="image-container w-[50%]">
            <img
              src="/images/product1.jpg"
              alt=""
              className=" w-full object-cover"
            />
          </div>
          <div className="text-container"></div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default ProductDetails;
