
"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatBubble({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
      size="icon"
    >
      <MessageCircle className="h-8 w-8" />
    </Button>
  );
}
