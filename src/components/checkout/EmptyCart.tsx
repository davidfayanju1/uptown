import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">
          <img
            src="/images/cart-empty-removebg.png"
            alt=""
            className="h-40 mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-gray-600 mb-6">
          Add some items to your cart before checking out
        </p>
        <button
          type="button"
          onClick={() => navigate("/product")}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </motion.div>
    </div>
  );
};

export default EmptyCart;
