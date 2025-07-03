import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'client' | 'employee' | 'admin';
  nom?: string;
  prenom?: string;
  is_active: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Validation du mot de passe fort
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  // Vérifier les patterns communs faibles
  const commonPasswords = ['password', '12345678', 'qwerty', 'azerty', 'password123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Le mot de passe ne doit pas contenir de mots communs');
  }
  
  // Vérifier les séquences
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir plus de 2 caractères identiques consécutifs');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation de l'email
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  
  // Vérifier les domaines jetables (liste basique)
  const disposableEmailDomains = [
    '10minutemail.com', 'guerrillamail.com', 'tempmail.org', 
    'throwaway.email', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1];
  if (disposableEmailDomains.includes(domain)) {
    return { isValid: false, error: 'Les adresses email temporaires ne sont pas autorisées' };
  }
  
  return { isValid: true };
};

// Rate limiting pour les tentatives de connexion
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record) {
      return true;
    }
    
    // Reset si la fenêtre de temps est expirée
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return true;
    }
    
    return record.count < this.maxAttempts;
  }
  
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };
    
    record.count += 1;
    record.lastAttempt = now;
    
    this.attempts.set(identifier, record);
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const elapsed = Date.now() - record.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

const rateLimiter = new RateLimiter();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le profil utilisateur depuis la DB (avec useCallback pour éviter les boucles)
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 Loading profile for user:', userId);
    
    try {
      // Essayer d'abord la table clients
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, email, nom, prenom, is_active')
        .eq('id', userId)
        .single();

      console.log('👤 Client data:', clientData);
      console.log('❌ Client error:', clientError);

      if (clientData && !clientError) {
        const profile = {
          ...clientData,
          role: 'client' as const,
          is_verified: true
        };
        console.log('✅ Profile created:', profile);
        return profile;
      }

      // Sinon essayer la table employees
      console.log('🔍 Trying employees table...');
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, email, nom, prenom, is_active, is_verified')
        .eq('id', userId)
        .single();

      console.log('👷 Employee data:', employeeData);
      console.log('❌ Employee error:', employeeError);

      if (employeeData && !employeeError) {
        const profile = {
          ...employeeData,
          role: 'employee' as const
        };
        console.log('✅ Employee profile created:', profile);
        return profile;
      }

      // Par défaut, créer un profil client temporaire
      console.log('⚠️ No profile found in DB, creating default client profile');
      const defaultProfile = {
        id: userId,
        email: '', // On va le récupérer du user auth
        role: 'client' as const,
        is_active: true,
        is_verified: false
      };
      console.log('🆕 Default profile:', defaultProfile);
      return defaultProfile;

    } catch (error) {
      console.error('💥 Error loading profile:', error);
      return null;
    }
  }, []);

  // Initialiser l'auth au montage
  useEffect(() => {
    console.log('🚀 AuthProvider useEffect triggered');
    
    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 Initial session:', session?.user?.email);
        console.log('❌ Initial session error:', error);
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found, setting user and loading profile');
          console.log('🆔 User ID:', session.user.id);
          
          setSession(session);
          setUser(session.user);
          
          const profile = await loadUserProfile(session.user.id);
          console.log('👤 Profile loaded result:', profile);
          
          if (profile) {
            // Mise à jour de l'email si manquant
            if (!profile.email && session.user.email) {
              profile.email = session.user.email;
            }
          }
          
          setUserProfile(profile);
        } else {
          console.log('🚫 No initial session found');
        }
      } catch (error) {
        console.error('💥 Error during auth initialization:', error);
      } finally {
        console.log('✅ Auth initialization complete, setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'auth
    console.log('👂 Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        console.log('📋 New session:', session);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing state');
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setLoading(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          setSession(session);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('👤 Setting user from auth state change');
          console.log('🆔 User ID:', session.user.id);
          
          setSession(session);
          setUser(session.user);
          
          console.log('🔍 Loading profile for auth state change...');
          const profile = await loadUserProfile(session.user.id);
          console.log('👤 Profile from auth state change:', profile);
          
          if (profile) {
            // Mise à jour de l'email si manquant
            if (!profile.email && session.user.email) {
              profile.email = session.user.email;
            }
          }
          
          setUserProfile(profile);
        } else {
          console.log('🚫 No user in session, clearing state');
          setUser(null);
          setUserProfile(null);
        }

        setLoading(false);
        console.log('✅ Auth state change processed');
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Inscription sécurisée
  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 Starting signup process for:', email);
    
    try {
      // Validation côté client
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return { data: null, error: { message: emailValidation.error } };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { 
          data: null, 
          error: { message: passwordValidation.errors.join('\n') }
        };
      }

      // Rate limiting
      if (!rateLimiter.canAttempt(email)) {
        const remainingTime = Math.ceil(rateLimiter.getRemainingTime(email) / 1000 / 60);
        return {
          data: null,
          error: { message: `Trop de tentatives. Réessayez dans ${remainingTime} minutes.` }
        };
      }

      // Créer le compte Supabase Auth (mot de passe automatiquement chiffré)
      console.log('🔐 Creating Supabase auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Temporairement désactivé pour éviter les problèmes d'email
          // emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            nom: userData.nom,
            prenom: userData.prenom
          }
        }
      });

      console.log('🔐 Auth signup result:', authData);
      console.log('❌ Auth signup error:', authError);

      if (authError) {
        rateLimiter.recordAttempt(email);
        return { data: null, error: authError };
      }

      // Insérer dans la table clients si l'auth a réussi
      if (authData.user) {
        console.log('💾 Inserting user data into clients table...');
        const { error: dbError } = await supabase
          .from('clients')
          .insert([{
            id: authData.user.id,
            nom: userData.nom,
            prenom: userData.prenom,
            email: email,
            telephone: userData.telephone,
            telephone_label: userData.telephoneLabel,
            adresse_ligne1: userData.adresseLigne1,
            adresse_ligne2: userData.adresseLigne2 || null,
            code_postal: userData.codePostal,
            ville: userData.ville,
            date_naissance: userData.dateNaissance || null,
            is_active: true
          }]);

        console.log('💾 DB insertion error:', dbError);

        if (dbError) {
          console.error('💥 DB insertion failed, cleaning up auth user');
          // Ne pas supprimer l'utilisateur auth pour éviter les complications
          return { data: null, error: { message: 'Erreur lors de la création du profil' } };
        }
        
        console.log('✅ User successfully created in both auth and database');
      }

      return { data: authData, error: null };

    } catch (error) {
      console.error('💥 Signup error:', error);
      return { data: null, error: { message: 'Erreur interne' } };
    }
  };

  // Connexion sécurisée
  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting signin process for:', email);
    
    try {
      // Rate limiting
      if (!rateLimiter.canAttempt(email)) {
        const remainingTime = Math.ceil(rateLimiter.getRemainingTime(email) / 1000 / 60);
        return {
          data: null,
          error: { message: `Trop de tentatives. Réessayez dans ${remainingTime} minutes.` }
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔑 Signin result:', data?.user?.email);
      console.log('❌ Signin error:', error);

      if (error) {
        rateLimiter.recordAttempt(email);
        
        // Messages d'erreur personnalisés et sécurisés
        let errorMessage = 'Erreur de connexion';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives, veuillez patienter';
        }
        
        return { data: null, error: { message: errorMessage } };
      }

      // Vérifier que le compte est actif
      if (data.user) {
        console.log('🔍 Checking if user account is active...');
        const profile = await loadUserProfile(data.user.id);
        if (profile && !profile.is_active) {
          console.log('🚫 Account is inactive, signing out');
          await supabase.auth.signOut();
          return { data: null, error: { message: 'Compte désactivé. Contactez le support.' } };
        }
        console.log('✅ Account is active');
      }

      return { data, error: null };

    } catch (error) {
      console.error('💥 Signin error:', error);
      return { data: null, error: { message: 'Erreur interne' } };
    }
  };

  // Déconnexion sécurisée
  const signOut = async () => {
    console.log('👋 Starting signout process');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Signout error:', error);
      }
      
      // Nettoyer le state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      console.log('✅ Signout complete, redirecting to home');
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    } catch (error) {
      console.error('💥 Signout error:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      return { data, error };
    } catch (error) {
      console.error('💥 Reset password error:', error);
      return { data: null, error: { message: 'Erreur interne' } };
    }
  };

  // Update password
  const updatePassword = async (newPassword: string) => {
    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return { 
          data: null, 
          error: { message: passwordValidation.errors.join('\n') }
        };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { data, error };
    } catch (error) {
      console.error('💥 Update password error:', error);
      return { data: null, error: { message: 'Erreur interne' } };
    }
  };

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Refresh session error:', error);
        await signOut();
      } else {
        console.log('✅ Session refreshed successfully');
      }
    } catch (error) {
      console.error('💥 Refresh session error:', error);
      await signOut();
    }
  }, []);

  // Auto-refresh de la session toutes les 50 minutes
  useEffect(() => {
    if (session) {
      console.log('⏰ Setting up auto-refresh for session');
      const interval = setInterval(() => {
        refreshSession();
      }, 50 * 60 * 1000); // 50 minutes

      return () => {
        console.log('🧹 Cleaning up auto-refresh interval');
        clearInterval(interval);
      };
    }
  }, [session, refreshSession]);

  // Log des états pour debug
  useEffect(() => {
    console.log('📊 Auth state update:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasProfile: !!userProfile,
      profileRole: userProfile?.role,
      loading,
      sessionExists: !!session
    });
  }, [user, userProfile, loading, session]);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};