import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // NEW
  const [user, setUser] = useState({
    id: "",
    username: "",
    userType: "",
    fullName: "",
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthChecked(true); // Only render after checking
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
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout, authChecked, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
