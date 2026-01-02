import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
