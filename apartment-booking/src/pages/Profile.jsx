import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

import ProfileForm from "../components/profile/ProfileForm";

export default function Profile() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => base44.auth.updateMe(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    },
  });

  const handleSave = async (data) => {
    await updateProfileMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Мой профиль
          </h1>
          <p className="text-slate-600 text-lg">
            Заполните информацию для быстрого бронирования
          </p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Профиль успешно сохранён!
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <ProfileForm 
            user={user} 
            onSave={handleSave}
            isSaving={updateProfileMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}