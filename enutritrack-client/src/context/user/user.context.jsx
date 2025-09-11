// contexts/UsersContext.js
import { createContext, useContext, useState } from "react";
import {
  createUsersRequest,
  getUsersRequest,
  getUserByEmailRequest,
  getUserByIdRequest,
  updateUsersRequest,
  deleteUserByIdRequest,
} from "../../api/user/user.api";

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers ya esta usado");
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
      console.log(error);
    }
  };

  const createUser = async (user) => {
    try {
      const res = await createUsersRequest(user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const res = await getUserByEmailRequest(email);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getUserById = async (id) => {
    try {
      const res = await getUserByIdRequest(id);
      return res.data;
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw error;
    }
  };

  const updateUser = async (id, user) => {
    try {
      const res = await updateUsersRequest(id, user);
      setCurrentUser(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
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
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
