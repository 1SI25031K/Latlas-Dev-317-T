"use client";

import { QRCodeSVG } from "qrcode.react";
import { buildClassJoinUrl } from "@/lib/class-join-qr";

type ClassJoinQrCodeProps = {
  accessCode: string;
  password?: string | null;
  size?: number;
};

export function ClassJoinQrCode({
  accessCode,
  password,
  size = 200,
}: ClassJoinQrCodeProps) {
  const url = buildClassJoinUrl(accessCode, password);
  return (
    <QRCodeSVG
      value={url}
      size={size}
      level="M"
      includeMargin={false}
      className="rounded border"
      style={{
        borderColor: "var(--dashboard-border)",
        backgroundColor: "white",
      }}
    />
  );
}
