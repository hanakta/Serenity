import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import CookieConsentWrapper from "@/components/CookieConsentWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "⚡ Serenity - Премиум Менеджер Задач",
  description: "Современный менеджер задач с премиум дизайном, мощными анимациями и интуитивным интерфейсом",
  keywords: ["задачи", "продуктивность", "менеджер", "todo", "tasks", "премиум", "дизайн"],
  authors: [{ name: "Serenity Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#22c55e",
  openGraph: {
    title: "⚡ Serenity - Премиум Менеджер Задач",
    description: "Современный менеджер задач с премиум дизайном и мощными анимациями",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "⚡ Serenity - Премиум Менеджер Задач",
    description: "Современный менеджер задач с премиум дизайном и мощными анимациями",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* Легкий анимированный градиентный фон */}
          <div 
            className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
                linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)
              `,
              animation: 'gradientShift 20s ease-in-out infinite'
            }}
          >
            {/* Плавающие частицы */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
              <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400/35 rounded-full animate-pulse" style={{animationDelay: '3s', animationDuration: '3.5s'}}></div>
            </div>
          </div>
          <div style={{position:'relative',zIndex:1}}>
            {children}
          </div>
          <CookieConsentWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}