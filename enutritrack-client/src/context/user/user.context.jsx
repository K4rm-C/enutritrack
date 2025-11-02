// contexts/UsersContext.js
import { createContext, useContext, useState } from "react";
import {
  createUsersRequest,
  getUsersRequest,
  getUsersByDoctorIdRequest,
  getUserByEmailRequest,
  getUserByIdRequest,
  updateUsersRequest,
  deleteUserByIdRequest,
} from "../../api/user/user.api";

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers debe ser usado dentro de un UsersProvider");
  }
  return context;
};

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const getUsers = async () => {
    try {
      const res = await getUsersRequest();
      return res.data;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  };

  const getUsersByDoctorId = async (doctorId) => {
    try {
      console.log("Obteniendo pacientes para doctor ID:", doctorId);
      const res = await getUsersByDoctorIdRequest(doctorId);
      console.log("Respuesta de pacientes:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo usuarios por doctor ID:", error);
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      console.log("Creando usuario con datos:", userData);

      // Asegurar que los campos numéricos sean enviados correctamente
      const formattedData = {
        ...userData,
        altura: userData.altura ? parseFloat(userData.altura) : null,
        peso_actual: userData.peso_actual
          ? parseFloat(userData.peso_actual)
          : null,
        objetivo_peso: userData.objetivo_peso
          ? parseFloat(userData.objetivo_peso)
          : null,
      };

      const res = await createUsersRequest(formattedData);
      console.log("Usuario creado exitosamente:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const res = await getUserByEmailRequest(email);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo usuario por email:", error);
      throw error;
    }
  };

  const getUserById = async (id) => {
    try {
      const res = await getUserByIdRequest(id);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo usuario por ID:", error);
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await deleteUserByIdRequest(id);
      if (res.status === 200 || res.status === 204) {
        setUsers(users.filter((record) => record.id !== id));
        return res;
      } else {
        throw new Error(`Delete failed with status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      console.log("Actualizando usuario ID:", id, "con datos:", userData);

      // Asegurar que los campos numéricos sean enviados correctamente
      const formattedData = {
        ...userData,
        altura: userData.altura ? parseFloat(userData.altura) : null,
        peso_actual: userData.peso_actual
          ? parseFloat(userData.peso_actual)
          : null,
        objetivo_peso: userData.objetivo_peso
          ? parseFloat(userData.objetivo_peso)
          : null,
      };

      const res = await updateUsersRequest(id, formattedData);
      setCurrentUser(res.data);
      console.log("Usuario actualizado exitosamente:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        currentUser,
        createUser,
        getUserByEmail,
        getUserById,
        updateUser,
        deleteUser,
        getUsers,
        getUsersByDoctorId,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
