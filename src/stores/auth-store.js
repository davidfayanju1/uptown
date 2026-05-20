// stores/auth-store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      cartData: null, // Add cart data to store

      // Actions - pure state updates only
      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }
        set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
      },

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Set cart data
      setCartData: (cartData) => set({ cartData }),

      // Set all user data at once (for login/signup success)
      setUserData: (user, accessToken, refreshToken, cartData = null) => {
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          cartData,
        });
      },

      // Clear all user data (for logout)
      clearUserData: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          cartData: null,
        });
      },

      // Update specific user fields
      updateUserField: (field, value) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, [field]: value } });
        }
      },

      // Get current user
      getUser: () => get().user,

      // Get auth header (for API calls)
      getAuthHeader: () => {
        const { accessToken } = get();
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      },
    }),
    {
      name: "user-storage", // unique name for localStorage
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        cartData: state.cartData,
      }),
    },
  ),
);

export default useUserStore;
