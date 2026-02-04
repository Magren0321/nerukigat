export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-2 border-zinc-200 rounded-full dark:border-zinc-700"></div>
        <div className="absolute top-0 left-0 w-full h-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin dark:border-t-blue-400"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Loading...
      </p>
    </div>
  );
};

