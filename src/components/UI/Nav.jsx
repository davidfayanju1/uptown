import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaDollarSign } from "react-icons/fa";
import { FaPoundSign } from "react-icons/fa";
import { MdOutlineEuroSymbol } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";

const Nav = () => {
  const [toggle, setToggle] = useState(false);

  const currency = [
    {
      name: "Naira",
      icon: <TbCurrencyNaira />,
    },
    {
      name: "Dollar",
      icon: <FaDollarSign />,
    },
    {
      name: "Pounds",
      icon: <FaPoundSign />,
    },
    {
      name: "Euros",
      icon: <MdOutlineEuroSymbol />,
    },
  ];

  const [input, setInput] = useState({
    name: "Naira",
    icon: <TbCurrencyNaira />,
  });

  const links = ["SHOP", "REGISTRY", "SUPPORT"];

  return (
    <div className="main-nav backdrop-blur-[7px] border-b-[1px] border-gray-400 w-full z-50 h-[5rem] fixed top-0 left-0 flex items-center justify-between md:p-3 p-1">
      <div className="title-container cursor-pointer">
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

      <div className="nav-link flex items-center relative gap-2 ">
        <button
          onClick={() => setToggle(!toggle)}
          className="dropdown-component text-black hover:bg-white/40 py-2 flex items-center px-2 gap-2 rounded-[7px]"
        >
          {input.icon}
          {input.name}
          <FaAngleDown />
        </button>

        {toggle && (
          <div className="items-container w-[6rem] absolute bottom-[-129px] bg-white p-2 rounded-[8px]">
            {currency.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  setInput({
                    name: item.name,
                    icon: item.icon,
                  })
                }
                className="small-container cursor-pointer mb-2 hover:bg-gray-100 flex items-center  gap-2"
              >
                {item.icon}
                <small>{item.name}</small>
              </div>
            ))}
          </div>
        )}

        {/* <select
          name=""
          id=""
          className="text-white hover:bg-white/40 py-3 cursor-pointer outline-none border-none rounded-[10px] text-[.9rem]"
        >
          <option value="dollar" className="text-black">
            Dollar
          </option>
          <option value="pounds" className="text-black">
            Pounds
          </option>
          <option value="naira" className="text-black flex items-center gap-2">
            <TbCurrencyNaira />
            Naira
          </option>
          <option value="euros" className="text-black">
            Euros
          </option>
        </select> */}

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

        <button className="h-[2.5rem] w-[2.5rem] flex items-center justify-center  rounded-full hover:bg-white/20 transition-all ease-in-out delay-75 cursor-pointer">
          <RiShoppingCartLine color="black" />
        </button>
      </div>
    </div>
  );
};

export default Nav;
