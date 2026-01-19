import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (user) {
                try {
                    const { data } = await supabase
                        .from('admins')
                        .select('email')
                        .eq('email', user.email)
                        .maybeSingle(); // Use maybeSingle to avoid 406 if not found

                    setIsAdmin(!!data); // True if record found
                } catch (err) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    const signUp = async (data) => {
        const { data: authData, error } = await supabase.auth.signUp(data);
        if (error) return { data: authData, error };

        // Sync with users table
        if (authData.user) {
            const { name } = data.options?.data || {};
            const { error: dbError } = await supabase.from('users').upsert({
                id: authData.user.id, // Link auth ID to table ID
                email: authData.user.email,
                name: name || 'User', // Default or from metadata
                // Add default fields if needed to match schema, e.g. empty address
                address: {},
                dob: null,
                gender: 'Not Selected',
                phone: ''
            });

            if (dbError) {
                console.error("Error creating user profile:", dbError);
                // Optional: decided if we want to return this error or just log it
            }
        }
        return { data: authData, error };
    };

    const value = {
        signUp,
        signIn: async (data) => {
            try {
                const result = await supabase.auth.signInWithPassword(data);

                // Sync user to public table on login (ensures Admin Panel sees them)
                if (result.data?.user) {
                    const { user } = result.data;
                    // Upsert: Create if missing, or update basic info (optional)
                    // Using upsert with ignoreDuplicates: false to ensure we have the row
                    // but respecting existing profile data if we want.
                    // However, user wanted Name/Email fixed from login, so we can force them here.

                    await supabase.from('users').upsert({
                        id: user.id,
                        email: user.email,
                        // If name is in metadata, enforce it. If not, keep existing or 'User'
                        name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
                        // Don't overwrite phone/address/gender/dob if they exist
                        // Actually upsert overwrites unless we specify `onConflict`.
                        // But we want to preserve profile fields.
                        // So correct strategy: "Insert if not exists" or "Update only Name/Email"
                    }, { onConflict: 'id', ignoreDuplicates: true }); // ignoreDuplicates: true means "If exists, do nothing". 
                    // Wait, if we use ignoreDuplicates: true, we won't fix missing names.
                    // Better: check existence or just rely on Myprofile 'auto-fix' we already did?
                    // AuthContext sync on login is proactive.
                    // Let's use simple INSERT with ON CONFLICT DO NOTHING equivalent logic via select first?
                    // OR just upsert specific fields? Supabase client upsert overwrites whole row unless merged?
                    // Valid JSON approach:
                    // We can't partial upsert easily without stored procedures usually.
                    // Let's stick to: "Check if exists, if not, Insert."

                    const { error: checkError } = await supabase.from('users').select('id').eq('id', user.id).single();
                    if (checkError) {
                        // Row likely missing, create it
                        await supabase.from('users').insert({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
                            phone: '',
                            address: {},
                            gender: 'Not Selected',
                            dob: ''
                        });
                    }
                }

                return result;
            } catch (error) {
                console.error("Login sync error:", error); // Log but don't fail login
                return { data: null, error };
            }
        },
        signOut: () => supabase.auth.signOut(),
        user,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
