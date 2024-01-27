import { ReactNode, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MenuToggle } from "./MenuToggle";
import { DialogProvider , DialogContext} from "@/providers/dialog/DialogProvider";

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height*2}px at calc(100% - 1.25rem - 20px) calc(1.25rem + 10px))`,
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

const DialogContent = ( { children } : { children: ReactNode }) =>{
  const [clientHeight, setClientHeight] = useState(0);

  const {
    isOpen,
    updateIsOpen
  } = useContext(DialogContext);

  useEffect(() => {
    setClientHeight(document.body.clientHeight);
  },[])

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="flex justify-center items-center h-full z-10"
    >
      <motion.div className="fixed bg-white dark:bg-zinc-800 top-0 left-0 bottom-0 right-0" custom={clientHeight} variants={sidebar} >
        { isOpen && children }
      </motion.div>
      <MenuToggle toggle={() => updateIsOpen()} />
    </motion.nav>
  )

}

export const Dialog = ( { children } : { children: ReactNode }) => {
  return (
    <DialogProvider>
      <DialogContent>
        {children}
      </DialogContent>
    </DialogProvider>
  );
};
