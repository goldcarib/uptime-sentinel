
"use client";

import { Suspense } from "react";
import { ResetPasswordForm } from "./form";

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
    </div>
  );
}
