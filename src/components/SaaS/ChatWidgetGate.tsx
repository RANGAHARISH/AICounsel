"use client";

import { usePathname } from "next/navigation";
import AIChatWidget from "@/components/SaaS/AIChatWidget";

export default function ChatWidgetGate() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return <AIChatWidget />;
}
