import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast"
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const BASE_URL =import.meta.env.MODE === "developement"? "http://localhost:4000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: JSON.parse(localStorage.getItem("authUser")) || null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    ifCheckingAuth: true,
    onlineUsers: [],
    socket: null,


    checkAuth: async() => {
        try{
            const res = await axiosInstance.get("/auth/check");

            set({authUser: res.data})

            get().connectSocket();
            localStorage.setItem("authUser", JSON.stringify(res.data));
        } catch(err) {
            console.log("Error in checkAuth", err);
            set({authUser: null});
        } finally{
            set({ isCheckingAuth: false});
        }
    },

    signup: async(data) => {
        set({ isSigningUp: true });
        try{
            console.log("data",data)
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            get().connectSocket();
        } catch(err) {
            toast.error(err.resonse.data.message)
        } finally {
            set({ isSigningUp: false});
        }
    },

    login : async(data) => {
        set({ isLoggingIng: true})
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data});
            toast.success("Logged in Successfully");

            get().connectSocket();
        } catch (err) {
            toast.error(err.response.data.message);
        } finally {
            set({ isLoggingIng: false});
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged Out successfully");
        } catch (err) {
            toast.error(err.resonse.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true});
        try {
            console.log("data",data)
            const res = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: res.data});
            toast.success("Profile updated successfully")

        } catch (err) {
            console.log("error in update profile: ", err);
            toast.error(err.resonse.data.message)
        } finally {
            set({ isUpdatingProfile : false });
        }
    },

    connectSocket: () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;


        const socket = io(BASE_URL, {
            query: {
                userId : authUser._id,
            }
        })
        socket.connect();
        set({ socket: socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds})
        })
    },
    disconnectSocket: () =>{
        if(get().socket?.connected) get().socket.disconnect();
    }

}))