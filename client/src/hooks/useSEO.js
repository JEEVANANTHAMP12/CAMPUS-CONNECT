import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage document head SEO tags and Schema.org JSON-LD
 *
 * @param {Object} options
 * @param {string} options.title - Page title (will append ' | MKCE Connect')
 * @param {string} options.description - Meta description
 * @param {string} [options.keywords] - Meta keywords
 * @param {string} [options.canonical] - Canonical path (e.g. '/clubs')
 * @param {string} [options.ogType] - OpenGraph type ('website', 'article', etc.)
 * @param {string} [options.ogImage] - OpenGraph image URL
 * @param {Object} [options.jsonLd] - Schema.org structured data object
 */
export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = 'https://mkce.ac.in/favicon.svg',
  jsonLd,
}) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? `${title} | MKCE Connect - M. Kumarasamy College of Engineering`
      : 'MKCE Connect | M. Kumarasamy College of Engineering Digital Campus';
    document.title = formattedTitle;

    // Helper to create or update meta tag
    const setMeta = (selector, attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Update Standard Meta Tags
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
    }
    if (keywords) {
      setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    // 3. Update Canonical Tag
    const fullCanonicalUrl = canonical
      ? `https://mkce.ac.in${canonical.startsWith('/') ? canonical : `/${canonical}`}`
      : 'https://mkce.ac.in/';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // 4. Update OpenGraph Tags
    setMeta('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    if (description) {
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    }
    setMeta('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);

    // 5. Update Twitter Tags
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    if (description) {
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 6. Dynamic JSON-LD Structured Data
    let scriptTag = document.getElementById('dynamic-page-jsonld');
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-page-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup on unmount
      const tag = document.getElementById('dynamic-page-jsonld');
      if (tag) tag.remove();
    };
  }, [title, description, keywords, canonical, ogType, ogImage, jsonLd]);
}

export default useSEO;
