// WorkingBackground.jsx - CSS Animation Background that actually works
import React from 'react';

const WorkingBackground = () => {
  // Tạo particles
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    direction: Math.random() > 0.5 ? 1 : -1,
  }));

  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    startX: Math.random() * 20 - 10,
    startY: Math.random() * 20 - 10,
  }));

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: `
            radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 50%, #0f3460 100%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)
          `,
          overflow: 'hidden',
        }}
      >
        {/* Floating particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`,
              borderRadius: '50%',
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `
                float-${particle.id % 4} ${particle.duration}s ease-in-out infinite,
                twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate
              `,
              animationDelay: `${particle.delay}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)',
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {stars.map(star => (
          <div
            key={`star-${star.id}`}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              background: 'white',
              borderRadius: '50%',
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              animation: `shooting-star-${star.id % 3} ${star.duration}s linear infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: `
                0 0 2px white,
                0 0 4px white,
                0 0 8px rgba(255, 255, 255, 0.5)
              `,
            }}
          />
        ))}
        
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 20, 147, 0.05) 0%, transparent 50%)
            `,
            animation: 'gradient-shift 15s ease-in-out infinite',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
          50% { transform: translateY(-10px) translateX(-15px) rotate(180deg); }
          75% { transform: translateY(-30px) translateX(5px) rotate(270deg); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(15px) translateX(-10px) rotate(120deg); }
          66% { transform: translateY(-25px) translateX(20px) rotate(240deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          20% { transform: translateY(-15px) translateX(8px); }
          40% { transform: translateY(-5px) translateX(-12px); }
          60% { transform: translateY(-20px) translateX(15px); }
          80% { transform: translateY(-10px) translateX(-8px); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-35px) translateX(25px) scale(1.2); }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes shooting-star-0 {
          0% { 
            transform: translateX(-50px) translateY(-50px) scale(0); 
            opacity: 0; 
          }
          10% { 
            transform: translateX(-40px) translateY(-40px) scale(1); 
            opacity: 1; 
          }
          90% { 
            transform: translateX(calc(100vw + 40px)) translateY(calc(100vh + 40px)) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(calc(100vw + 50px)) translateY(calc(100vh + 50px)) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes shooting-star-1 {
          0% { 
            transform: translateX(-30px) translateY(50vh) scale(0); 
            opacity: 0; 
          }
          10% { 
            transform: translateX(-20px) translateY(50vh) scale(1); 
            opacity: 1; 
          }
          90% { 
            transform: translateX(calc(100vw + 20px)) translateY(30vh) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(calc(100vw + 30px)) translateY(30vh) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes shooting-star-2 {
          0% { 
            transform: translateX(50vw) translateY(-30px) scale(0); 
            opacity: 0; 
          }
          10% { 
            transform: translateX(50vw) translateY(-20px) scale(1); 
            opacity: 1; 
          }
          90% { 
            transform: translateX(20vw) translateY(calc(100vh + 20px)) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translateX(20vw) translateY(calc(100vh + 30px)) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};

export default WorkingBackground;