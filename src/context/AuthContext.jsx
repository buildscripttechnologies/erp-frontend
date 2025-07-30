import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState({
    id: "",
    username: "",
    fullName: "",
    userType: "",
    permissions: [],
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setAuthChecked(true);
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setIsAuthenticated(true);
    setUser({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      userType: user.userType,
      permissions: user.permissions || [], // ✅ include permissions
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setIsAuthenticated(false);
    setUser({
      id: "",
      username: "",
      fullName: "",
      userType: "",
      permissions: [],
    });
  };

  const hasPermission = (module, action) => {
    if (!user) return false;
    if (user.userType === "Admin") return true;

    const permission = user.permissions?.find((p) => p.module === module);
    if (!permission) return false;

    return (
      permission.actions.includes(action) || permission.actions.includes("*")
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        logout,
        authChecked,
        user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
