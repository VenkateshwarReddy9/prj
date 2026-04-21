export default function JobsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
