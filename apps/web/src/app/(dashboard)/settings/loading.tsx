export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      ))}
    </div>
  );
}
