'use client';

import Header from '@/components/layout/Header';
import UploadZone from '@/components/upload/UploadZone';
import SamplePaperCard, { SamplePaper } from '@/components/ui/SamplePaperCard';

const samplePapers: SamplePaper[] = [
  {
    id: 'medicine',
    category: 'MEDICINE',
    title: 'AI in Healthcare: Diagnostic Paradigms',
    pages: 14,
    image: '/medicine-card.png',
  },
  {
    id: 'economics',
    category: 'ECONOMICS',
    title: 'Climate Change Economics: Policy Shifts',
    pages: 28,
    image: '/economics-card.png',
  },
  {
    id: 'sociology',
    category: 'SOCIOLOGY',
    title: 'The Digital Self: Urban Connectivity',
    pages: 19,
    image: '/sociology-card.png',
  },
];

export default function Home() {
  const handleFileUpload = (file: File) => {
    console.log('Uploaded file:', file.name);
    // TODO: navigate to /paper with the uploaded file
  };

  const handleSampleSelect = (paper: SamplePaper) => {
    console.log('Selected sample:', paper.title);
    // TODO: navigate to /paper with the sample paper
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6">
        <section className="w-full max-w-3xl mx-auto text-center mt-8 mb-12">
          <h2
            className="text-5xl md:text-[3.4rem] leading-[1.15] tracking-tight text-slate-800 mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Welcome to your{' '}
            <em className="not-italic italic">Research</em>
            <br />
            <em className="italic">Paper Companion</em>
          </h2>
          <p
            className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            A dedicated space for deep reading and intelligent exploration.
            <br />
            Turn complex manuscripts into actionable insights.
          </p>
        </section>

        {/* Upload Zone */}
        <section className="w-full max-w-2xl mx-auto mb-16">
          <UploadZone onFileSelect={handleFileUpload} />
        </section>

        {/* Sample Papers Divider */}
        <div className="w-full max-w-3xl mx-auto mb-10">
          <p className="divider-text text-[11px] font-medium tracking-[0.18em] text-slate-400 uppercase text-center">
            Don&apos;t have a paper handy? Try one of our samples:
          </p>
        </div>

        {/* Sample Paper Cards */}
        <section className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {samplePapers.map((paper) => (
            <SamplePaperCard
              key={paper.id}
              paper={paper}
              onClick={handleSampleSelect}
            />
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-slate-100">
        <div className="w-10 h-px bg-slate-300 mx-auto mb-5" />
        <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400 uppercase">
          Eido © 2026
        </p>
      </footer>
    </div>
  );
}
