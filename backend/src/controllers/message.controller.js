import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getUserForSidebar = async (req, res) => {
 try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({_id: {$ne: loggedUserId}}).select("-password");

    res.status(200).json(filteredUsers);
 }
 catch(err) {
    console.error("Error in getUserForSidebar", err.message);
    res.status(500).json({error: "Internal Server error"});
 }
}

export const getMessages = async (req, res) => {
   try {
     const { id: userToChatId } = req.params;
     const myId = req.user._id;
 
     const messages = await Message.find({
       $or: [
         { senderId: myId, receiverId: userToChatId },
         { senderId: userToChatId, receiverId: myId },
       ],
     });
 
     res.status(200).json(messages);
   } catch (error) {
     console.log("Error in getMessages controller: ", error.message);
     res.status(500).json({ error: "Internal server error" });
   }
 };

// export const getMessages = async (req, res) => {
//    try {
//       const { id: userToChatId } = req.params;
//       const myId = req.user._id;
//       console.log("myId", myId);
//       console.log("userToChatId", userToChatId);

//       // Validate ObjectId format
//       if (!mongoose.Types.ObjectId.isValid(userToChatId) || !mongoose.Types.ObjectId.isValid(myId)) {
//          return res.status(400).json({ error: "Invalid user ID" });
//       }

//       const messages = await Message.find({
//          $or: [
//             { senderId: new mongoose.Types.ObjectId(myId), receiverId: new mongoose.Types.ObjectId(userToChatId) },
//             { senderId: new mongoose.Types.ObjectId(userToChatId), receiverId: new mongoose.Types.ObjectId(myId) }
//          ]
//       });

//       res.status(200).json(messages);
//    } catch (err) {
//       console.error("Error in getMessages controller:", err.message);
//       res.status(500).json({ error: "Internal Server Error" });
//    }
// };

export const sendMessage = async (req, res) => {
   try {
      const {text, image} = req.body;
      const {id: receiverId} = req.params;
      const senderId = req.user._id;

      let imageUrl;
      if(image) {
         // Upload base64 image to cloudinary
         const UploadResponse = await cloudinary.uploader.upload(image);
         imageUrl = UploadResponse.secure_url;
      }
      const newMessage = new Message({
         senderId,
         receiverId,
         text,
         image: imageUrl,
      })

      await newMessage.save();
      
      // todo: realtime functionality goes here => socket.io
      const receiverSocketId = getReceiverSocketId(receiverId); 
      if(receiverSocketId) {
         io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(201).json(newMessage);

   } catch(err) {
      console.log("Error in sendMessage controller: ",err.message);
      res.status(500).json({error: "Internal server error"});
   }
}