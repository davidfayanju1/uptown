import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearch,
  IoClose,
  IoPersonOutline,
  IoHeartOutline,
  IoBagHandleOutline,
} from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaDollarSign, FaPoundSign, FaAngleDown } from "react-icons/fa";
import { MdOutlineEuroSymbol } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";

const Nav = () => {
  const [toggle, setToggle] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const currency = [
    { name: "Naira", icon: <TbCurrencyNaira /> },
    { name: "Dollar", icon: <FaDollarSign /> },
    { name: "Pounds", icon: <FaPoundSign /> },
    { name: "Euros", icon: <MdOutlineEuroSymbol /> },
  ];

  const [input, setInput] = useState({
    name: "Naira",
    icon: <TbCurrencyNaira />,
  });

  const links = [
    {
      name: "SHOP",
      url: "/product",
    },
    {
      name: "REGISTRY",
      url: "/registry",
    },
    {
      name: "SUPPORT",
      url: "/support",
    },
  ];

  const menuItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/product" },
    { name: "Registry", url: "/registry" },
    { name: "Support", url: "/" },
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

  const searchSidebarVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.2,
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

  return (
    <div className="main-nav backdrop-blur-[7px] bg-white w-full z-50 fixed top-0 left-0">
      {/* Main navbar content */}
      <div className="h-[5rem] flex items-center justify-between md:p-3 relative">
        {/* Desktop logo container */}
        <div className="title-container cursor-pointer md:block hidden">
          <div className="image-text-container flex items-center gap-2">
            <Link to={"/"}>
              <img
                src="/images/companylogo.png"
                alt=""
                className="md:w-[7rem] w-[8rem] h-[8rem] md:h-[7rem]"
              />
            </Link>
            <div className="flex-container md:flex hidden items-center gap-3">
              {links.map((item, index) => (
                <small
                  onClick={() => navigate(item?.url)}
                  key={index}
                  className="block text-black cursor-pointer font-semibold text-[.65rem] mt-[.7rem]"
                >
                  {item.name}
                </small>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile logo container */}
        <div className="mobile-container md:hidden flex items-center justify-between w-full md:px-4 px-2">
          <button onClick={() => setOpenSidebar(true)}>
            <RxHamburgerMenu color="black" size={27} />
          </button>
          <img
            src="/images/companylogo.png"
            alt=""
            className="w-[7rem] h-[7rem]"
          />
          <button onClick={() => setOpenSearch(true)}>
            <IoSearch color="gray" size={25} />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div
          className="nav-link flex items-center relative gap-2"
          ref={dropdownRef}
        >
          <div className="dropdown-container md:block hidden">
            <button
              onClick={() => setToggle(!toggle)}
              className="dropdown-component text-black hover:bg-white/40 py-2 flex items-center px-2 gap-2 rounded-[7px]"
            >
              {input.icon}
              {input.name}
              <FaAngleDown />
            </button>

            {toggle && (
              <motion.div
                className="items-container w-[6rem] absolute bg-white p-2 rounded-[8px] cursor-pointer shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {currency.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setInput({
                        name: item.name,
                        icon: item.icon,
                      });
                      setToggle(false);
                    }}
                    className="small-container cursor-pointer mb-2 hover:bg-gray-100 flex items-center gap-2 p-1"
                  >
                    {item.icon}
                    <small>{item.name}</small>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="input-container gap-3 py-2 rounded-full bg-gray-300/30 md:flex hidden items-center justify-center px-2 cursor-pointer">
            <button className="h-[1.6rem] cursor-pointer flex items-center justify-center w-[1.6rem] rounded-full hover:bg-gray-300">
              <IoSearch color="gray" />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="placeholder:!text-[.7rem] text-gray-500 outline-none border-none placeholder:text-gray-400"
            />
          </div>

          <div className="item-container flex items-center gap-1">
            <button
              onClick={handleCartClick}
              className="h-[2.5rem] w-[2.5rem] flex items-center justify-center rounded-full hover:bg-gray-100 transition-all ease-in-out delay-75 cursor-pointer"
            >
              <RiShoppingCartLine color="gray" size={25} />
            </button>
          </div>
        </div>

        {/* Cart Dropdown */}
        <AnimatePresence>
          {showCartDropdown && (
            <motion.div
              className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 overflow-hidden"
              variants={cartDropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="p-6">
                {/* Empty cart message */}
                <div className="text-center py-6 border-b border-gray-100">
                  <RiShoppingCartLine
                    className="mx-auto text-gray-400"
                    size={40}
                  />
                  <p className="mt-4 text-gray-600">Your cart is empty</p>

                  {/* Sign In button */}
                  <button
                    onClick={() => navigate("/signin")}
                    className="mt-6 bg-black text-white py-3 px-8 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </button>
                </div>

                {/* Account links */}
                <div className="py-4">
                  {accountLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center py-3 px-2 hover:bg-gray-50 rounded-md cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => navigate(link.url)}
                    >
                      <span className="text-gray-600 mr-3">{link.icon}</span>
                      <span className="text-gray-800 text-sm">{link.name}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Additional sign in button at bottom */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/signin")}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <IoPersonOutline className="mr-2" size={18} />
                    Sign In
                  </button>
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
                    className="text-[1.4rem] font-medium"
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
                <h2 className="text-xl font-semibold">Search</h2>
                <button onClick={() => setOpenSearch(false)}>
                  <IoClose size={30} />
                </button>
              </div>

              {/* Search input with bottom border only */}
              <div className="relative mb-10">
                <input
                  type="text"
                  placeholder="Search Uptown"
                  className="w-full py-4 text-lg outline-none border-b-2 border-gray-300 focus:border-black placeholder-gray-400"
                  autoFocus
                />
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2">
                  <IoSearch size={24} color="gray" />
                </button>
              </div>

              {/* Quick Links Section */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                  QUICK LINKS
                </h3>
                <div className="space-y-5">
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      className="text-lg font-medium"
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
