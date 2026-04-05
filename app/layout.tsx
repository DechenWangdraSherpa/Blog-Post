import "../globals.css";
import { Inter } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata = {
  title: "Dw4ngSh3rs Blog",
  description: "Light from the quiet side — Dw4ngSh3rs",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Synchronously apply stored theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="pt-20 max-w-5xl mx-auto px-3 sm:px-4 md:px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
