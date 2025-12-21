import { useEffect, useState } from 'react';

type HeadingLabels = {
  appNamePrimary: string;
  appNameAccent: string;
  heroTitle: string;
  galleryTitle: string;
  supportTitle: string;
  aboutTitle: string;
  developedByTitle: string;
  demoTitle: string;
  demoExampleTitle: string;
  demoFrontCoverTitle: string;
  demoBackCoverTitle: string;
  resultsFrontCoverTitle: string;
  resultsBackCoverTitle: string;
  searchFormTitle: string;
};

const labelsByLocale: Record<string, HeadingLabels> = {
  en: {
    appNamePrimary: 'Cover',
    appNameAccent: 'Quest',
    heroTitle: 'Discover Book Covers',
    galleryTitle: 'Explore Example Covers',
    supportTitle: 'Support CoverQuest',
    aboutTitle: 'About CoverQuest',
    developedByTitle: 'Developed by',
    demoTitle: 'See How It Works',
    demoExampleTitle: 'Example: Describe Your Book in 5 Sentences',
    demoFrontCoverTitle: 'Front Cover',
    demoBackCoverTitle: 'Back Cover',
    resultsFrontCoverTitle: 'Front Cover Artwork',
    resultsBackCoverTitle: 'Back Cover Artwork',
    searchFormTitle: 'AI Cover Generator'
  },
  es: {
    appNamePrimary: 'Cover',
    appNameAccent: 'Quest',
    heroTitle: 'Descubre portadas de libros',
    galleryTitle: 'Explora portadas de ejemplo',
    supportTitle: 'Apoya CoverQuest',
    aboutTitle: 'Acerca de CoverQuest',
    developedByTitle: 'Desarrollado por',
    demoTitle: 'Mira cómo funciona',
    demoExampleTitle: 'Ejemplo: Describe tu libro en 5 frases',
    demoFrontCoverTitle: 'Portada frontal',
    demoBackCoverTitle: 'Contraportada',
    resultsFrontCoverTitle: 'Arte de portada frontal',
    resultsBackCoverTitle: 'Arte de contraportada',
    searchFormTitle: 'Generador de portadas con IA'
  },
  fr: {
    appNamePrimary: 'Cover',
    appNameAccent: 'Quest',
    heroTitle: 'Découvrez des couvertures de livres',
    galleryTitle: 'Explorez des couvertures exemples',
    supportTitle: 'Soutenir CoverQuest',
    aboutTitle: 'À propos de CoverQuest',
    developedByTitle: 'Développé par',
    demoTitle: 'Voir comment ça marche',
    demoExampleTitle: 'Exemple : décrivez votre livre en 5 phrases',
    demoFrontCoverTitle: 'Couverture avant',
    demoBackCoverTitle: 'Quatrième de couverture',
    resultsFrontCoverTitle: 'Illustration de la couverture avant',
    resultsBackCoverTitle: 'Illustration de la couverture arrière',
    searchFormTitle: 'Générateur de couvertures IA'
  },
  de: {
    appNamePrimary: 'Cover',
    appNameAccent: 'Quest',
    heroTitle: 'Entdecke Buchcover',
    galleryTitle: 'Beispielcover entdecken',
    supportTitle: 'Unterstütze CoverQuest',
    aboutTitle: 'Über CoverQuest',
    developedByTitle: 'Entwickelt von',
    demoTitle: 'So funktioniert es',
    demoExampleTitle: 'Beispiel: Beschreibe dein Buch in 5 Sätzen',
    demoFrontCoverTitle: 'Vorderseite',
    demoBackCoverTitle: 'Rückseite',
    resultsFrontCoverTitle: 'Coverkunst vorne',
    resultsBackCoverTitle: 'Coverkunst hinten',
    searchFormTitle: 'KI-Cover-Generator'
  }
};

const getPreferredLocale = () => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const [primaryLanguage] = navigator.languages ?? [];
  const language = primaryLanguage || navigator.language || 'en';
  return language.toLowerCase();
};

const getLabelsForLocale = (locale: string): HeadingLabels => {
  const normalized = locale.toLowerCase();
  if (labelsByLocale[normalized]) {
    return labelsByLocale[normalized];
  }

  const baseLocale = normalized.split('-')[0];
  return labelsByLocale[baseLocale] ?? labelsByLocale.en;
};

export const useHeadingLabels = (): HeadingLabels => {
  const [labels, setLabels] = useState<HeadingLabels>(() =>
    getLabelsForLocale(getPreferredLocale())
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateLabels = () => {
      setLabels(getLabelsForLocale(getPreferredLocale()));
    };

    window.addEventListener('languagechange', updateLabels);
    return () => window.removeEventListener('languagechange', updateLabels);
  }, []);

  return labels;
};
