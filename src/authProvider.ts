import { AuthBindings } from "@refinedev/core";
import { supabaseClient } from "./utility";

const authProvider: AuthBindings = {
  // --- FUNGSI LOGIN ---
  login: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Error:", error);
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.message,
        },
      };
    }

    if (data?.session) {
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid credentials",
      },
    };
  },

  // --- FUNGSI REGISTER ---
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Register Error:", error);
        return {
          success: false,
          error: {
            name: "RegisterError",
            message: error.message,
          },
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: "Something went wrong",
        },
      };
    }

    return {
      success: false,
      error: {
        name: "RegisterError",
        message: "Registration failed",
      },
    };
  },

  // --- FUNGSI LOGOUT ---
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      return {
        success: false,
        error,
      };
    }
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  // --- CEK STATUS LOGIN (SESSION) ---
  check: async () => {
    const { data } = await supabaseClient.auth.getSession();
    const { session } = data;

    if (session) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => null,

  // --- ✅ BAGIAN PENTING YANG DIREVISI ---
  // Fungsi ini sekarang mengambil data detail dari tabel 'profiles'
  getIdentity: async () => {
    // 1. Ambil user dari Auth Supabase
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      // 2. Query ke tabel 'profiles' untuk mendapatkan organization_id, nama, dll
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name, avatar, organization_id") // Pastikan kolom ini ada di tabel profiles
        .eq("id", user.id)
        .single();

      // 3. Gabungkan data user auth dengan data profile database
      if (profile) {
        return {
          ...user,        // Data bawaan (email, id, dll)
          ...profile,     // Data tambahan (organization_id, name, avatar)
          name: profile.full_name
        };
      }

      // Fallback jika profile belum dibuat
      return {
        ...user,
        name: user.email,
      };
    }
    return null;
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },
};

export default authProvider;