"use client";

import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";

interface TopNavProps {
  title?: string;
}

export function TopNav({ title }: TopNavProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {title && (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
