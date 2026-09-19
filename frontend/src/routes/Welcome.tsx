import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedGradient from '../components/ui/animated-gradient';

function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return narrow;
}

export const Welcome = () => {
  const navigate = useNavigate();
  const narrow = useNarrow();

  return (
    <section className="relative min-h-[92svh] w-full md:min-h-[720px] bg-black">
      <AnimatedGradient
        className="w-full h-full"
      >
        <div className="flex h-full min-h-[92svh] items-start px-6 pt-14 sm:px-10 md:min-h-[720px] md:items-center md:pt-0 lg:px-20">
          <div className="max-w-[34rem] z-10 relative">
            <h1 className="text-[2.5rem] font-light leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
              SentinelFlow
            </h1>

            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-white/60 md:mt-7">
              See the attack. Understand the risk. Stop it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </AnimatedGradient>
    </section>
  );
};
