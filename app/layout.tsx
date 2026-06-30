import type {Metadata} from 'next';
import './globals.css';
import { Providers } from './providers';
import { ServiceWorkerManager } from '@/components/ServiceWorkerManager';

export const metadata: Metadata = {
  title: 'TaskPilot AI',
  description: 'AI-powered productivity companion',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="h-full m-0 flex flex-col overflow-hidden font-sans text-slate-900 bg-white dark:bg-dark-bg dark:text-dark-text-primary transition-colors duration-300">
        <Providers>
          <ServiceWorkerManager />
          {children}
        </Providers>
      </body>
    </html>
  );
}
