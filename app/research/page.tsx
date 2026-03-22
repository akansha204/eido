'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePaper } from '@/context/PaperContext';
import PaperSidebar from '@/components/research/PaperSidebar';
import DocumentViewer from '@/components/document/DocumentViewer';
import ChatPanel from '@/components/chat/ChatPanel';

export default function ResearchPage() {
  const router = useRouter();
  const { paperData } = usePaper();
  const [activeSection, setActiveSection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const viewerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Redirect if no paper data ── */
  useEffect(() => {
    if (!paperData) {
      router.push('/');
    }
  }, [paperData, router]);

  /* ── Set initial active section ── */
  useEffect(() => {
    if (paperData?.sections?.length && !activeSection) {
      setActiveSection(paperData.sections[0].id);
    }
  }, [paperData, activeSection]);

  /* ── Intersection Observer for scroll-based active section ── */
  useEffect(() => {
    if (!paperData) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Pick the one closest to the top
          const topEntry = visibleEntries.reduce((acc, entry) => {
            return entry.boundingClientRect.top < acc.boundingClientRect.top ? entry : acc;
          });
          const sectionId = topEntry.target.id.replace('section-', '');
          setActiveSection(sectionId);
        }
      },
      {
        root: viewerRef.current,
        rootMargin: '-10% 0px -60% 0px',
        threshold: 0,
      }
    );

    observerRef.current = observer;

    // Observe all section refs
    const timeout = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((el) => {
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [paperData]);

  /* ── Section click handler with smooth scroll ── */
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const target = sectionRefs.current[sectionId];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* ── Navigate back to landing page ── */
  const handleUploadNew = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!paperData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 tracking-wide">Loading paper...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top bar with branding + mobile toggles */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-md z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open paper navigation"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <h1
            className="text-lg tracking-tight text-slate-800 cursor-pointer"
            style={{ fontFamily: 'var(--font-serif)' }}
            onClick={() => router.push('/')}
          >
            Eido
          </h1>
        </div>

        {/* Mobile chat toggle */}
        <button
          onClick={() => setChatOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open research assistant"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </button>
      </header>

      {/* Main three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <PaperSidebar
          sections={paperData.sections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onUploadNew={handleUploadNew}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center Document Viewer */}
        <DocumentViewer
          ref={viewerRef}
          paper={paperData}
          sectionRefs={sectionRefs}
        />

        {/* Right Chat Panel */}
        <ChatPanel
          paperTitle={paperData.title}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </div>
    </div>
  );
}
