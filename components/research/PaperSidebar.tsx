'use client';

import { useCallback } from 'react';
import { PaperSection } from '@/context/PaperContext';

/* ── Section icon mapping ── */
const sectionIcons: Record<string, React.ReactNode> = {
  abstract: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  introduction: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  methodology: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  results: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  discussion: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  conclusion: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
};

function getIcon(sectionId: string) {
  return sectionIcons[sectionId] || sectionIcons.abstract;
}

interface PaperSidebarProps {
  sections: PaperSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onUploadNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaperSidebar({
  sections,
  activeSection,
  onSectionClick,
  onUploadNew,
  isOpen,
  onClose,
}: PaperSidebarProps) {
  const handleSectionClick = useCallback(
    (sectionId: string) => {
      onSectionClick(sectionId);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) {
        onClose();
      }
    },
    [onSectionClick, onClose]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          paper-sidebar
          fixed top-0 left-0 h-full z-40
          w-[260px] bg-slate-50/80 backdrop-blur-md
          border-r border-slate-200/60
          flex flex-col
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0 lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Header */}
        <div className="px-6 pt-7 pb-4">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            Navigation
          </p>
          <p className="text-sm text-slate-500 mt-0.5" style={{ fontFamily: 'var(--font-serif)' }}>
            Paper Sections
          </p>
        </div>

        {/* Section links */}
        <nav className="flex-1 px-3 overflow-y-auto sidebar-scrollbar">
          <ul className="space-y-0.5">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={`
                      sidebar-nav-item
                      w-full flex items-center gap-3 px-3 py-2.5
                      rounded-md text-left text-[13px] font-medium
                      tracking-wide uppercase cursor-pointer
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-white text-slate-800 shadow-sm border-l-[3px] border-slate-700 pl-2.5'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-white/60 border-l-[3px] border-transparent'
                      }
                    `}
                  >
                    <span className={`transition-colors duration-200 ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                      {getIcon(section.id)}
                    </span>
                    <span>{section.heading}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upload New PDF button */}
        <div className="p-4 mt-auto">
          <button
            onClick={onUploadNew}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-3 rounded-lg
              bg-slate-700 text-white text-xs font-semibold
              tracking-[0.12em] uppercase
              hover:bg-slate-800 active:scale-[0.98]
              transition-all duration-200
              cursor-pointer shadow-sm
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Upload New PDF
          </button>
        </div>
      </aside>
    </>
  );
}
