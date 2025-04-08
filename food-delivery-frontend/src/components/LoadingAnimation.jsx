import { useEffect, useState } from "react";

const LoadingAnimation = () => {
  const letters = "FoodDelivery".split('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % letters.length);
    }, 200);
    return () => clearInterval(interval);
  }, [letters.length]);

  const getColor = (index) => {
    const distance = Math.abs(index - activeIndex);
    if (distance === 0) return 'text-indigo-600';
    if (distance < 3) return 'text-purple-500';
    if (distance < 6) return 'text-pink-500';
    return 'text-gray-400';
  };

  return (
    <div className="flex justify-center items-center h-60 ">
      <div className="text-4xl font-bold tracking-wider">
        {letters.map((letter, index) => (
          <span 
            key={index} 
            className={`transition-colors duration-300 text-sm caveat ${getColor(index)}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};
export default LoadingAnimation;