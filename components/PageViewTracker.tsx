// components/PageViewTracker.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// This component will send page view data to a simple tracking API endpoint
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for non-browser environments
    if (typeof window === 'undefined') return;

    // Function to send the page view data
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    // Track the page view
    trackPageView();
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

// Usage:
// Add this component to your app's layout.tsx file so it's included on every page
// import PageViewTracker from '../components/PageViewTracker';
//
// export default function RootLayout({ children }) {
//   return (
//     <html>
//       <body>
//         {children}
//         <PageViewTracker />
//       </body>
//     </html>
//   );
// }