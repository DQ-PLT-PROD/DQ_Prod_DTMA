import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";

interface FormLayoutProps {
  children: React.ReactNode;
  "data-id"?: string;
}

export function FormLayout({ children, "data-id": dataId }: FormLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--md-background)]" data-id={dataId}>
      <Header data-id={`${dataId}-header`} />
      <main className="flex-grow">{children}</main>
      <Footer isLoggedIn={false} data-id={`${dataId}-footer`} />
    </div>
  );
}
