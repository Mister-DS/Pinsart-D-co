import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { User, Session } from '@supabase/supabase-js';

// Types pour notre contexte
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Initialisation AuthContext...');
    
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Session initiale:', session ? 'Connecté' : 'Non connecté');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth event:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Logs pour debugging
        if (event === 'SIGNED_IN') {
          console.log('✅ Utilisateur connecté:', session?.user?.email);
          // Si vous voulez créer le profil client SEULEMENT après la connexion/vérification,
          // vous pouvez ajouter la logique d'insertion ici, en vérifiant si le profil existe déjà.
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Utilisateur déconnecté');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction d'inscription
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('📝 Tentative d\'inscription pour:', email);
      
      // 1. Inscription de l'utilisateur via Supabase Auth
      // Les données supplémentaires (userData) sont stockées comme métadonnées dans Supabase Auth.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // métadonnées utilisateur (nom, prénom, etc.)
        },
      });

      if (authError) {
        console.error('❌ Erreur inscription Supabase Auth:', authError);
        throw authError;
      }

      // Si l'inscription Supabase Auth réussit et qu'un utilisateur est retourné
      // Note: authData.user peut être null si l'email de confirmation est envoyé et l'auto-connexion est désactivée.
      if (authData.user) {
        console.log('✅ Inscription Auth réussie. Tentative d\'insertion dans la table client...');
        
        // Récupérer les données du formulaire et les métadonnées Supabase
        // Assurez-vous que votre composant Register passe toutes ces données dans l'objet userData.
        // Les champs marqués comme NOT NULL dans votre table DB doivent absolument être fournis.
        const { 
          nom, 
          prenom, 
          telephone,
          telephone_label, // <-- Ce champ doit être ajouté à votre formulaire Register
          adresse_ligne1,  // <-- Ce champ DOIT être ajouté à votre formulaire Register (NOT NULL)
          adresse_ligne2,
          code_postal,   // <-- Ce champ DOIT être ajouté à votre formulaire Register (NOT NULL)
          ville,         // <-- Ce champ DOIT être ajouté à votre formulaire Register (NOT NULL)
          pays,
          date_naissance
        } = userData;

        // 2. Insérer les données utilisateur dans votre table 'clients'
        // Il est CRUCIAL que l'ID de la table 'clients' soit l'ID de l'utilisateur Supabase Auth
        // pour maintenir une relation 1:1.
        // Assurez-vous que votre table 'clients' a la définition suivante pour l'ID:
        // id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        // au lieu de id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        const { data: clientData, error: clientError } = await supabase
          .from('clients') // Assurez-vous que 'clients' est le nom correct de votre table
          .insert([
            { 
              id: authData.user.id, // L'ID de l'utilisateur Supabase Auth
              nom: nom,
              prenom: prenom,
              email: email, // L'email de l'utilisateur Supabase
              telephone: telephone,
              telephone_label: telephone_label || 'Mobile', // Utilise la valeur fournie ou le défaut
              adresse_ligne1: adresse_ligne1, // Assurez-vous que ce champ est fourni (NOT NULL)
              adresse_ligne2: adresse_ligne2 || null, // Peut être null si non fourni
              code_postal: code_postal, // Assurez-vous que ce champ est fourni (NOT NULL)
              ville: ville, // Assurez-vous que ce champ est fourni (NOT NULL)
              pays: pays || 'Belgium', // Utilise la valeur fournie ou le défaut
              date_naissance: date_naissance || null, // Peut être null si non fourni
              // is_active, created_at, updated_at ont des valeurs par défaut dans la DB
            }
          ]);

        if (clientError) {
          console.error('❌ Erreur insertion dans la table clients:', clientError);
          // Si l'insertion échoue ici, l'utilisateur est créé dans Supabase Auth mais pas dans votre table 'clients'.
          // Vous pourriez vouloir gérer cela (par exemple, supprimer l'utilisateur Supabase Auth
          // si cette insertion est critique, ou notifier l'administrateur).
          throw clientError; 
        }

        console.log('✅ Données client insérées avec succès:', clientData);
      } else {
          // Ce cas se produit si Supabase envoie un email de vérification et ne connecte pas automatiquement l'utilisateur.
          // L'utilisateur n'est pas encore "SIGNED_IN".
          console.log('ℹ️ Pas d\'utilisateur retourné immédiatement par signUp. Un email de vérification a probablement été envoyé.');
          console.log('L\'insertion dans la table client peut être gérée par un trigger de base de données Supabase');
          console.log('qui s\'active après la vérification de l\'email (événement sur auth.users).');
      }

      console.log('✅ Processus d\'inscription terminé.');
      return { data: authData, error: null }; // Retourne les données d'authentification
    } catch (error: any) {
      console.error('❌ Erreur globale inscription:', error);
      return { data: null, error };
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erreur connexion:', error);
        throw error;
      }

      console.log('✅ Connexion réussie:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      return { data: null, error };
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      console.log('👋 Déconnexion...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur déconnexion:', error);
        throw error;
      }

      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  };

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Demande de réinitialisation pour:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Erreur réinitialisation:', error);
        throw error;
      }

      console.log('✅ Email de réinitialisation envoyé');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      return { data: null, error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
