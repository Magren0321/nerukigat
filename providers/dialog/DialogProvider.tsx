import React, { createContext, useEffect, useState } from 'react';

type DialogContextValue = {
  isOpen: boolean;
  closeDialog: () => void;
  toggleDialog: () => void;
};

export const DialogContext = createContext<DialogContextValue>({
  isOpen: false,
  closeDialog: () => {},
  toggleDialog: () => {},
});

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closeDialog = () => setIsOpen(false);
  const toggleDialog = () => setIsOpen((current) => !current);

  return (
    <DialogContext.Provider value={{ isOpen, closeDialog, toggleDialog }}>
      {children}
    </DialogContext.Provider>
  );
};
