import { createContext, useContext, useReducer } from "react";

function normalizeUser(user) {
  if (!user) return null;
  const id = user.id ?? user._id;
  return { ...user, id, _id: id };
}

const AuthContext = createContext();

const initialState = {
  user: normalizeUser(JSON.parse(localStorage.getItem("user") || "null")),
  token: localStorage.getItem("token"),
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const normalized = normalizeUser(action.payload.user);
      localStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("token", action.payload.token);
      return { user: normalized, token: action.payload.token };
    }
    case "UPDATE_USER": {
      const updated = normalizeUser({ ...state.user, ...action.payload });
      localStorage.setItem("user", JSON.stringify(updated));
      return { ...state, user: updated };
    }
    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
