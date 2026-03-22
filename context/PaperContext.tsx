'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface PaperSection {
  id: string;
  heading: string;
  content: string;
}

export interface PaperData {
  title: string;
  authors: string;
  institution: string;
  category: string;
  year: string;
  sections: PaperSection[];
}

interface PaperContextType {
  paperData: PaperData | null;
  setPaperData: (data: PaperData) => void;
  clearPaper: () => void;
}

const PaperContext = createContext<PaperContextType | undefined>(undefined);

export function PaperProvider({ children }: { children: ReactNode }) {
  const [paperData, setPaperDataState] = useState<PaperData | null>(null);

  const setPaperData = (data: PaperData) => {
    setPaperDataState(data);
  };

  const clearPaper = () => {
    setPaperDataState(null);
  };

  return (
    <PaperContext.Provider value={{ paperData, setPaperData, clearPaper }}>
      {children}
    </PaperContext.Provider>
  );
}

export function usePaper() {
  const context = useContext(PaperContext);
  if (context === undefined) {
    throw new Error('usePaper must be used within a PaperProvider');
  }
  return context;
}
