// Skeleton Loader Components
export const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="group relative w-full animate-pulse">
        <div className="h-[13.5rem] md:h-[17.5rem] w-full bg-gray-200 flex items-center justify-center p-4 relative"></div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-1 mt-2">
            <div className="h-4 w-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-4 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-6">
    {[...Array(4)].map((_, index) => (
      <div
        key={index}
        className="flex flex-col sm:flex-row gap-4 p-4 border-solid border-gray-200 border-[1px] animate-pulse"
      >
        <div className="w-full sm:w-48 h-48 bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    ))}
  </div>
);
