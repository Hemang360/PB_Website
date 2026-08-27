"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import posthog from "posthog-js";

type Props = {
  authenticated: boolean;
  email: string | null;
  name: string | null;
  token: string | null;
};

export default function AuthInitializer({
  authenticated,
  email,
  name,
  token,
}: Props) {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    setAuth(authenticated, email, name, token);
  }, [authenticated, email, name, token, setAuth]);

  useEffect(() => {
    if (authenticated && email) {
      posthog.identify(email, { email, name });
    } else {
      posthog.reset();
    }
  }, [authenticated, email, name]);

  return null;
}
