import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function useSEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}: SEOProps = {}) {
  useEffect(() => {
    // 1. Title
    const defaultTitle = 'Shopping by Lina | Boutique Sport & Mode';
    const finalTitle = title ? `${title} | Shopping by Lina` : defaultTitle;
    document.title = finalTitle;

    // Helper to update or create meta tags
    const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      if (!content) return;
      const selector = isProperty 
        ? `meta[property="${nameOrProperty}"]` 
        : `meta[name="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Description
    const defaultDesc = 'Shopping by Lina - Boutique de Sport & Mode en ligne. Découvrez notre large sélection de vêtements, chaussures et accessoires de sport de haute qualité.';
    const finalDesc = description || defaultDesc;
    updateMeta('description', finalDesc);
    updateMeta('og:description', finalDesc, true);
    updateMeta('twitter:description', finalDesc);

    // 3. Title OG / Twitter
    updateMeta('og:title', finalTitle, true);
    updateMeta('twitter:title', finalTitle);

    // 4. Keywords
    if (keywords) {
      updateMeta('keywords', keywords);
    } else {
      updateMeta('keywords', 'Shopping by Lina, sport, mode, boutique en ligne, vêtements de sport, chaussures de sport, mode sportive, vêtements tendance, vêtements france');
    }

    // 5. Image (OG/Twitter require absolute URLs)
    if (image) {
      const absoluteImage = image.startsWith('http') 
        ? image 
        : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
      updateMeta('og:image', absoluteImage, true);
      updateMeta('twitter:image', absoluteImage);
    } else {
      // Default fallback logo/image
      updateMeta('og:image', `${window.location.origin}/logo.jpg`, true);
      updateMeta('twitter:image', `${window.location.origin}/logo.jpg`);
    }

    // 6. URL & Canonical Link
    const currentUrl = url || window.location.href;
    updateMeta('og:url', currentUrl, true);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 7. OG content type
    updateMeta('og:type', type, true);
    updateMeta('twitter:card', 'summary_large_image');

  }, [title, description, keywords, image, url, type]);
}
