"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/context/CurrentUser";
import type { User } from "@/lib/types";

function HomeFeed({ user }: { user: User }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
    </main>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  useEffect(() => {
    // if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  return <HomeFeed user={user} />;
}
