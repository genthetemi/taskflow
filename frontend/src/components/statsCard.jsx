import { useEffect, useRef, useState } from 'react';

const StatsCard = ({ title, value, variant, icon }) => {
    const [display, setDisplay] = useState(value || 0);
    const rafRef = useRef();

    useEffect(() => {
      let start = 0;
      const target = Number(value) || 0;
      if (target === 0) {
        setDisplay(0);
        return;
      }
      const duration = 700;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(progress * (target - start) + start);
        setDisplay(current);
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
    }, [value]);

    return (
      <div className={`card border-left-${variant} shadow h-100 py-2`}>
        <div className="card-body">
          <div className="row no-gutters align-items-center">
            <div className="col mr-2">
              <div className={`text-xs font-weight-bold text-${variant} text-uppercase mb-1`}>
                {title}
              </div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">{display}</div>
            </div>
            <div className="col-auto">
              <i className={`fas ${icon} fa-2x text-gray-300`}></i>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default StatsCard;