'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Briefcase } from 'lucide-react';
import { useEffect } from 'react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  currentTitle: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  targetRole: z.string().max(100).optional(),
  yearsExp: z.coerce.number().int().min(0).max(50).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  currentTitle?: string | null;
  location?: string | null;
  targetRole?: string | null;
  yearsExp?: number | null;
  plan: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient.get<{ data: UserProfile }>('/users/me').then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        currentTitle: profile.currentTitle || '',
        location: profile.location || '',
        targetRole: profile.targetRole || '',
        yearsExp: profile.yearsExp ?? undefined,
      });
    }
  }, [profile, reset]);

  const update = useMutation({
    mutationFn: (data: ProfileForm) =>
      apiClient.patch('/users/me', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        {clerkUser?.imageUrl && (
          <img
            src={clerkUser.imageUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {profile?.name || clerkUser?.fullName}
          </h1>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
            {profile?.plan} plan
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="space-y-5">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4" /> Basic Info
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Title
              </label>
              <input
                {...register('currentTitle')}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </label>
              <input
                {...register('location')}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Target Role
              </label>
              <input
                {...register('targetRole')}
                placeholder="e.g. Staff Engineer"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Years of Experience
            </label>
            <input
              {...register('yearsExp')}
              type="number"
              min={0}
              max={50}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isDirty || update.isPending}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
