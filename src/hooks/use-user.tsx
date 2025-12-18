
"use client";

import { useContext } from "react";
import {
  SupabaseContext,
  type SupabaseContextType,
} from "@/lib/supabase-provider";

type UseUserReturn = Omit<SupabaseContextType, 'supabase'>;

export const useUser = (): UseUserReturn => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a SupabaseProvider");
  }

  const { user, profile, isLoading, error } = context;
  return { user, profile, isLoading, error };
};
