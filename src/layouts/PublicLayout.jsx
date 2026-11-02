 import Navbar from "../components/landing/Navbar";
 import Footer from "../components/landing/Footer";
 import {Outlet } from "react-router-dom";
const PublicLayout = () => {
  return (
     <div className="font-sans antialiased">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
     </div>
   )
}

export default PublicLayout