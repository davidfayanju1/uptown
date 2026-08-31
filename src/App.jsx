import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Product from "./pages/Product";
import ProductDetails from "./pages/ProductDetails";
import Explore from "./pages/Explore";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import NotFoundPage from "./pages/404";
import Registry from "./pages/Registry";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ScrollToTop from "./lib/ScrollToTop";
import Otp from "./pages/Otp";
import { queryClient } from "./lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Orders from "./pages/orders";
import ForgotPassword from "./pages/forgot-password";
import PaymentCallback from "./pages/PaymentCallback";
import GuestOrder from "./pages/GuestOrder";
import DailyProject from "./pages/DailyProject";
import GiftMessage from "./pages/GiftMessage";
import About from "./pages/About";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Toaster richColors closeButton className="p-2" expand />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/product" element={<Product />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/about" element={<About />} />
          <Route path="/daily-project" element={<DailyProject />} />
          <Route path="/gift-message" element={<GiftMessage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/order/:reference" element={<GuestOrder />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
