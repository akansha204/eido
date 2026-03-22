'use client';

import { forwardRef } from 'react';
import { PaperData, PaperSection } from '@/context/PaperContext';

interface DocumentViewerProps {
  paper: PaperData;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

const DocumentViewer = forwardRef<HTMLDivElement, DocumentViewerProps>(
  ({ paper, sectionRefs }, ref) => {
    return (
      <div ref={ref} className="document-viewer flex-1 overflow-y-auto scroll-smooth">
        <article className="max-w-[680px] mx-auto px-6 md:px-10 py-10 md:py-14">
          {/* Paper header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                {paper.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                {paper.year}
              </span>
            </div>

            <h1
              className="text-3xl md:text-[2.6rem] leading-[1.15] tracking-tight text-slate-800 mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {paper.title}
            </h1>

            <p
              className="text-base text-slate-500 italic"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {paper.authors}
              <span className="mx-2 not-italic text-slate-300">•</span>
              {paper.institution}
            </p>
          </header>

          {/* Section divider */}
          <div className="w-16 h-px bg-slate-200 mb-10" />

          {/* Sections */}
          {paper.sections.map((section: PaperSection) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              className="mb-12 scroll-mt-6"
            >
              <h2
                className="text-xl md:text-2xl tracking-tight text-slate-800 mb-5 pb-2 border-b border-slate-100"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {section.heading}
              </h2>

              {section.content.split('\n\n').map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="text-[15px] md:text-base leading-[1.85] text-slate-600 mb-5 selection:bg-blue-100 selection:text-slate-800"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {/* End marker */}
          <div className="flex items-center justify-center py-8 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-slate-200" />
              <span className="text-[10px] font-medium tracking-[0.2em] text-slate-300 uppercase">
                End of Paper
              </span>
              <div className="w-8 h-px bg-slate-200" />
            </div>
          </div>
        </article>
      </div>
    );
  }
);

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer;
