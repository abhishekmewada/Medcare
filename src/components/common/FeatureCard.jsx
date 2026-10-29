const FeatureCard = ({
  icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`
        ${className}
      
        rounded-3xl
        p-7
        border
        
         
        hover:-translate-y-1
        hover:shadow-xl
        transition-all
        duration-300
      `}
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-gray-500 leading-7">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;