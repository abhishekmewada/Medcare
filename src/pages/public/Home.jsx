import Specialties from "../../components/common/Specialties";
import Doctor from "../../components/landing/Doctor";
import Faq from "../../components/landing/Faq";
import Hero from "../../components/landing/Hero";
import Pricing from "../../components/landing/Pricing";
import Service from "../../components/landing/Service";

 

const Home = () => {
  return (
    <main className="bg-gray-50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    
  
        <Hero />
        <section className="mt-12 flex flex-col space-y-8 lg:space-y-0   lg:gap-8">
          <Service />
          <Specialties />
        </section>
        <section className="mt-12">
          <Doctor />
        </section>
        <section className="mt-12">
          <Pricing />
        </section>
        <section className="mt-12">
          <Faq />
        </section>
      </div>
     </main>
  );
}

export default Home;