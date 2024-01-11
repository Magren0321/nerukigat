import { FC } from 'react'
import './index.css'

export const Spinner: FC = () => {
  return (
    <span className="inline-block absolute w-[80px] h-[80px] top-0 left-0 bottom-0 right-0 lds-ring m-auto dark:lds-ring-dark">
      <span></span><span></span><span></span><span></span>
    </span>
  )
}
