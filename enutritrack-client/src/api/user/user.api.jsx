import { userAPI } from "../axios";

export const getUsersRequest = () => userAPI.get("/users");
export const getUsersByDoctorIdRequest = (doctorId) => userAPI.get(`/users/doctor/${doctorId}`);
export const createUsersRequest = (user) => userAPI.post("/users", user);
export const createUsersCompleteRequest = (user) => userAPI.post("/users/complete", user);
export const getUserByEmailRequest = (email) => userAPI.get(`/users/email/${email}`);
export const getUserByIdRequest = (id) => userAPI.get(`/users/${id}`);
export const deleteUserByIdRequest = (id) => userAPI.delete(`/users/${id}`);
export const updateUsersRequest = (id, user) =>
  userAPI.patch(`/users/${id}`, user);
