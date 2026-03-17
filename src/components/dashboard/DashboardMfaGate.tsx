"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnrollMFA } from "@/components/auth/EnrollMFA";

type DashboardMfaGateProps = {
  children: React.ReactNode;
};

export function DashboardMfaGate({ children }: DashboardMfaGateProps) {
  const router = useRouter();
  const [showEnrollment, setShowEnrollment] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa
      .listFactors()
      .then(({ data, error }) => {
        if (error) {
          setShowEnrollment(false);
          return;
        }
        const hasTotp = (data?.totp?.length ?? 0) > 0;
        setShowEnrollment(!hasTotp);
      });
  }, []);

  function handleEnrolled() {
    setShowEnrollment(false);
    router.refresh();
  }

  if (showEnrollment === null) {
    return null;
  }

  if (showEnrollment) {
    return <EnrollMFA onEnrolled={handleEnrolled} />;
  }

  return <>{children}</>;
}
