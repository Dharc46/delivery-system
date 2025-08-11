// src/components/DynamicBackground.jsx
import React, { useCallback } from 'react';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const DynamicBackground = ({ className, particleOptions }) => {
  const particlesInit = useCallback(async (engine) => {
    console.log('Particles initializing...'); // Debug log
    await loadSlim(engine);
    console.log('Particles initialized successfully'); // Debug log
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    console.log('Particles loaded:', container); // Debug log
  }, []);

  // Cấu hình mặc định
  const defaultOptions = {
    fullScreen: {
      enable: false, // Quan trọng: không sử dụng fullscreen
      zIndex: -1,
    },
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          area: 800,
        },
      },
      color: {
        value: '#ffffff',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.5,
        random: false,
      },
      size: {
        value: { min: 1, max: 5 },
        random: true,
      },
      links: {
        enable: true,
        distance: 150,
        color: '#ffffff',
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: false,
        straight: false,
        outModes: {
          default: 'bounce',
        },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    retina_detect: true,
    background: {
      color: {
        value: '#000011', // Màu nền tối để dễ thấy particles
      },
    },
    ...particleOptions,
  };

  return (
    <div className={className} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={defaultOptions}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default DynamicBackground;