import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CareerCompass</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Start your career journey today</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'shadow-lg rounded-xl',
            },
          }}
        />
      </div>
    </div>
  );
}
