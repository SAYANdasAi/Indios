import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SanityLive } from "@/sanity/lib/live";
import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import ChatBot from "@/components/ChatBot";
import { DisableDraftMode } from "@/components/DisableDraftMode";

export const metadata: Metadata = {
  title: "Indios Store",
  description: "Your one-stop shop for all things Indios",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDraftMode = await draftMode();

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {isDraftMode.isEnabled && (
            <>
              <DisableDraftMode />
              <VisualEditing />
            </>
          )}
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <ChatBot />
          </div>
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
