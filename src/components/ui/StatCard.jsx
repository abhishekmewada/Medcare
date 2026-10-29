 

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent = "text-blue-500",
  className="",
}) => {

 

  return (
    <div
      className={`
         ${className}
        group
        rounded-2xl
        border 
        
        
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-md
        
      `}
    >
      <div className="flex items-start justify-between">

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-slate-50
            ${accent}
            transition-transform
            duration-300
            group-hover:scale-105
            dark:bg-slate-800
          `}
        >
          <Icon size={20} />
        </div>

      </div>

      <div className="mt-5">

        <p className="
          text-[11px]
          font-semibold
          uppercase
          tracking-wider
          text-slate-400
        ">
          {label}
        </p>

        <p className="
          mt-1
          text-2xl
          font-bold
          tracking-tight
          
      
        ">
          {value}
        </p>

      </div>
    </div>
  );
};

export default StatCard;