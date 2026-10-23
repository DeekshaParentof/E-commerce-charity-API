import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Addresses from "./pages/Addresses";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
