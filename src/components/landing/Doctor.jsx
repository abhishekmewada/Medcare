  
   import {
  HeartPulse,
  Brain,
  Baby,
  Star,
} from "lucide-react";
import {motion} from "framer-motion";
const Doctor = () => {
  
const features = [
  {
    image: "/images/imgi_38_bookonline_1_aGc4xkt.width-734.png", // Replace with actual image path
    description: "Same/next-day appointments, in person or over video, that start on time",
    linkText: "Learn more",
    linkUrl: "#"
  },
  {
    image: "/images/imgi_39_sofa-conversation_1.width-734.png",
    description: "Longer appointments so you don’t feel rushed",
    linkText: "Discover the difference",
    linkUrl: "#"
  },
  {
    image: "/images/imgi_40_Group_163.width-734.png",
    description: "Drop-in lab services at our offices to save you extra trips",
    linkText: "Explore lab services",
    linkUrl: "#"
  },
  {
    image: "/images/imgi_41_HomepageServicesRTB_Image_221018_1.width-734.png",
    description: "Covering everything from physicals and chronic care to mental health",
    linkText: "Explore care",
    linkUrl: "#"
  },
  {
    image: "/images/imgi_42_usa_illo_gQAtRvn.width-734.png",
    description: "Primary care offices in many  cities",
    linkText: "Visit us",
    linkUrl: "#"
  },
  {
    image: "/images/imgi_43_exceptionalproviders2.width-734.png",
    description: "Compassionate providers who are experts at medicine and caring",
    linkText: "Find a provider",
    linkUrl: "#"
  }
];

const doctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Cardiology",
    experience: "12+ Years",
    rating: 4.9,
    patients: "2.5k+",
    image: "/images/imgi_1_photo-1631217868264-e5b90bb7e133.jpg",
    icon: HeartPulse,
  },
  {
    id: 2,
    name: "Dr. Meera Iyer",
    specialty: "Pediatrics",
    experience: "10+ Years",
    rating: 4.9,
    patients: "1.8k+",
    image: "/images/imgi_2_pexels-photo-7579823.jpg",
    icon: Baby,
  },
  {
    id: 3,
    name: "Dr. Arjun Verma",
    specialty: "Neurology",
    experience: "15+ Years",
    rating: 4.8,
    patients: "3k+",
    image: "/images/imgi_3_photo-1559839734-2b71ea197ec2.jpg",
    icon: Brain,
  },
  {
    id: 4,
    name: "Dr. Ananya Kapoor",
    specialty: "Dermatology",
    experience: "8+ Years",
    rating: 4.9,
    patients: "1.6k+",
    image: "/images/imgi_4_pexels-photo-7578797.jpg",
    icon: HeartPulse,
  },
  {
    id: 5,
    name: "Dr. Rohan Malhotra",
    specialty: "Orthopedics",
    experience: "13+ Years",
    rating: 4.7,
    patients: "2.2k+",
    image: "/images/imgi_5_photo-1580489944761-15a19d654956.jpg",
    icon: Brain,
  },
  {
    id: 6,
    name: "Dr. Neha Singh",
    specialty: "General Medicine",
    experience: "9+ Years",
    rating: 4.9,
    patients: "4k+",
    image: "/images/imgi_6_photo-1625241152315-4a698f74ceb7.jpg",
    icon: Baby,
  },
];


  return (
    <div id="doctors" className="w-full bg-[#F8FAFC]" >
        <div className="max-w-7xl isolate relative mx-auto px-6 py-12  " >
           
              {/* Background decorative shape */}
  <div
    className="absolute right-[5%] top-[10%]
    h-100 opacity-20 w-[85%]  -z-10
    rounded-[100px_80px_100px_120px]
    bg-[#F5D8A7]
    -rotate-12"
    
  />
  <section class="text-center py-8 z-10  px-6">
  <h2 class="font-serif z-50 text-[#004d49]   text-4xl sm:text-5xl md:text-7xl tracking-tight leading-[1.15]  max-w-4xl mx-auto mb-6">
    Get care today for <br class="hidden sm:inline" />
    <span class="text-[#198d71]">that weird rash</span>
  </h2>
  <a
    href="#services"
    class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#198d71] hover:text-[#136b56] transition-colors group"
  >
    <span>See all our services on top</span>
    <span class="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rsaquo;</span>
  </a>
</section>

 <section class="text-center py-12 px-4">
  <h2 class="font-serif text-[#004d49] text-4xl sm:text-5xl md:text-7xl tracking-tight leading-[1.15] max-w-3xl mx-auto mb-6">
    Fall in love with your <br class="hidden sm:inline" /> doctor’s  
    office
  </h2>
  <p class="text-[#35635f] text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
    We accept most major health insurance plans for scheduled in-office and remote visits just like a typical doctor’s office, but we make it faster, easier, and more enjoyable to get care.
  </p>
  <a
    href="#insurance"
    class="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#198d71] hover:text-[#136b56] transition-colors group"
  >
    <span>See if we're in network with your insurance</span>
    <span class="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">&rsaquo;</span>
  </a>
</section>

              <h6 className="text-xs text-[#2563EB] uppercase tracking-[2.4px] font-bold" >Specialties</h6>
                 <h2 className=" text-3xl sm:text-4xl mt-3 tracking-tight  font-bold " >Every department, expertly covered.</h2>

        <div className="  py-20  overflow-hidden " >
            <motion.div  className="flex w-max gap-6  marquee "
            
        animate={{
          x: ["0%", "-50%"],
        }}
        
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity,
        }} > 
  {
    doctors.map((doctor) => (
        // <div key={doctor.id} >
            <div key={doctor.id} className="w-xs md:w-sm overflow-hidden shrink-0 rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Image */}
      <div className="overflow-hidden">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="h-51.25 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {doctor.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {doctor.specialty}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
          <Star
            size={14}
            className="fill-amber-400 text-amber-400"
          />

          <span className="text-sm font-medium text-slate-700">
            {doctor.rating}
          </span>
        </div>
      </div>
    </div>

        // </div>
    )
        
    )
  }
</motion.div>
        </div>


        {/* images and all services */}
        <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {features.map((item, index) => (
          <div key={index} className="flex flex-col  items-start md:items-center text-center max-w-xs mx-auto">
            <img 
              src={item.image} 
              alt="" 
              className="h-24 w-auto  object-contain mb-6" 
            />
            <p className="text-[#1f5f5b] text-base leading-relaxed mb-3">
              {item.description}
            </p>
            
          </div>
        ))}
      </div>
    </section>
        </div>
    </div>
   )
}

export default Doctor