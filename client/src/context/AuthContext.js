import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a une session existante
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      // Étape 1: Créer l'utilisateur d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: { message: 'Erreur lors de la création du compte' } };
      }

      // Étape 2: Vérifier que l'utilisateur n'existe pas déjà
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists, skipping creation');
        return { data: authData, error: null };
      }

      // Étape 3: Insérer les données dans user_profiles (table principale)
      const profileData = {
        id: authData.user.id,
        ...userData // Toutes les données du formulaire
      };

      const { data: insertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { data: null, error: profileError };
      }

      console.log('User created successfully:', insertedProfile);
      return { data: authData, error: null };

    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Fonction pour récupérer le profil complet de l'utilisateur
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { data: null, error };
    }
  };

  // Fonction pour mettre à jour le profil
  const updateUserProfile = async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Profile update error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};