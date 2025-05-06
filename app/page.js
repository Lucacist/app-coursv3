"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // On va chercher le type de session pour rediriger intelligemment
    const checkRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.type === "prof") {
            router.replace("/admin");
          } else {
            router.replace("/cours");
          }
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };
    checkRole();
  }, [router]);
  return null;
}
