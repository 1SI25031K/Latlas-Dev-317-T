"use client";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

type DashboardOnboardingOverlayProps = {
  children: React.ReactNode;
  needsOnboarding: boolean;
  locale: string;
};

export function DashboardOnboardingOverlay({
  children,
  needsOnboarding,
  locale,
}: DashboardOnboardingOverlayProps) {
  return (
    <>
      {children}
      {needsOnboarding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
          aria-modal="true"
          role="dialog"
          aria-label="Complete your profile"
        >
          <div className="max-h-[90vh] overflow-auto">
            <OnboardingForm locale={locale} />
          </div>
        </div>
      )}
    </>
  );
}
