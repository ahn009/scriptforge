import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScriptForge AI — Video Script Generator",
  description:
    "A jaw-droppingly beautiful AI video script generator. Shape a story, pick a tone, hit the length. Built for Blue Foxes AI Content Lab.",
  openGraph: {
    title: "ScriptForge AI — Video Script Generator",
    description:
      "AI-powered video script generator with a cinematic editorial feel. Dramatic, neutral, or uplifting — in 1 to 10 minute formats.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptForge AI — Video Script Generator",
    description:
      "AI-powered video script generator with a cinematic editorial feel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
