// api/users/usersAuth.js
import axios from "../../api/axios";

export const getUsersRequest = () => axios.get("/users");
export const createUsersRequest = (user) => axios.post("/users", user);
export const getUserByEmailRequest = (email) =>
  axios.get(`/users/email/${email}`);
export const getUserByIdRequest = (id) => axios.get(`/users/${id}`);
export const updateUsersRequest = (id, user) => axios.put(`/users/${id}`, user);
