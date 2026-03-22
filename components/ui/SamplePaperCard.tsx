'use client';

import Image from 'next/image';

export interface SamplePaper {
  id: string;
  category: string;
  title: string;
  pages: number;
  image: string;
  fileUrl?: string;
}

interface SamplePaperCardProps {
  paper: SamplePaper;
  onClick?: (paper: SamplePaper) => void;
}

export default function SamplePaperCard({ paper, onClick }: SamplePaperCardProps) {
  return (
    <button
      onClick={() => onClick?.(paper)}
      className="sample-card group text-left rounded-lg overflow-hidden bg-white border border-slate-200 hover:border-slate-300 cursor-pointer"
    >
      {/* Card Image */}
      <div className="relative w-full h-32 overflow-hidden">
        <Image
          src={paper.image}
          alt={paper.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 pb-5">
        <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-1.5">
          {paper.category}
        </p>
        <h3
          className="text-[15px] leading-snug text-slate-800 mb-3"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {paper.title}
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span className="text-[11px] font-medium tracking-wide uppercase">
            {paper.pages} Page PDF
          </span>
        </div>
      </div>
    </button>
  );
}
