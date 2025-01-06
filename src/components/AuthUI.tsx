import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthUI = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Bubble.io Voice Assistant</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366f1',
                  brandAccent: '#4f46e5',
                }
              }
            }
          }}
          theme="light"
          providers={['google']}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
            });
          }}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default AuthUI;