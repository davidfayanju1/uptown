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
  IoChevronForward,
  IoChevronBack,
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
  const [activeSubmenu, setActiveSubmenu] = useState(null);
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
  const mobileIsTransparent =
    !isScrolled && (isTransparentPage || isProductDetailPage);

  // Desktop: transparent only on home/registry (unchanged behaviour)
  const desktopIsTransparent = !isScrolled && isTransparentPage;

  // Nav background — product detail uses mobile-only transparency via responsive class
  const getNavBg = () => {
    if (desktopIsTransparent) return "bg-transparent";
    if (!isScrolled && isProductDetailPage)
      return "bg-transparent md:bg-white md:shadow-sm";
    return "bg-white shadow-sm";
  };

  // Desktop icon/text color (unchanged — only home/registry go white on desktop)
  const getTextColor = () => {
    if (desktopIsTransparent) return "#FFFFFF";
    return "#1F2937";
  };

  // Desktop logo
  const getLogo = () => {
    if (desktopIsTransparent) return "/images/logo-white.png";
    return "/images/logo-black.png";
  };

  // Mobile-specific icon color and logo (includes product detail).
  // An open sidebar puts the header over the scrim, so it follows the menu.
  const mobileOverDarkOverlay = mobileIsTransparent || openSidebar;
  const mobileIconColor = mobileOverDarkOverlay ? "#FFFFFF" : "#1F2937";
  const mobileLogo = mobileOverDarkOverlay
    ? "/images/logo-white.png"
    : "/images/logo-black.png";

  // Cart button color: mobile follows mobileIsTransparent; desktop follows desktopIsTransparent
  const cartColorClass = desktopIsTransparent
    ? "text-white"
    : mobileOverDarkOverlay
      ? "text-white md:text-[#1F2937]"
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

  // Mobile sidebar — primary destinations (chevron rows)
  const menuItems = [
    { name: "Home", url: "/" },
    { name: "Shop Uptown", url: "/product" },
    { name: "Shop Daily Project", url: "/daily-project" },
    { name: "Uptown Registre", url: "/registry" },
    {
      name: "Discover the Maison",
      submenu: [
        { name: "The Maison Uptown", url: "/about" },
        { name: "Read our poems", url: "/poems" },
        { name: "Artworks", url: "/artworks" },
      ],
    },
  ];

  // Second level reached from the welcome row when signed in
  const accountSubmenu = {
    name: "My Account",
    submenu: [
      { name: "Orders", url: "/orders" },
      { name: "Address Book", url: "/address-book" },
      { name: "Certificates", url: "/certificates" },
      { name: "Account Info", url: "/account" },
    ],
    secondary: [
      { name: "Sign Out", isLogout: true },
      { name: "Delete Account", url: "/account/delete" },
      { name: "Help Center", url: "/help" },
    ],
  };

  // Mobile sidebar — secondary links below the divider
  const secondaryItems = [
    { name: "Wishlist", url: "/wishlist" },
    { name: "Order Status", url: "/orders" },
    { name: "Help Center", url: "/help" },
    { name: "Returns & Exchanges", url: "/returns" },
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
        // {
        //   name: "My Orders",
        //   url: "/orders",
        //   icon: <IoBagHandleOutline size={20} />,
        // },
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

  // Scrim/blur ramp and the per-row curve are measured off the reference
  // recording; each row eases in over 0.63s, 0.1s apart, drifting in from the
  // left. Closing runs in two beats: the rows fade out, then the scrim/blur.
  const MENU_EASE = [0.1, 0.45, 0.4, 1];
  const MENU_ROW_DURATION = 0.63;
  const MENU_ROW_STAGGER = 0.1;
  const MENU_ROW_LEAD = 0.18;
  const MENU_ROW_OFFSET = -24;
  const MENU_ROW_EXIT_DURATION = 0.25;
  const MENU_EXIT_DURATION = 0.35;

  // The scrim and blur are animated directly rather than via opacity: an
  // ancestor with opacity < 1 becomes a backdrop root, which kills the
  // backdrop-filter mid-transition and makes the fade look like a hard cut.
  const menuOverlayVariants = {
    hidden: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      backdropFilter: "blur(0px)",
      WebkitBackdropFilter: "blur(0px)",
    },
    visible: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      transition: { duration: 0.45, ease: MENU_EASE },
    },
    exit: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      backdropFilter: "blur(0px)",
      WebkitBackdropFilter: "blur(0px)",
      transition: {
        duration: MENU_EXIT_DURATION,
        ease: MENU_EASE,
        // hold until the rows have cleared
        delay: MENU_ROW_EXIT_DURATION,
      },
    },
  };

  // Rows resolve top to bottom, each drifting left to right as it fades in.
  // They inherit these labels from the overlay, so they exit with it.
  const menuItemVariants = {
    hidden: { opacity: 0, x: MENU_ROW_OFFSET },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: MENU_ROW_DURATION,
        ease: MENU_EASE,
        delay: MENU_ROW_LEAD + i * MENU_ROW_STAGGER,
      },
    }),
    exit: {
      opacity: 0,
      transition: { duration: MENU_ROW_EXIT_DURATION, ease: MENU_EASE },
    },
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

  // Cart button is rendered twice — in the mobile icon cluster and in the desktop nav
  const cartButton = (
    <button
      onClick={handleCartClick}
      aria-label="Cart"
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
  );

  // The menu reads white on every page — its scrim is dark enough to carry it,
  // and keying the colour to the page behind it only ever caused flicker.
  const mobileLinkColor = "text-white";
  const mobileDividerColor = "border-white/30";

  // PrimaryLayout remounts Nav on every route change, which would cut the
  // menu's exit animation short — let it play out before navigating.
  const closeSidebar = () => {
    setOpenSidebar(false);
    setActiveSubmenu(null);
  };

  const closeSidebarAndGo = (url) => {
    closeSidebar();
    setTimeout(
      () => navigate(url),
      (MENU_ROW_EXIT_DURATION + MENU_EXIT_DURATION) * 1000,
    );
  };

  return (
    <div className={`main-nav w-full z-50 fixed top-0 left-0 ${navBg}`}>
      {/* Main navbar content - ORIGINAL LAYOUT PRESERVED */}
      {/* Header stays above the mobile sidebar overlay so the X remains reachable */}
      <div className="h-[5rem] flex items-center justify-between md:p-3 relative z-[60]">
        {/* Desktop logo container */}
        <div className="title-container cursor-pointer md:block hidden">
          <div className="image-text-container flex items-center gap-2">
            <Link to={"/"} className="cursor-pointer">
              <img
                src={logo}
                alt="Uptown Maison"
                className="w-[11rem] h-auto ml-3"
              />
            </Link>
            <div className="flex-container md:flex hidden items-center gap-4">
              {links.map((item, index) => (
                <small
                  onClick={() => navigate(item?.url)}
                  key={index}
                  className={`block cursor-pointer font-[400] text-[.8rem] ${desktopLinkColor}`}
                >
                  {item.name}
                </small>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile logo container - logo left, icon cluster right */}
        <div className="mobile-container md:hidden flex items-center justify-between w-full px-5">
          <Link to={"/"} className="cursor-pointer">
            <img
              src={mobileLogo}
              alt="Uptown Maison"
              className="w-[9.25rem] h-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpenSearch(true)} aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill={mobileIconColor}
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
            </button>
            {cartButton}
            <button
              onClick={() => (openSidebar ? closeSidebar() : setOpenSidebar(true))}
              aria-label={openSidebar ? "Close menu" : "Menu"}
            >
              {openSidebar ? (
                <IoClose color={mobileIconColor} size={26} />
              ) : (
                <RxHamburgerMenu color={mobileIconColor} size={24} />
              )}
            </button>
          </div>
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
          <div className="item-container cursor-pointer hidden md:flex items-center gap-1">
            {cartButton}
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

      {/* Main Navigation Sidebar */}
      <AnimatePresence>
        {openSidebar && (
          <motion.div
            className="overlay md:hidden block z-50 fixed h-screen w-full left-0 top-0"
            variants={menuOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="absolute md:hidden block h-screen pt-[6rem] px-6 w-full top-0 left-0 overflow-y-auto font-now">
              {activeSubmenu ? (
                <>
                  {/* Second level — title replaces the account row */}
                  <motion.button
                    className={`flex w-full items-center gap-3 py-4 cursor-pointer ${mobileLinkColor}`}
                    variants={menuItemVariants}
                    custom={0}
                    onClick={() => setActiveSubmenu(null)}
                    aria-label="Back to menu"
                  >
                    <IoChevronBack size={18} className="opacity-70" />
                    <span className="flex-1 text-center text-[1.05rem] font-bold uppercase tracking-[0.04em] pr-[18px]">
                      {activeSubmenu.name}
                    </span>
                  </motion.button>

                  <motion.div
                    className={`border-t mt-2 ${mobileDividerColor}`}
                    variants={menuItemVariants}
                    custom={0}
                  />

                  <div className="flex flex-col pt-8">
                    {activeSubmenu.submenu.map((sub, index) => (
                      <motion.button
                        key={sub.name}
                        className={`w-full py-[0.9rem] text-left text-[1.05rem] font-bold cursor-pointer ${mobileLinkColor}`}
                        variants={menuItemVariants}
                        custom={index + 1}
                        onClick={() => closeSidebarAndGo(sub.url)}
                      >
                        {sub.name}
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    className={`border-t mt-16 ${mobileDividerColor}`}
                    variants={menuItemVariants}
                    custom={activeSubmenu.submenu.length + 1}
                  />

                  {activeSubmenu.secondary && (
                    <div className="flex flex-col items-start pl-8 pt-6 pb-10">
                      {activeSubmenu.secondary.map((sub, index) => (
                        <motion.button
                          key={sub.name}
                          className={`py-[0.55rem] text-[0.8rem] font-bold uppercase tracking-[0.15em] cursor-pointer ${mobileLinkColor}`}
                          variants={menuItemVariants}
                          custom={activeSubmenu.submenu.length + 1 + index}
                          onClick={() => {
                            if (sub.isLogout) {
                              handleLogout();
                              closeSidebar();
                            } else {
                              closeSidebarAndGo(sub.url);
                            }
                          }}
                        >
                          {sub.name}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
              {/* Account row — greets the user when signed in */}
              <motion.button
                className={`flex w-full items-center justify-between py-4 cursor-pointer ${mobileLinkColor}`}
                variants={menuItemVariants}
                custom={0}
                onClick={() =>
                  user
                    ? setActiveSubmenu(accountSubmenu)
                    : closeSidebarAndGo("/signin")
                }
              >
                <span className="flex items-center gap-3">
                  <IoPersonOutline size={22} />
                  <span
                    className={
                      user
                        ? "text-[1.15rem] font-bold"
                        : "text-[1.05rem] font-bold uppercase tracking-[0.06em]"
                    }
                  >
                    {user
                      ? `Welcome, ${user.first_name || "there"}!`
                      : "Sign In/ Register"}
                  </span>
                </span>
                <IoChevronForward size={16} className="opacity-70" />
              </motion.button>

              <motion.div
                className={`border-t mt-5 ${mobileDividerColor}`}
                variants={menuItemVariants}
                custom={0}
              />

              <div className="nav-item-container flex flex-col pt-5">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    className={`flex w-full items-center justify-between py-[0.7rem] text-left cursor-pointer ${mobileLinkColor}`}
                    variants={menuItemVariants}
                    custom={index + 1}
                    onClick={() =>
                      item.submenu
                        ? setActiveSubmenu(item)
                        : closeSidebarAndGo(item.url)
                    }
                  >
                    <span className="text-[1.05rem] font-bold">
                      {item.name}
                    </span>
                    <IoChevronForward size={16} className="opacity-70" />
                  </motion.button>
                ))}
              </div>

              <motion.div
                className={`border-t mt-6 ${mobileDividerColor}`}
                variants={menuItemVariants}
                custom={menuItems.length + 1}
              />

              <div className="flex flex-col items-start pl-8 pt-6 pb-10">
                {secondaryItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    className={`py-[0.55rem] text-[0.8rem] font-bold uppercase tracking-[0.15em] cursor-pointer ${mobileLinkColor}`}
                    variants={menuItemVariants}
                    custom={menuItems.length + 1 + index}
                    onClick={() => closeSidebarAndGo(item.url)}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>
                </>
              )}
            </div>
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
