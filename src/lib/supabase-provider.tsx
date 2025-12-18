

"use client";

import { createContext, useEffect, useState, Dispatch, SetStateAction, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient, type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types";
import { getTeamsForUser, getNotificationSettingsForUser } from "@/lib/db";

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export type SupabaseContextType = {
  supabase: SupabaseClient;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
};

export const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

async function fetchFullUserProfile(
    supabase: SupabaseClient,
    user: User,
): Promise<UserProfile | null> {
    try {
        if (!user.email) {
            console.error("SupabaseProvider: User email is missing, cannot build profile.");
            return null;
        }

        console.time("SupabaseProvider: fetchFullUserProfile (teams & settings)");
        const [teams, settings] = await Promise.all([
            getTeamsForUser(supabase),
            getNotificationSettingsForUser(supabase, user.id)
        ]);
        console.timeEnd("SupabaseProvider: fetchFullUserProfile (teams & settings)");

        const userProfile: UserProfile = {
            id: user.id,
            email: user.email,
            timezone: settings?.timezone ?? 'UTC',
            teams: teams ?? []
        };
        
        console.log('SupabaseProvider: Fetched User Profile:', userProfile);
        return userProfile;

    } catch (e: any) {
        console.error("SupabaseProvider: Critical error building user profile:", e);
        return null;
    }
}


export function SupabaseProvider({ 
  children,
}: SupabaseProviderProps) {
  const [supabase] = useState(() =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();


  useEffect(() => {
    let initialLoadComplete = false;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`SupabaseProvider: Auth state changed. Event: ${event}`);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      try {
        if (currentUser) {
            const userProfile = await fetchFullUserProfile(supabase, currentUser);
             if (userProfile) {
                setProfile(userProfile);
            } else {
                // If profile creation fails, it's a critical error for a logged-in user.
                throw new Error("Could not build user profile.");
            }
        } else {
            setProfile(null);
        }
         // Clear any previous errors on a successful auth change
        setError(null);
      } catch (e: any) {
        console.error("SupabaseProvider: Failed to process auth state change:", e);
        setError(e);
        // Clear user/profile on error to prevent inconsistent state
        setUser(null);
        setProfile(null);
      } finally {
        if (!initialLoadComplete) {
            setIsLoading(false);
            initialLoadComplete = true;
            console.log("SupabaseProvider: Initial load process finished.");
        }
      }


       if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          // Re-fetching data on the server and invalidating the client-side router cache
          router.refresh();
       }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const value = useMemo(() => ({
    supabase,
    user,
    profile,
    isLoading,
    error,
  }), [supabase, user, profile, isLoading, error]);

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}
