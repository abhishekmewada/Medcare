import { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
 import { motion } from "framer-motion";
const Faq = () => {

     const faqs = [
  {
    id: 1,
    question: "Is my medical data secure?",
    answer:
      "Yes. All medical records are encrypted and securely stored following industry-standard security practices.",
  },
  {
    id: 2,
    question: "Can I get medical diagnoses from the AI?",
    answer:
      "Our AI provides health guidance and recommendations, but it should not replace professional medical advice.",
  },
  {
    id: 3,
    question: "Do doctors get their own dashboard?",
    answer:
      "Yes. Every doctor has a dedicated dashboard to manage appointments, patients, reports, and schedules.",
  },
  {
    id: 4,
    question: "How long does setup take?",
    answer:
      "Setup takes only a few minutes. Simply create an account and start using the platform immediately.",
  },
];

const containerVariants = {
  hidden : {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  }
}

const cardVariants = {
  hidden : { 
    opacity : 0,
    y: 50,
  },
  show: {
    opacity : 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="bg-[#F8FAFC] pb-54 py-24">
      <div className="mx-auto max-w-4xl px-5">

        {/* Heading */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[4px] text-blue-600 font-semibold">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold text-slate-900">
            Everything you'd want to ask.
          </h2>
        </div>

        {/* FAQ List */}
        <motion.div className="mt-14 space-y-5"
         variants={containerVariants} 
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
        >
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants= {cardVariants}
              className="overflow-hidden rounded-2xl bg-white shadow-md"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="flex w-full items-center justify-between px-6 py-6 text-left"
              >
                <span className="text-lg font-medium text-slate-800">
                  {faq.question}
                </span>

                {openId === faq.id ? (
                  <Minus
                    size={20}
                    className="text-slate-500"
                  />
                ) : (
                  <Plus
                    size={20}
                    className="text-slate-500"
                  />
                )}
              </button>

              {/* Answer */}
              <div
                className={`grid transition-all duration-300 ${
                  openId === faq.id
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-gray-500 leading-7">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
</div>
<div className="  mx-6 md:mx-12" >
        <div className="bg-blue-500 max-w-7xl mx-auto  flex flex-col gap-6 p-8 md:p-18 md:flex-row rounded-2xl  mt-18" >
            <div className="flex-1  text-white " >
              <h1  className="text-4xl font-bold pb-6 ">Ready to run care like it's 2026?</h1>
              <p>Start free. Onboard your clinic in a day. Delight patients from day one.</p>
            </div>
            <div className=" my-auto" >
                <button className="flex gap-2 text-center bg-white px-5 py-3 rounded-3xl" >
                    <a href="/login" className="text-blue-600 font-medium">
                        Get Started
                    </a>
                    <span> <ArrowRight size={20} /> </span>
                </button>
            </div>
        </div>
</div>
      
    </section>
  );
}

export default Faq;