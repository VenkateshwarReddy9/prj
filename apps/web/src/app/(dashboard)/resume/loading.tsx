export default function ResumeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
      <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
