 import Navbar from "../components/landing/Navbar";
 import Footer from "../components/landing/Footer";
 import {Outlet } from "react-router-dom";
const PublicLayout = () => {
  return (
     <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
   )
}

export default PublicLayout