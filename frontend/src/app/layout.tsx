import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

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
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}