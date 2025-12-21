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

  // --- FUNGSI REGISTER (INI YANG TADI HILANG) ---
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

      // Jika sukses daftar
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
  
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();
    const { user } = data;

    if (user) {
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