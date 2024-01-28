
import React, { createContext, useState } from 'react';

export const DialogContext = createContext({
  isOpen: false,
  updateIsOpen: () => {},
});

export const DialogProvider = ({ children }: { children: React.ReactNode}) => {
  const [isOpen,setIsOpen] = useState(false);

  const updateIsOpen = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  return (
    <DialogContext.Provider value={{ isOpen, updateIsOpen }}>
      {children}
    </DialogContext.Provider>
  );
};
