'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import UploadZone from '@/components/upload/UploadZone';
import SamplePaperCard, { SamplePaper } from '@/components/ui/SamplePaperCard';
import { usePaper } from '@/context/PaperContext';
import { parsePdf } from '@/lib/parsePdf';
const samplePapers: SamplePaper[] = [
  {
    id: 'kafka',
    category: 'DISTRIBUTED SYSTEMS',
    title: 'Kafka: a Distributed Messaging System for Log Processing',
    pages: 7,
    image: '/medicine-card.png',
    fileUrl: '/Kafka.pdf',
  },
  {
    id: 'raft',
    category: 'CONSENSUS ALGORITHM',
    title: 'In Search of an Understandable Consensus Algorithm',
    pages: 18,
    image: '/economics-card.png',
    fileUrl: '/raft.pdf',
  },
  {
    id: 'gfs',
    category: 'DISTRIBUTED SYSTEMS',
    title: 'The Google File System',
    pages: 15,
    image: '/sociology-card.png',
    fileUrl: '/google-file-system.pdf',
  },
];
export default function Home() {
  const router = useRouter();
  const { setPaperData } = usePaper();
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
      setIsParsing(true);
      setParseError(null);
      try {
        const paperData = await parsePdf(file);
        setPaperData(paperData);
        router.push('/research');
      } catch (err) {
        console.error('PDF parsing failed:', err);
        setParseError(
          'Failed to parse this PDF. Please try a different file.'
        );
        setIsParsing(false);
      }
    };
    const handleSampleSelect = async (paper: SamplePaper) => {
    console.log('Selected sample:', paper.title);
    if (!paper.fileUrl) {
      router.push('/research');
      return;
    }

    setIsParsing(true);
    setParseError(null);
    try {
      const response = await fetch(paper.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], paper.fileUrl.split('/').pop() || 'sample.pdf', { type: 'application/pdf' });
      const paperData = await parsePdf(file);
      setPaperData(paperData);
      router.push('/research');
    } catch (err) {
      console.error('PDF parsing failed:', err);
      setParseError('Failed to parse this sample PDF.');
      setIsParsing(false);
    }
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
            <section className="w-full max-w-2xl mx-auto mb-16 relative">
              {isParsing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mb-3" />
                  <p className="text-sm text-slate-500 tracking-wide" style={{ fontFamily: 'var(--font-serif)' }}>
                    Parsing your paper...
                  </p>
                </div>
              )}
              <UploadZone onFileSelect={handleFileUpload} />
              {parseError && (
                <p className="text-sm text-red-500 text-center mt-3">
                  {parseError}
                </p>
              )}
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
