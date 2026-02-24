import type { ReactNode } from "react";

import "../styles/index.css";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";

export const metadata = {
  title: "HMS Admin",
  description: "Hotel Management System Admin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

