import * as React from "react";
import { SVGMotionProps, motion } from "framer-motion";

const Path = (props: React.JSX.IntrinsicAttributes & SVGMotionProps<SVGPathElement> & React.RefAttributes<SVGPathElement>) => (
  <motion.path
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  />
);

export const MenuToggle = ({ toggle }: { toggle: () => void }) => (
  <button onClick={toggle} className="z-10 mr-[10px]">
    <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-zinc-600 dark:stroke-zinc-400">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" }
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 }
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" }
        }}
      />
    </svg>
  </button>
);
