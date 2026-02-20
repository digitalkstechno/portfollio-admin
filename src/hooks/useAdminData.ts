import { useState, useEffect } from 'react';
import { AdminData } from '../types/admin';

const STORAGE_KEY = 'portfolio_admin_data';

const defaultData: AdminData = {
  pin: '1234',
  websites: [
    {
      id: 'w1',
      title: 'Company Website',
      link: 'https://example.com',
      image: '/placeholder.png',
      description: 'Corporate site with landing and blog.',
      language: 'Next.js',
    },
    {
      id: 'w2',
      title: 'E-Commerce',
      link: 'https://shop.example.com',
      image: '/placeholder.png',
      description: 'Storefront and admin panel.',
      language: 'React, Node.js',
    }
  ],
  mobileApps: [
    {
      id: 'm1',
      title: 'Todo App',
      androidLink: 'https://play.example.com/todo',
      iosLink: 'https://apps.apple.com/todo',
      description: 'Personal productivity app',
      language: 'Flutter',
      software: 'Firebase',
      image: '/placeholder.png'
    }
  ],
  software: [
    {
      id: 's1',
      key: 'inv-mgr',
      title: 'Inventory Manager',
      description: 'Track stock and suppliers',
      link: 'https://example.com/inventory',
      image: '/placeholder.png'
    }
  ],
  digitalCards: [
    {
      id: 'dc1',
      title: 'Digital Visiting Card',
      description: 'Share contact digitally',
      link: 'https://example.com/dvc',
      image: '/placeholder.png'
    }
  ],
  digitalMarketing: [
    {
      id: 'dm1',
      title: 'Summer Campaign',
      description: 'Paid social growth plan',
      pageLink: 'https://example.com/campaign/summer',
      imageUrl: '/placeholder.png'
    }
  ],
  marketingClients: [
    {
      id: 'mc1',
      title: 'Acme Corp',
      description: 'Lead-gen via ads',
      link: 'https://acme.com',
      image: '/placeholder.png'
    }
  ]
};

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>(() => {
    if (typeof window === 'undefined') return defaultData;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AdminData = JSON.parse(stored);
        const allEmpty =
          parsed.websites.length === 0 &&
          parsed.mobileApps.length === 0 &&
          parsed.software.length === 0 &&
          parsed.digitalCards.length === 0 &&
          parsed.digitalMarketing.length === 0 &&
          parsed.marketingClients.length === 0;
        return allEmpty ? defaultData : parsed;
      }
    } catch {
      /* ignore */
    }
    return defaultData;
  });

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveData = (newData: AdminData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  return { data, saveData };
};
