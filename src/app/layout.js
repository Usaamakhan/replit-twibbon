import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientAuthProvider from "../components/ClientAuthProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import TimeoutWrapper from "../components/TimeoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Frame Your Voice - Twibbonize App",
  description: "Create and share frames that amplify your message, celebrate your cause, and inspire others to join in.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <TimeoutWrapper timeout={15000}>
            <ClientAuthProvider>
              {children}
            </ClientAuthProvider>
          </TimeoutWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
