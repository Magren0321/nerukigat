import * as React from "react";
import { motion, useCycle } from "framer-motion";
import { MenuToggle } from "./MenuToggle";

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height + 100}px at calc(100% - 1.25rem - 20px) calc(1.25rem + 10px))`,
    transition: {
      type: "spring",
      stiffness: 40,
      restDelta: 2,
    }
  }),
  closed: {
    clipPath: "circle(20px at calc(100% - 1.25rem - 20px) calc(1.25rem + 10px))",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  }
};

export const Dialog = ( { children } : { children: React.ReactNode }) => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const [clientHeight, setClientHeight] = React.useState(0);

  React.useEffect(() => {
    setClientHeight(document.body.clientHeight);
  },[])

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="flex justify-center items-center h-full z-10"
    >
      <motion.div className="fixed bg-white dark:bg-zinc-800  top-0 left-0 bottom-0 right-0" custom={clientHeight} variants={sidebar} >
        { isOpen && children }
      </motion.div>
      <MenuToggle toggle={() => toggleOpen()} />
      
    </motion.nav>
  );
};
