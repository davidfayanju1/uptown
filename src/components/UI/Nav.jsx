import React from "react";

const Nav = () => {
  const links = [
    { id: 1, name: "Home" },
    { id: 1, name: "Home" },
  ];

  return (
    <div className="main-nav backdrop-blur-sm border-b-[1px] border-gray-400 w-full h-[5rem] fixed top-0 left-0 flex items-center justify-between p-3">
      <div className="title-container cursor-pointer">
        <h1 className="font-semibold text-[1.2rem]">Uptown.</h1>
      </div>

      <div className="nav-link"></div>
    </div>
  );
};

export default Nav;
