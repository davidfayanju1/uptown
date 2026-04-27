import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearch,
  IoClose,
  IoPersonOutline,
  IoHeartOutline,
  IoBagHandleOutline,
} from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCartIcon } from "lucide-react";
import api from "../../lib/axios";
import { useCart } from "../../hooks/useCart";

const Nav = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { cartCount, refetchCart } = useCart();

  // Refetch cart when component mounts
  useEffect(() => {
    refetchCart();
  }, []);

  // Check if we're on the home page
  const isHomePage = location.pathname === "/";
  const logo = isHomePage ? "/images/logo4.png" : "/images/logo5.png";

  // Determine icon color based on page and scroll state
  const getIconColor = () => {
    if (isHomePage) return "#F1F1F1F1"; // gray-300
    return "#1f2937"; // gray-800
  };

  const links = [
    { name: "SHOP", url: "/product" },
    { name: "REGISTRY", url: "/registry" },
  ];

  const menuItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/product" },
    { name: "Registry", url: "/registry" },
  ];

  const quickLinks = [
    { name: "New Arrivals", url: "" },
    { name: "Best Sellers", url: "" },
    { name: "Deals", url: "" },
    { name: "Store Locator", url: "" },
  ];

  const accountLinks = [
    { name: "Sign In", url: "/signin", icon: <IoPersonOutline size={20} /> },
    {
      name: "My Orders",
      url: "/orders",
      icon: <IoBagHandleOutline size={20} />,
    },
    { name: "Wishlist", url: "/wishlist", icon: <IoHeartOutline size={20} /> },
    { name: "Account", url: "/account", icon: <IoPersonOutline size={20} /> },
  ];

  // Get product image function
  const getProductImage = (item) => {
    if (item.variant_images && item.variant_images.length > 0) {
      return item.variant_images[0];
    }
    if (item.product_images && item.product_images.length > 0) {
      return item.product_images[0];
    }
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  // Fetch cart from API
  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const response = await api.get("/v1/cart");
      const cartData = response.data?.data || response.data || [];
      const items = Array.isArray(cartData) ? cartData : cartData.items || [];
      setCartItems(items);
    } catch (error) {
      console.log("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch cart on component mount and when location changes
  useEffect(() => {
    fetchCart();
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Animation variants
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
    exit: {
      x: "-100%",
      transition: {
        ease: "easeInOut",
        duration: 0.3,
      },
    },
  };

  const menuItemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.1 * i,
        ease: "easeOut",
        duration: 0.5,
      },
    }),
  };

  const cartDropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const handleCartClick = () => {
    setShowCartDropdown(!showCartDropdown);
  };

  // Determine text color based on page
  const textColor = isHomePage ? "text-gray-300" : "text-gray-800";
  const iconColor = isHomePage ? "text-gray-300" : "text-gray-800";
  const iconColorValue = getIconColor();
  const inputBg = isHomePage ? "bg-gray-300/30" : "bg-gray-100";
  const inputText = isHomePage ? "text-gray-500" : "text-gray-800";
  const inputPlaceholder = isHomePage
    ? "placeholder:text-gray-400"
    : "placeholder:text-gray-500";
  const navBg = isHomePage ? "bg-transparent" : "bg-white shadow-sm";

  return (
    <div className={`main-nav w-full z-50 fixed top-0 left-0 ${navBg}`}>
      {/* Main navbar content */}
      <div className="h-[5rem] flex items-center justify-between md:p-3 relative">
        {/* Desktop logo container */}
        <div className="title-container cursor-pointer md:block hidden">
          <div className="image-text-container flex items-center gap-2">
            <Link to={"/"} className="cursor-pointer mt-2">
              <img src={logo} alt="" className="w-[10rem] h-[15rem]" />
            </Link>
            <div className="flex-container md:flex hidden items-center gap-4">
              {links.map((item, index) => (
                <small
                  onClick={() => navigate(item?.url)}
                  key={index}
                  className={`block cursor-pointer font-[400] text-[.8rem] mt-[.7rem] ${textColor}`}
                >
                  {item.name}
                </small>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile logo container */}
        <div className="mobile-container md:hidden flex items-center justify-between w-full px-2">
          <button onClick={() => setOpenSidebar(true)}>
            <RxHamburgerMenu className={iconColor} size={27} />
          </button>
          <img src={logo} alt="" className="w-[10rem] mr-[-1.5rem] h-[15rem]" />
          <button onClick={() => setOpenSearch(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill={iconColorValue}
              viewBox="0 0 256 256"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div
          className="nav-link md:w-[30%] flex items-center md:justify-between relative gap-2"
          ref={dropdownRef}
        >
          <div
            className={`input-container md:w-[90%] gap-3 py-2 ${inputBg} md:flex hidden items-center justify-center px-2 cursor-pointer backdrop-blur-sm`}
          >
            <button className="h-[1.6rem] cursor-pointer flex items-center justify-center w-[1.6rem] rounded-full ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill={iconColorValue}
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              className={`placeholder:!text-[.7rem] w-full outline-none border-none ${inputText} ${inputPlaceholder}`}
            />
          </div>

          <div className="item-container flex items-center gap-1">
            <button
              onClick={handleCartClick}
              className="h-[2.5rem] w-[2.5rem] flex items-center justify-center rounded-full transition-all ease-in-out delay-75 cursor-pointer relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill={iconColorValue}
                viewBox="0 0 256 256"
              >
                <path d="M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z" />
              </svg>
              {/* Cart Count Badge */}
              {cartCount > 0 && (
                <span
                  className={`absolute -top-0 right-0 bg-red-500 text-white rounded-full md:w-5 md:h-5 h-4 w-4 flex items-center justify-center text-xs ${
                    isHomePage ? "bg-red-500" : "bg-red-600"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cart Dropdown */}
        <AnimatePresence>
          {showCartDropdown && (
            <motion.div
              ref={dropdownRef}
              className="absolute top-full right-0 bg-white shadow-lg border border-gray-200 overflow-hidden w-96 rounded-md z-[60]"
              variants={cartDropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
                  <h3 className="font-semibold text-gray-800">
                    Your Cart ({cartCount})
                  </h3>
                  <button
                    onClick={() => setShowCartDropdown(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IoClose size={20} />
                  </button>
                </div>

                {cartLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-gray-600 mt-3">Loading cart...</p>
                  </div>
                ) : cartCount === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCartIcon
                      className="mx-auto text-gray-400 mb-3"
                      size={40}
                    />
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <button
                      onClick={() => {
                        navigate("/product");
                        setShowCartDropdown(false);
                      }}
                      className="bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {cartCount} item{cartCount !== 1 ? "s" : ""} in your
                        cart
                      </p>
                    </div>

                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cartItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 pb-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            navigate(`/product/${item?.product_id}`);
                            setShowCartDropdown(false);
                          }}
                        >
                          <img
                            src={getProductImage(item)}
                            alt={item.product_title || "Product"}
                            className="w-12 h-12 object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.product_title || "Product Item"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} |{" "}
                              {item.color ? `${item.color} | ` : ""}
                              {item.size || "One Size"}
                            </p>
                            <p className="text-xs font-semibold text-gray-900">
                              £
                              {(
                                item.unit_price_snapshot_cents / 100
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{cartItems.length - 3} more item(s)
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        navigate("/cart");
                        setShowCartDropdown(false);
                      }}
                      className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      View Cart & Checkout
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {accountLinks.map((link, index) => (
                    <motion.button
                      key={index}
                      className="flex items-center py-2 px-2 hover:bg-gray-50 rounded-md cursor-pointer w-full text-left"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(link.url);
                        setShowCartDropdown(false);
                      }}
                    >
                      <span className="text-gray-600 mr-3">{link.icon}</span>
                      <span className="text-gray-800 text-sm">{link.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation Sidebar */}
      <AnimatePresence>
        {openSidebar && (
          <motion.div
            className="overlay bg-black/40 md:hidden block z-50 fixed h-screen w-full left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute md:hidden block h-screen pt-[2rem] px-[1.45rem] w-full top-0 left-0 bg-white backdrop-blur-3xl"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button onClick={() => setOpenSidebar(false)} className="mb-8">
                <IoClose size={30} />
              </button>
              <div className="nav-item-container mt-[4rem] items-end flex flex-col gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="text-[1.4rem] font-medium text-gray-800"
                    variants={menuItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    onClick={() => navigate(item?.url)}
                  >
                    {item.name}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Sidebar */}
      <AnimatePresence>
        {openSearch && (
          <motion.div
            className="overlay bg-black/40 md:hidden block z-50 fixed h-screen w-full left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute md:hidden block h-screen pt-[2rem] px-6 w-full top-0 left-0 bg-white backdrop-blur-3xl"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-gray-800">Search</h2>
                <button onClick={() => setOpenSearch(false)}>
                  <IoClose size={30} />
                </button>
              </div>

              <div className="relative mb-10">
                <input
                  type="text"
                  placeholder="Search Uptown"
                  className="w-full py-4 text-lg outline-none border-b-2 border-gray-300 focus:border-black placeholder-gray-400 text-gray-800"
                  autoFocus
                />
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2">
                  <IoSearch size={24} color="gray" />
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                  QUICK LINKS
                </h3>
                <div className="space-y-5">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      className="text-lg font-medium text-gray-800"
                      variants={menuItemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                    >
                      {link.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Nav;
