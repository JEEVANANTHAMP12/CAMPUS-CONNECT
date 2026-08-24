import { useSEO } from '../hooks/useSEO';

/**
 * Declarative SEO Component
 * Place at the top of any page component to automatically update document metadata.
 */
export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = 'https://mkce.ac.in/favicon.svg',
  jsonLd,
}) {
  useSEO({
    title,
    description,
    keywords,
    canonical,
    ogType,
    ogImage,
    jsonLd,
  });

  return null;
}
