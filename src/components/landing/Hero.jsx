import { ArrowRight, BotMessageSquare, Check, Stars } from "lucide-react";

const Hero = () => {
  return (
    <section className="  relative overflow-hidden pt-36 pb-26  ">
      

      {/* Grid Background */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `
            linear-gradient([#F2F4F7] 1px, transparent 1px),
            linear-gradient(90deg, [#F2F4F7] 0.6px, transparent 0.6px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Blue Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-150 w-225 rounded-full bg-blue-400/20 blur-[150px] -z-10" />

      <div className="  max-w-7xl mx-auto px-6">

        <div className="  flex flex-col lg:flex-row items-start gap-10 lg:gap-6">

          {/* Left Side */}
          <div  data-aos="fade-up"
     data-aos-anchor-placement="top-bottom" className="lg:w-[58%]">

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 shadow-sm">
                 <Stars className="text-blue-600" size={14} strokeWidth={2.5} />
               <p className="text-sm text-gray-600">
                Built with Claude Sonnet 4.5 · AI-native clinic OS
              </p>
            </div>

            {/* Heading */}

            <h1 className="mt-8  text-[36px] md:text-[48px] lg:text-[72px] text-color:[#0F172A] font-bold leading-[1.05] tracking-tight text-slate-900">

              Care that <span className="text-blue-600">  thinks</span> , <br /> schedules, and heals.

            </h1>

            {/* Paragraph */}

            <p className="mt-8 max-w-2xl text-[18px] leading-7 text-gray-600">

              MedCare is the AI-native platform for modern clinics —
              appointments, prescriptions, medical records, video visits
              and a 24/7 assistant — designed with the elegance of Apple
              and the reliability of a hospital.

            </p>

            {/* Buttons */}

            <div className="mt-10 flex gap-5">

              <button className="rounded-full text-xs flex items-center bg-blue-600 md:px-8 px-3 py-2 text-white font-semibold hover:bg-blue-700 transition">

                Get Started Free  <span  >  <ArrowRight size={16} className="ml-2" /> </span>

              </button>

              <button className="rounded-full text-xs border border-gray-300  md:px-8 px-3 py-4 font-semibold hover:bg-blue-500/15 transition">

                Explore Features

              </button>

            </div>

            <div  className="mt-10 flex flex-row gap-3 text-gray-600 items-center text-lg">
                <p className="flex text-sm block" > <Check size={16} className="text-green-500 mr-2" /> HIPAA-ready</p>
                <p className="flex text-sm block"> <Check size={16} className="text-green-500 mr-2" /> SOC-2 (in progress)</p>
                <p className="flex text-sm block"> <Check size={16} className="text-green-500 mr-2" /> Loved by 1,200+ clinic</p>
            </div>
 

          </div>

          {/* Right Side */}

          <div  data-aos="fade-left" className="relative   lg:w-[42%]">

            <img
              src="/images/imgi_1_photo-1631217868264-e5b90bb7e133.jpg"
              alt="doctor"
              className="w-full shadow-2xl  h-150 object-cover rounded-[35px]"
            />

            {/* Floating Card */}

            <div className="absolute animate-pulse top-10 right-0 translate-x-8 rounded-3xl bg-white/50 px-6 py-5 shadow-2xl flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                <BotMessageSquare
                  size={22}
                  className="text-sky-600"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  AI · Dr.Care
                </p>
                <h4 className="font-semibold text-lg text-slate-900">
                  Answered in 0.4s
                </h4>
              </div>
            </div>

             <div className="absolute bottom-10 left-0 translate-x-8 rounded-3xl bg-white/50 px-6 py-5 shadow-2xl flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">

                <BotMessageSquare
                  size={22}
                  className="text-sky-600"
                />

              </div>

              <div>

                <p className="text-sm text-gray-500">

                  AI · Dr.Care

                </p>

                <h4 className="font-semibold text-lg text-slate-900">

                  Answered in 0.4s

                </h4>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;