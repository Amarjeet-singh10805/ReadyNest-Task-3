export default function PostSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg mb-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 p-3">
        <div className="skeleton w-9 h-9 rounded-full" />
        <div className="skeleton h-3 w-24" />
      </div>
      <div className="skeleton w-full aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-3 w-3/4" />
      </div>
    </div>
  );
}
