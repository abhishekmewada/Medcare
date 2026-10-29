import { Baby, BoneIcon, Brain, HeartPulse, Stars, Stethoscope } from "lucide-react"

 
const Specialties = () => {

    const specialties = [
        {
            id: 1,
            icon: <HeartPulse size={30} strokeWidth={2.5} />,
            title: "Cardiology",
            description: "Heart and blood vessel care, including diagnosis and treatment of heart conditions.",
        },
        {
            id: 2,
            icon: <Brain size={30} strokeWidth={2.5} />,
            title: "Neurology",
            description: "Diagnosis and treatment of disorders of the nervous system, including the brain and spinal cord.",
        },
        {
            id: 3,
            icon:  <Baby size={30} strokeWidth={2.5} />,
            title: "Pediatrics",
            description: "Comprehensive care for infants, children, and adolescents, including preventive care and treatment of illnesses.",

        },

        {
            id: 4,
            icon: <BoneIcon size={30} strokeWidth={2.5} />,
            title: "Orthopedics",
            description: "Care for musculoskeletal system, including bones, joints, muscles, and ligaments.",
        },
        {
            id: 5,
            icon: <Stars size={30} strokeWidth={2.5} />,
            title: "Dermatology",
            description: "Diagnosis and treatment of skin, hair, and nail conditions, including acne, eczema, and skin cancer.",
        },
        {
            id: 6,
            icon:   <Stethoscope size={30} strokeWidth={2.5} />,
            title: "General",
            description: "Comprehensive care for adults, including preventive care, diagnosis and treatment of common illnesses.",
        }

    ]

    
         
    

  return (
    <div className="w-full bg-[#F8FAFC] " >
        <div className="max-w-7xl mx-auto px-6 py-12  " >
             
                 <h6 className="text-xs text-[#2563EB] uppercase tracking-[2.4px] font-bold" >Specialties</h6>
                 <h2 className=" text-3xl sm:text-4xl mt-3 tracking-tight  font-bold " >Every department, expertly covered.</h2>
            <div className="flex flex-wrap gap-6 justify-center mt-10 " >
                {specialties.map((item) =>{ 
                      return( 
                    <div key ={item.id} className="w-44 h-36 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group" >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition">
                      <span className="text-cyan-600 group-hover:scale-110 transition-transform duration-300" >   {item.icon}  </span>
                  
                </div>

                <h3 className="text-[22px] font-medium text-slate-800">
                  {item.title}
                </h3>
                    </div>
                    )
                })}
            </div>

        </div>
    </div>
   )
}

export default Specialties