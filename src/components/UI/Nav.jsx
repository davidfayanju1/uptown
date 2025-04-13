import React from "react";

const Nav = () => {
  const links = [
    { id: 1, name: "Home" },
    { id: 1, name: "Home" },
  ];

  return (
    <div className="main-nav backdrop-blur-[7px] border-b-[1px] border-gray-400 w-full z-50 h-[5rem] fixed top-0 left-0 flex items-center justify-between p-3">
      <div className="title-container cursor-pointer">
        <img
          src="/images/companylogo.png"
          alt=""
          className="w-[7rem] h-[7rem]"
        />
      </div>

      <div className="nav-link"></div>
    </div>
  );
};

export default Nav;
