 import { Activity, ShieldCheck, Cpu, Layers} from "lucide-react";

const Pricing = () => {
 
  const telemetryStats = [
    { label: "Rendering Rate", val: "60 FPS" },
    { label: "Anatomical Layers", val: "12 Systems" },
    { label: "Diagnostic AI", val: "Active (v4.2)" },
  ];

  const features = [
    {
      icon: <Layers className="h-5 w-5 text-cyan-400" />,
      title: "Multi-Layer Visualization",
      desc: "Simultaneous skeletal, circulatory, and visceral inspection in real-time.",
    },
    {
      icon: <Cpu className="h-5 w-5 text-cyan-400" />,
      title: "Real-Time Neural Mapping",
      desc: "High-precision volumetric rendering powered by client-side WebGL.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-cyan-400" />,
      title: "DICOM & PACS Integration",
      desc: "Seamless synchronization directly from certified hospital databases.",
    },
  ];

  return (
    <section id="pricing" className="relative overflow-hidden  py-24 text-slate-100">
      

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            3D Holographic Engine
          </div>

          <h2 className="mt-5 text-4xl text-cyan-400 font-extrabold tracking-tight sm:text-5xl">
            Interactive Anatomical Modeling
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            High-resolution spatial diagnostics designed for comprehensive clinical review and patient care.
          </p>
        </div>

        {/* 3D Model Display Container */}
        <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950/80 p-3 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] backdrop-blur-xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#030712]">
            {/* The 3D Human Loop Video */}
            <video
              src="/images/gemini_generated_video_D81E6431.mp4" /* Replace with your video file path */
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-contain"
            />

            {/* Sci-Fi HUD Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/50" />

            {/* Top Bar HUD */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-black/60 px-3 py-1 font-mono text-xs text-cyan-400 backdrop-blur-md">
                 STATUS: BIOMETRIC RECONSTRUCTION ACTIVE
              </div>
              <div className="hidden rounded-lg border border-slate-800 bg-black/60 px-3 py-1 font-mono text-xs text-slate-400 backdrop-blur-md sm:block">
                SYS ID: BIO-HUMAN-3D
              </div>
            </div>

            {/* Interactive Layer Switches */}
            <div className="absolute bottom-5 left-5 hidden flex-wrap gap-2 md:flex">
              {["Full Scan", "Skeletal Grid", "Organ Systems"].map((layer) => (
                <div
                  key={layer}
                  // onClick={() => setActiveLayer(layer)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition `}
                >
                  {layer}
                </div>
              ))}
            </div>

            {/* Telemetry Stats on Video */}
            <div className="absolute bottom-5 right-5 flex gap-4 rounded-xl border border-slate-800/80 bg-black/70 px-4 py-2 font-mono text-xs text-slate-300 backdrop-blur-md">
              {telemetryStats.map((stat, i) => (
                <div key={i} className="text-right">
                  <span className="block text-[10px] text-slate-500">{stat.label}</span>
                  <span className="font-semibold text-cyan-400">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Below Video */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl  bg-[#015E7F] p-6 transition  hover:bg-deep-blue-950/40 hover:shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)]"
            >
              <div className="mb-4 inline-block rounded-xl border border-cyan-500/20 bg-cyan-950/40 p-2.5">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;