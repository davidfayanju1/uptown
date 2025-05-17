import React, { useState } from "react";
import { motion, AnimatePresence, stagger } from "framer-motion";
import { IoSearch } from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaDollarSign, FaPoundSign, FaAngleDown } from "react-icons/fa";
import { MdOutlineEuroSymbol, MdClose } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";

const Nav = () => {
  const [toggle, setToggle] = useState(false);
  const [open, setOpen] = useState(false);

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
    { name: "Brand", url: "" },
    { name: "Cloths", url: "" },
    { name: "Sell", url: "" },
    { name: "Bid", url: "" },
    { name: "Pricing", url: "" },
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
    <div className="main-nav backdrop-blur-[7px] bg-white w-full z-50 h-[5rem] fixed top-0 left-0 flex items-center justify-between md:p-3 p-1">
      {/* Desktop logo container */}
      <div className="title-container cursor-pointer md:block hidden">
        <div className="image-text-container flex items-center gap-2">
          <img
            src="/images/companylogo.png"
            alt=""
            className="w-[7rem] h-[7rem]"
          />
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
      <div className="mobile-container md:hidden flex items-center justify-between w-[65%]">
        <button onClick={() => setOpen(true)} className="">
          <RxHamburgerMenu color="black" size={30} />
        </button>
        <img
          src="/images/companylogo.png"
          alt=""
          className="w-[7rem] h-[7rem]"
        />
      </div>

      {/* Animated Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="overlay bg-black/40 md:hidden block z-50 fixed h-screen w-full left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute md:hidden block h-screen pt-[2rem] px-[1.45rem] w-[25rem] top-0 left-0 bg-white/50 backdrop-blur-3xl"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button onClick={() => setOpen(false)}>
                <MdClose size={30} />
              </button>
              <div className="nav-item-container flex flex-col gap-6 items-end mt-[6rem]">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="text-[1.4rem]"
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
              className="items-container w-[6rem] absolute bottom-[-129px] bg-white p-2 rounded-[8px]"
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
                  className="small-container cursor-pointer mb-2 hover:bg-gray-100 flex items-center gap-2"
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

        <button className="h-[2.5rem] w-[2.5rem] flex items-center justify-center rounded-full hover:bg-white/20 transition-all ease-in-out delay-75 cursor-pointer">
          <RiShoppingCartLine color="black" />
        </button>
      </div>
    </div>
  );
};

export default Nav;
