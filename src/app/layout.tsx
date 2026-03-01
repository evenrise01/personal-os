import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "PersonalOS — Performance Operating System",
  description:
    "The operating system for high-agency individuals and freelancers. Drive clarity, increase output velocity, reduce cognitive overhead.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#059669",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorInputText: "#f4f4f5",
        },
      }}
    >
      <html lang="en" className={`${geist.variable} dark`}>
        <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
