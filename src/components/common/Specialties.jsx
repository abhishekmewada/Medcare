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
             
                 <h6 className="text-xs font-bold uppercase tracking-[2.4px] text-[#2563EB]">Specialties</h6>
                 <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Every department, expertly covered.</h2>
            <div className="relative mx-auto mt-8 max-w-xl pl-9 sm:hidden">
                <span aria-hidden="true" className="absolute bottom-7 left-[13px] top-6 w-px bg-cyan-200" />

                <div className="relative flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white">
                        <Stethoscope size={16} aria-hidden="true" />
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Care specialties</h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">Explore the areas of care we offer</p>
                    </div>
                </div>

                <ul className="mt-3 space-y-3">
                    {specialties.map((item) => (
                        <li key={item.id} className="relative">
                            <span aria-hidden="true" className="absolute -left-[25px] top-6 w-6 border-t border-cyan-200" />
                            <article className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-colors hover:border-cyan-200">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                    {item.icon}
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-10 hidden flex-wrap justify-center gap-6 sm:flex">
                {specialties.map((item) =>{ 
                      return( 
                    <div key ={item.id} className="w-44 h-36 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group" >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-5 group-hover:bg-cyan-100 transition">
                      <span className="text-cyan-600 group-hover:scale-110 transition-transform duration-300" >   {item.icon}  </span>
                  
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
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