import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import ApartmentForm from "../components/apartments/ApartmentForm";

export default function AddApartment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUserEmail } = useAuth();
  const [successMessage, setSuccessMessage] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser', currentUserEmail],
    queryFn: () => base44.auth.me(currentUserEmail),
    enabled: !!currentUserEmail,
  });

  const createApartmentMutation = useMutation({
    mutationFn: (apartmentData) => base44.entities.Apartment.create(apartmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setSuccessMessage(true);
      setTimeout(() => {
        navigate(createPageUrl("Apartments"));
      }, 2000);
    },
  });

  const handleSubmit = async (data) => {
    // Добавляем информацию о создателе
    const dataWithCreator = {
      ...data,
      created_by: currentUser?.email || currentUserEmail
    };
    
    await createApartmentMutation.mutateAsync(dataWithCreator);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Apartments"))}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к квартирам
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Добавить квартиру
          </h1>
          <p className="text-slate-600 text-lg">
            Заполните информацию о вашей квартире
          </p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Квартира успешно добавлена! Перенаправляем...
            </AlertDescription>
          </Alert>
        )}

        <ApartmentForm
          onSuccess={handleSubmit}
          onCancel={() => navigate(createPageUrl("Apartments"))}
        />
      </div>
    </div>
  );
}