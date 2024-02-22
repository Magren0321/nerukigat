import { FC } from 'react';
import './index.css';

export const Spinner: FC = () => {
  return (
    <span className="lds-ring dark:lds-ring-dark absolute bottom-0 left-0 right-0 top-0 m-auto inline-block h-[80px] w-[80px]">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </span>
  );
};
