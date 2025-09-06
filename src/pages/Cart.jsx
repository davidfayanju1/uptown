import React, { useState } from "react";
import { Link } from "react-router-dom";
import PrimaryLayout from "../layout/PrimaryLayout";
import { BsTrash } from "react-icons/bs";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "UPTOWN REINCARNATION TEE",
      price: 24.99,
      quantity: 1,
      image: "/images/shirt1.png",
      color: "Black",
      size: "M",
    },
    {
      id: 2,
      name: "UPTOWN DAILY PROJECT BASEBALL CAP",
      price: 15.99,
      quantity: 2,
      image: "/images/cap1.webp",
      color: "Navy",
      size: "One Size",
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <PrimaryLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto md:px-4 px-2 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 mb-6">Your cart is empty</p>
              <Link
                to="/product"
                className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-sm md:p-6 p-2">
                  <div className="hidden md:grid grid-cols-12 gap-4 text-gray-500 text-sm font-medium pb-4 border-b">
                    <div className="col-span-5">PRODUCT</div>
                    <div className="col-span-2">PRICE</div>
                    <div className="col-span-3">QUANTITY</div>
                    <div className="col-span-2">TOTAL</div>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6  border-b-[1px] border-gray-200 items-center"
                    >
                      {/* Product Info - Larger image and mobile layout changes */}
                      <div className="md:col-span-5 flex items-start">
                        <div className="h-28 w-28 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 mr-4 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 md:h-16 md:w-16 object-contain"
                          />
                        </div>
                        <div className="flex flex-col md:h-full h-[6rem] md:justify-center justify-between">
                          <div className="item-container">
                            <h3 className="md:text-sm text-[10px] line-clamp-2 md:font-bold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.color} | {item.size}
                            </p>
                          </div>

                          {/* <div className="mt-2 text-sm font-bold text-gray-900">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </div> */}
                        </div>

                        <div className="md:hidden h-full ">
                          <div className="flex h-[6rem] justify-between flex-col">
                            <div className="text-sm text-right font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center rounded-md">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  −
                                </button>
                                <span className="px-1 py-1">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="transition-colors"
                              >
                                <BsTrash color="red" size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: Price */}
                      <div className="hidden md:block md:col-span-2 text-sm text-gray-900 font-medium">
                        ${item.price.toFixed(2)}
                      </div>

                      {/* Desktop: Quantity Controls */}
                      <div className="hidden md:flex md:col-span-3 items-center">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 border-l border-r">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-4 transition-colors"
                        >
                          <BsTrash color="red" />
                        </button>
                      </div>

                      {/* Desktop: Total */}
                      <div className="hidden md:block md:col-span-2 text-sm font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        ${shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4 mb-6">
                    <span className="text-lg font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <button className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 px-4 rounded-md font-medium hover:from-gray-800 hover:to-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Checkout · ${total.toFixed(2)}
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    or{" "}
                    <Link
                      to="/products"
                      className="text-gray-900 hover:underline"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Cart;
