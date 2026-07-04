"use server";

import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function getNotificationCounts() {
  try {
    await dbConnect();
    
    const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({ status: String }));
    const Comment = mongoose.models.Comment || mongoose.model('Comment', new mongoose.Schema({ status: String }));
    const AgencyForm = mongoose.models.AgencyForm || mongoose.model('AgencyForm', new mongoose.Schema({ status: String }));

    const unreadMsgs = await Message.countDocuments({ status: 'unread' });
    const totalMsgs = await Message.countDocuments();

    const unreadCmts = await Comment.countDocuments({ status: 'unread' });
    const totalCmts = await Comment.countDocuments();

    const unreadAgencies = await AgencyForm.countDocuments({ status: 'unread' });
    const totalAgencies = await AgencyForm.countDocuments();

    return { 
      success: true, 
      data: { unreadMsgs, totalMsgs, unreadCmts, totalCmts, unreadAgencies, totalAgencies } 
    };
  } catch (error) {
    return { success: false, data: { unreadMsgs: 0, totalMsgs: 0, unreadCmts: 0, totalCmts: 0, unreadAgencies: 0, totalAgencies: 0 } };
  }
}