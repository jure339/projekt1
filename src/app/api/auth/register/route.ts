import { createRegisterHandler } from "@/lib/registerHandler";

// Route samo delegira na skupni handler (logicno jedro je v /lib).
export const POST = createRegisterHandler();
