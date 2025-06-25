import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSearch, IoClose } from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaDollarSign, FaPoundSign, FaAngleDown } from "react-icons/fa";
import { MdOutlineEuroSymbol } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";

const Nav = () => {
  const [toggle, setToggle] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

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

  const links = ["SHOP", "REGISTRY", "SUPPORT"];

  const menuItems = [
    { name: "Home", url: "" },
    { name: "Registry", url: "" },
    { name: "Clothing", url: "" },
    { name: "Sell", url: "" },
    { name: "Bid", url: "" },
    { name: "Pricing", url: "" },
  ];

  const quickLinks = [
    { name: "New Arrivals", url: "" },
    { name: "Best Sellers", url: "" },
    { name: "Deals", url: "" },
    // { name: "Gift Cards", url: "" },
    { name: "Store Locator", url: "" },
  ];

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

  return (
    <div className="main-nav backdrop-blur-[7px] bg-white w-full z-50 h-[5rem] fixed top-0 left-0 flex items-center justify-between md:p-3 p-2">
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
                key={index}
                className="block text-black font-semibold text-[.65rem] mt-[.7rem]"
              >
                {item}
              </small>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile logo container */}
      <div className="mobile-container md:hidden flex items-center justify-between w-full px-4">
        <button onClick={() => setOpenSidebar(true)}>
          <RxHamburgerMenu color="black" size={30} />
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

      {/* Desktop Navigation */}
      <div className="nav-link flex items-center relative gap-2">
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
              className="items-container w-[6rem] absolute bg-white p-2 rounded-[8px] cursor-pointer shadow-lg"
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

        <div className="item-container flex  items-center gap-1">
          <button className="h-[2.5rem] w-[2.5rem] flex items-center justify-center rounded-full hover:bg-white/20 transition-all ease-in-out delay-75 cursor-pointer">
            <RiShoppingCartLine color="gray" size={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nav;
