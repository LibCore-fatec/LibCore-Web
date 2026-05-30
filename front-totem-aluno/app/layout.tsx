import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conecta Aluno | Biblioteca",
  description: "Sistema do aluno para biblioteca autonoma inteligente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
