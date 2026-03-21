'use client';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-5 w-full">
      <h1
        className="text-xl tracking-tight text-slate-800"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Eido
      </h1>
      <nav className="flex items-center gap-6">
        <button className="text-xs font-medium tracking-[0.15em] text-slate-500 hover:text-slate-800 transition-colors uppercase cursor-pointer">
          Sign In
        </button>
        <button className="text-xs font-medium tracking-[0.15em] uppercase bg-slate-700 text-white px-5 py-2.5 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer">
          Get Started
        </button>
      </nav>
    </header>
  );
}
