// SimpleParticlesTest.jsx - Version để debug
import React, { useCallback, useEffect, useState } from 'react';

const SimpleParticlesTest = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Particles, setParticles] = useState(null);
  const [loadSlim, setLoadSlim] = useState(null);

  // Dynamic import để kiểm tra xem libraries có load được không
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        console.log('Đang load tsparticles libraries...');
        
        // Dynamic import
        const particlesModule = await import('@tsparticles/react');
        const slimModule = await import('@tsparticles/slim');
        
        console.log('Particles module:', particlesModule);
        console.log('Slim module:', slimModule);
        
        setParticles(particlesModule.Particles);
        setLoadSlim(() => slimModule.loadSlim);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading tsparticles:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadLibraries();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    console.log('Particles init called, engine:', engine);
    if (loadSlim) {
      await loadSlim(engine);
      console.log('LoadSlim completed');
    }
  }, [loadSlim]);

  const particlesLoaded = useCallback(async (container) => {
    console.log('Particles loaded, container:', container);
  }, []);

  // Cấu hình cực kỳ đơn giản
  const options = {
    fullScreen: {
      enable: false,
    },
    particles: {
      number: {
        value: 20, // Ít particles để test
      },
      color: {
        value: "#ff0000", // Màu đỏ để dễ thấy
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 1, // Opacity cao để dễ thấy
      },
      size: {
        value: 10, // Size lớn để dễ thấy
      },
      move: {
        enable: true,
        speed: 1,
      },
    },
    background: {
      color: {
        value: "#000000", // Nền đen để dễ thấy particles đỏ
      },
    },
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#222',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
      }}>
        Loading tsparticles...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#ff4444',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: -1,
      }}>
        <h2>Error loading tsparticles:</h2>
        <p>{error}</p>
        <p>Hãy kiểm tra console để xem chi tiết lỗi</p>
      </div>
    );
  }

  if (!Particles || !loadSlim) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#444',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
      }}>
        Particles or loadSlim not available
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
    }}>
      <Particles
        id="tsparticles-test"
        init={particlesInit}
        loaded={particlesLoaded}
        options={options}
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

export default SimpleParticlesTest;