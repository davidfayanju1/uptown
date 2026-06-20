// Nav.jsx - Optimized with client-side search (fetch all products once)
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearch,
  IoClose,
  IoPersonOutline,
  IoHeartOutline,
  IoBagHandleOutline,
  IoLogOutOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import api from "../../lib/axios";
import { useCart } from "../../hooks/useCart";
import useUserStore from "../../stores/auth-store";
import { formatCurrency, getPriceRange } from "../../utils/currency";

const Nav = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  // New: Store all products for client-side search
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const { user, clearUserData } = useUserStore();

  const {
    cartCount,
    cartItems,
    isLoading: cartLoading,
    removeCartItem,
  } = useCart();

  // Home and registry get transparent nav on both mobile and desktop
  const isTransparentPage =
    location.pathname === "/" || location.pathname === "/registry";

  // Product detail gets transparent nav on mobile only (not desktop)
  const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);

  // Mobile: transparent when unscrolled on home/registry OR product detail
  const mobileIsTransparent = !isScrolled && (isTransparentPage || isProductDetailPage);

  // Desktop: transparent only on home/registry (unchanged behaviour)
  const desktopIsTransparent = !isScrolled && isTransparentPage;

  // Nav background — product detail uses mobile-only transparency via responsive class
  const getNavBg = () => {
    if (desktopIsTransparent) return "bg-transparent";
    if (!isScrolled && isProductDetailPage) return "bg-transparent md:bg-white md:shadow-sm";
    return "bg-white shadow-sm";
  };

  // Desktop icon/text color (unchanged — only home/registry go white on desktop)
  const getTextColor = () => {
    if (desktopIsTransparent) return "#FFFFFF";
    return "#1F2937";
  };

  // Desktop logo (unchanged)
  const getLogo = () => {
    if (desktopIsTransparent) return "/images/logo4.png";
    return "/images/logo5.png";
  };

  // Mobile-specific icon color and logo (includes product detail)
  const mobileIconColor = mobileIsTransparent ? "#FFFFFF" : "#1F2937";
  const mobileLogo = mobileIsTransparent ? "/images/logo4.png" : "/images/logo5.png";

  // Cart button color: mobile follows mobileIsTransparent; desktop follows desktopIsTransparent
  const cartColorClass = mobileIsTransparent && !isTransparentPage
    ? "text-white md:text-[#1F2937]"
    : mobileIsTransparent
      ? "text-white"
      : "text-[#1F2937]";

  const iconColor = getTextColor();
  const logo = getLogo();
  const navBg = getNavBg();

  // Check if current page is Home or Registry (for desktop specific styling)
  const isHomeOrRegistry =
    location.pathname === "/" || location.pathname === "/registry";

  // Desktop specific input background
  const desktopInputBg = isHomeOrRegistry ? "bg-black/5" : "bg-gray-100";

  // Desktop link text color
  const desktopLinkColor = isHomeOrRegistry
    ? "text-[#FFFFFF]"
    : "text-[#1F2937]";

  // Fetch ALL products once on mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await api.get("/v1/products");
        if (response.data?.status && response.data?.data) {
          const products = response.data.data;
          // Transform products for search with proper currency formatting
          const transformed = products.map((product) => {
            const productVariants = product.variants || [];
            const priceRange = getPriceRange(productVariants);
            const productImage =
              productVariants[0]?.images?.[0] ||
              product.images?.[0] ||
              "/images/placeholder.png";
            const hasStock = productVariants.some((v) => v.stock > 0);

            return {
              id: product.id,
              name: product.title,
              title: product.title,
              description: product.description || "",
              image: productImage,
              price: priceRange,
              priceCents: productVariants[0]?.price_cents || 0,
              currency: productVariants[0]?.currency || "NGN",
              available: hasStock,
              category: product.category || "",
              tags: product.tags || [],
            };
          });
          setAllProducts(transformed);

          // Set suggested products (3 random)
          const shuffled = [...transformed];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setSuggestedProducts(shuffled.slice(0, 3));
          setProductsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchAllProducts();
  }, []);

  // Client-side search function
  const searchProductsClient = (query) => {
    if (!query.trim() || !productsLoaded) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    // Simulate tiny delay for smooth UX
    setTimeout(() => {
      const searchTerm = query.toLowerCase().trim();
      const filtered = allProducts
        .filter((product) => {
          // Search in title, description, category, and tags
          return (
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description &&
              product.description.toLowerCase().includes(searchTerm)) ||
            (product.category &&
              product.category.toLowerCase().includes(searchTerm)) ||
            (product.tags &&
              product.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm),
              ))
          );
        })
        .slice(0, 5); // Limit to 5 results for dropdown

      setSearchResults(filtered);
      setSearchLoading(false);
    }, 150);
  };

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history
  const saveSearchHistory = (query) => {
    if (!query.trim()) return;
    const updatedHistory = [
      query,
      ...searchHistory.filter((h) => h !== query),
    ].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Debounce client-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((showDesktopSearch || openSearch) && productsLoaded) {
        searchProductsClient(searchQuery);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, showDesktopSearch, openSearch, productsLoaded]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchHistory(searchQuery);
      navigate(`/product?search=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    if (searchQuery.trim()) {
      saveSearchHistory(searchQuery);
    }
    closeSearch();
    navigate(`/product/${productId}`);
  };

  // Handle history click
  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem);
    searchProductsClient(historyItem);
    saveSearchHistory(historyItem);
  };

  // Close search overlay
  const closeSearch = () => {
    setShowDesktopSearch(false);
    setOpenSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Handle click outside for desktop search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target)
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll effect for mobile transparency
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "SHOP", url: "/product" },
    { name: "REGISTRY", url: "/registry" },
  ];

  const menuItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/product" },
    { name: "Registry", url: "/registry" },
  ];

  const getAccountLinks = () => {
    if (user) {
      return [
        {
          name: "My Orders",
          url: "/orders",
          icon: <IoBagHandleOutline size={20} />,
        },
        {
          name: "Wishlist",
          url: "/wishlist",
          icon: <IoHeartOutline size={20} />,
        },
        {
          name: "Account",
          url: "/account",
          icon: <IoPersonOutline size={20} />,
        },
        {
          name: "Sign Out",
          url: "#",
          icon: <IoLogOutOutline size={20} color="black" />,
          isLogout: true,
        },
      ];
    } else {
      return [
        {
          name: "Sign In",
          url: "/signin",
          icon: <IoPersonOutline size={20} />,
        },
        {
          name: "My Orders",
          url: "/orders",
          icon: <IoBagHandleOutline size={20} />,
        },
        {
          name: "Wishlist",
          url: "/wishlist",
          icon: <IoHeartOutline size={20} />,
        },
      ];
    }
  };

  const accountLinks = getAccountLinks();

  const handleLogout = async (e) => {
    clearUserData();
    delete api.defaults.headers.common["Authorization"];
  };

  const getProductImage = (item) => {
    if (item.variant_images && item.variant_images.length > 0)
      return item.variant_images[0];
    if (item.product_images && item.product_images.length > 0)
      return item.product_images[0];
    return "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
  };

  const handleRemoveFromCart = async (itemId, e) => {
    e.stopPropagation();
    setDeletingItemId(itemId);
    try {
      await removeCartItem({ itemId });
    } catch (error) {
      console.error("Error removing item from cart:", error);
    } finally {
      setDeletingItemId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { x: "-100%", transition: { ease: "easeInOut", duration: 0.3 } },
  };

  const menuItemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.1 * i, duration: 0.5 },
    }),
  };

  const cartDropdownVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.4 } },
  };

  const searchOverlayVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const handleCartClick = () => setShowCartDropdown(!showCartDropdown);

  // Mobile sidebar link color — white when transparent (home, registry, product detail)
  const mobileLinkColor = mobileIsTransparent ? "text-white" : "text-gray-800";

  return (
    <div className={`main-nav w-full z-50 fixed top-0 left-0 ${navBg}`}>
      {/* Main navbar content - ORIGINAL LAYOUT PRESERVED */}
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
                  className={`block cursor-pointer font-[400] text-[.8rem] mt-[.7rem] ${desktopLinkColor}`}
                >
                  {item.name}
                </small>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile logo container - with dynamic styling */}
        <div className="mobile-container md:hidden flex items-center justify-between w-full pl-2">
          <button onClick={() => setOpenSidebar(true)}>
            <RxHamburgerMenu color={mobileIconColor} size={27} />
          </button>
          <Link to={"/"} className="cursor-pointer">
            <img
              src={mobileLogo}
              alt=""
              className="w-[10rem] ml-[2.5rem] h-[15rem]"
            />
          </Link>
          <button onClick={() => setOpenSearch(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill={mobileIconColor}
              viewBox="0 0 256 256"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation with Search */}
        <div
          className="nav-link md:w-[30%] flex items-center md:justify-between relative gap-2"
          ref={dropdownRef}
        >
          <div
            className={`input-container md:w-[90%] gap-3 py-2 ${desktopInputBg} md:flex hidden items-center justify-center px-2 cursor-pointer backdrop-blur-sm relative`}
          >
            <button
              className="h-[1.6rem] cursor-pointer flex items-center justify-center w-[1.6rem] rounded-full"
              onClick={() => setShowDesktopSearch(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill={iconColor}
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDesktopSearch(true)}
              className="placeholder:!text-[.7rem] w-full outline-none border-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
          </div>

          {/* Cart Button */}
          <div className="item-container cursor-pointer flex items-center gap-1">
            <button
              onClick={handleCartClick}
              className={`h-[2.5rem] w-[2.5rem] flex items-center justify-center rounded-full transition-all ease-in-out delay-75 cursor-pointer relative ${cartColorClass}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className={`absolute top-[7.9px] right-[3.4px] bg-red-500 text-white rounded-full h-[8.5px] w-[8.5px] flex items-center justify-center text-xs`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SEARCH OVERLAY - Client-side search */}
      <AnimatePresence>
        {showDesktopSearch && (
          <motion.div
            ref={desktopSearchRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl border border-gray-100 overflow-hidden z-[700]"
            variants={searchOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder="What are you looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 text-lg outline-none border-b border-gray-200 focus:border-black placeholder-gray-400 text-gray-800 pr-12 font-light"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                >
                  <IoSearch size={22} color="#9ca3af" />
                </button>
              </form>

              {searchLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-semibold text-gray-400 tracking-wider">
                      SEARCH RESULTS ({searchResults.length})
                    </h3>
                    <button
                      onClick={() =>
                        navigate(
                          `/product?search=${encodeURIComponent(searchQuery)}`,
                        )
                      }
                      className="text-[10px] text-gray-400 hover:text-black transition-colors"
                    >
                      VIEW ALL
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square overflow-hidden bg-gray-50 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h4 className="text-[12px] font-medium text-gray-800 uppercase tracking-wide mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[12px] text-gray-500">
                          {product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery && suggestedProducts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-semibold text-gray-400 tracking-wider mb-4">
                    YOU MAY ALSO LIKE
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    {suggestedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square overflow-hidden bg-gray-50 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h4 className="text-[12px] font-medium text-gray-800 uppercase tracking-wide mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-[12px] text-gray-500">
                          {product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery && searchHistory.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] font-semibold text-gray-400 tracking-wider">
                      RECENT SEARCHES
                    </h3>
                    <button
                      onClick={clearSearchHistory}
                      className="text-[10px] text-gray-400 hover:text-black transition-colors"
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <IoTimeOutline size={12} />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Dropdown - ORIGINAL (unchanged) */}
      <AnimatePresence>
        {showCartDropdown && (
          <motion.div
            ref={dropdownRef}
            className="absolute top-full right-0 bg-white shadow-lg border border-gray-200 overflow-hidden w-96 z-[60]"
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
                  <img
                    src="/images/cart-empty.png"
                    alt=""
                    className="h-30 mx-auto"
                  />
                  <p className="text-gray-600 text-[12px] mb-4">
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => {
                      navigate("/product");
                      setShowCartDropdown(false);
                    }}
                    className="bg-black text-white text-[12px] py-2 px-4 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {cartCount} item(s) in your cart
                    </p>
                  </div>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cartItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 pb-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="cursor-pointer flex-shrink-0"
                          onClick={() => {
                            navigate(`/product/${item?.id}`);
                            setShowCartDropdown(false);
                          }}
                        >
                          <img
                            src={getProductImage(item)}
                            alt={item.product_title || "Product"}
                            className="w-12 h-12 object-cover"
                          />
                        </div>
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            navigate(`/product/${item?.product_id}`);
                            setShowCartDropdown(false);
                          }}
                        >
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.product_title || "Product Item"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} |{" "}
                            {item.color ? `${item.color} | ` : ""}
                            {item.size || "One Size"}
                          </p>
                          <p className="text-xs font-semibold text-gray-900">
                            {formatCurrency(
                              item.unit_price_snapshot_cents,
                              "NGN",
                            )}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleRemoveFromCart(item.id, e)}
                          disabled={deletingItemId === item.id}
                          className="self-start mt-1 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {deletingItemId === item.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                          ) : (
                            <BsTrash color="#000000" size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
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
                      if (link.isLogout) {
                        handleLogout(e);
                      } else {
                        navigate(link.url);
                        setShowCartDropdown(false);
                      }
                    }}
                  >
                    <span className="mr-3 text-gray-600">{link.icon}</span>
                    <span className="text-sm text-gray-800">{link.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Sidebar - ORIGINAL (unchanged) */}
      <AnimatePresence>
        {openSidebar && (
          <motion.div
            className="overlay bg-black/40 md:hidden block z-50 fixed h-screen w-full left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute md:hidden block h-screen pt-[2rem] px-[1.45rem] w-full top-0 left-0 bg-transparent backdrop-blur-xl"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button onClick={() => setOpenSidebar(false)} className="mb-8">
                <IoClose size={30} color="white" />
              </button>
              <div className="nav-item-container mt-[4rem] items-end flex flex-col gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`text-[1.4rem] font-medium cursor-pointer ${mobileLinkColor}`}
                    variants={menuItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      navigate(item?.url);
                      setOpenSidebar(false);
                    }}
                  >
                    {item.name}
                  </motion.div>
                ))}
                {!user ? (
                  <motion.div
                    className={`text-[1.4rem] font-medium cursor-pointer ${mobileLinkColor}`}
                    variants={menuItemVariants}
                    custom={menuItems.length}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      navigate("/signin");
                      setOpenSidebar(false);
                    }}
                  >
                    Sign In
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="text-[1.4rem] font-medium text-red-600 cursor-pointer"
                      variants={menuItemVariants}
                      custom={menuItems.length + 1}
                      initial="hidden"
                      animate="visible"
                      onClick={() => {
                        handleLogout();
                        setOpenSidebar(false);
                      }}
                    >
                      Sign Out
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Sidebar - Client-side search with glassy effect - UNCHANGED */}
      <AnimatePresence>
        {openSearch && (
          <motion.div
            className="overlay bg-black/40 md:hidden block z-500 fixed h-screen w-full left-0 top-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute md:hidden block h-screen pt-[2rem] px-6 w-full top-0 left-0 bg-transparent backdrop-blur-xl overflow-y-auto"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-white">Search</h2>
                <button onClick={() => setOpenSearch(false)}>
                  <IoClose size={30} color="white" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-4 text-lg outline-none border-b-2 border-white/30 focus:border-white placeholder-white/50 text-white bg-transparent pr-12"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                >
                  <IoSearch size={24} color="white" />
                </button>
              </form>

              {searchLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}

              {/* Search Results */}
              {!searchLoading && searchResults.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/70 mb-4 tracking-wider">
                    PRODUCTS ({searchResults.length})
                  </h3>
                  <div className="space-y-4">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex gap-4 cursor-pointer hover:bg-white/10 p-2 transition-colors rounded-md"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover bg-white/10 rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">
                            {product.name}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Products */}
              {!searchQuery && suggestedProducts.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-white/70 mb-4 tracking-wider">
                    YOU MAY ALSO LIKE
                  </h3>
                  <div className="space-y-4">
                    {suggestedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex gap-4 cursor-pointer hover:bg-white/10 p-2 transition-colors rounded-md"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover bg-white/10"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">
                            {product.name}
                          </h4>
                          <p className="text-sm text-white/60 mt-1">
                            {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search History */}
              {!searchQuery && searchHistory.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-white/70 tracking-wider">
                      RECENT SEARCHES
                    </h3>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-white/50 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="px-4 py-2 bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors rounded-md"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Nav;
