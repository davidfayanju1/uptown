import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="footer-section md:min-h-[5rem] min-h-[3rem] pt-3 px-5 border-t-[1px] border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-container">
          <span className="font-semibold block text-[.9rem] text-black">
            NEWSLETTER
          </span>

          <a href="tel:09044937333" className="">
            Contact Us
          </a>
        </div>

        <div className="mega-container">
          <span className="text-container block text-[.9rem] text-gray-400">
            &copy; 2025 UPTOWN
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
