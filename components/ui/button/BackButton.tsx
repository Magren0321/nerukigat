'use client';

import { useRouter } from 'next/navigation';

export const BackButton = () => {
  const router = useRouter();

  return (
    <div className="mt-4 font-mono text-sm opacity-50 hover:opacity-75">
      <button onClick={() => router.back()} className="cursor-pointer">
        {'>'}
        <span className="ml-2 border-b-2 border-solid border-b-[#000] dark:border-b-[#fff]">
          cd ..{' '}
        </span>
      </button>
    </div>
  );
};

