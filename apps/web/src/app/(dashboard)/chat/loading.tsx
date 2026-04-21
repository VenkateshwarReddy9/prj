export default function ChatLoading() {
  return (
    <div className="flex gap-4 h-full animate-pulse">
      <div className="w-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
  );
}
