declare module "framer-motion" {
  import * as React from "react";

  export const motion: any;
  export const AnimatePresence: React.ComponentType<
    React.PropsWithChildren<{ mode?: "sync" | "wait" | "popLayout" }>
  >;
}
