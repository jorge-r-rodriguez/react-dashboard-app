// src/layout/CasLayout.jsx
import { useEffect, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { CasUserContext } from "../context/CasUserContext";
import { casLogin } from "../utils/casClient";

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);
const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
};

export const CasLayout = ({ children }) => {
  const { casUser, setCasUser, setCasGroups } = useContext(CasUserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!casUser) {
      casLogin()
        .then((data) => {
          const attributes = data.attributes ?? {};
          const casUserPayload = {
            username: data.user,
            name: firstValue(attributes.commonName) ?? data.user,
            email: firstValue(attributes.mail) ?? "",
            attributes,
          };

          setCasUser(casUserPayload);
          setCasGroups(normalizeToArray(attributes.memberOf));
        })
        .catch((err) => {
          console.error("Error de CAS:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [casUser, setCasGroups, setCasUser]);

  if (loading) return <div>Autenticando con CAS...</div>;
  if (!casUser) return <Navigate to="/login" replace />;
  if (children) return <>{children}</>;

  return <Navigate to="/" replace />;
};
