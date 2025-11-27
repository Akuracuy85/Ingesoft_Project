import React from 'react';
import { useNavigate } from 'react-router-dom';
import fondo from '@/assets/fondo espacial.jpg';
import astronaut from '@/assets/Astronautaa.png';

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      aria-labelledby="error-404-title"
      role="region"
    >
      <style>{`\n        /* Astronaut floating */\n        @keyframes floatY {\n          0% { transform: translateY(0); }\n          50% { transform: translateY(-14px); }\n          100% { transform: translateY(0); }\n        }\n\n        /* Giant 404 glow + subtle blink */\n        @keyframes glowBlink {\n          0% { opacity: 0.12; filter: drop-shadow(0 0 18px rgba(204,130,32,0.6)); }\n          50% { opacity: 0.18; filter: drop-shadow(0 0 30px rgba(204,130,32,0.9)); }\n          100% { opacity: 0.12; filter: drop-shadow(0 0 18px rgba(204,130,32,0.6)); }\n        }\n\n        /* Background slow movement */\n        @keyframes bgMove {\n          0% { background-position: center 40%; }\n          50% { background-position: center 48%; }\n          100% { background-position: center 40%; }\n        }\n\n        /* Fade-in for heading */\n        @keyframes fadeInUp {\n          0% { opacity: 0; transform: translateY(10px); }\n          100% { opacity: 1; transform: translateY(0); }\n        }\n\n        .astronaut-anim { animation: floatY 4s ease-in-out infinite; }\n        .giant-404 { animation: glowBlink 3.5s ease-in-out infinite; }\n        .bg-animate { animation: bgMove 30s linear infinite; }\n        .fade-in-up { animation: fadeInUp 700ms ease-out both; }\n\n        /* Button glow on hover */\n        .btn-glow { transition: box-shadow 200ms ease, transform 150ms ease, background-color 150ms ease; }\n        .btn-glow:hover { box-shadow: 0 8px 30px rgba(204,130,32,0.28); transform: translateY(-2px); }\n\n        /* Make sure giant 404 doesn't capture pointer events */\n        .giant-404, .giant-404 * { pointer-events: none; }\n      `}</style>

      {/* Background movement wrapper */}
      <div className="absolute inset-0 bg-black/10 bg-animate" aria-hidden />

      {/* Giant 404 behind everything */}
      <span
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <span
          className="giant-404 text-[12vw] sm:text-[10vw] md:text-[14rem] font-extrabold leading-none"
          style={{ color: '#CC8220', opacity: 0.12, WebkitTextFillColor: '#CC8220', textShadow: '0 0 30px rgba(204,130,32,0.45), 0 0 80px rgba(204,130,32,0.18)' }}
        >
          404
        </span>
      </span>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <img
          src={astronaut}
          alt="Astronauta"
          className="astronaut-anim w-40 sm:w-56 md:w-72 mb-6"
          style={{ transform: 'translateY(-6%)' }}
        />

        <h1 id="error-404-title" className="fade-in-up text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4 drop-shadow-md">
          La página que has buscado no existe
        </h1>

        <button
          onClick={() => navigate('/')}
          className="btn-glow bg-[#CC8220] text-black px-5 py-3 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-[#CC8220]/40"
        >
          IR A LA PÁGINA PRINCIPAL
        </button>
      </div>
    </div>
  );
};

export default Error404;
