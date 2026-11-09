import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import Deposit from "@/models/Deposit";
import User from "@/models/User";
import { verifyAuth } from "@/utils/authCheck";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: "এজেন্ট আইডি দিন" },
        { status: 400 },
      );
    }

    const auth = await verifyAuth("user", null, req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: "অননুমোদিত" },
        { status: 401 },
      );
    }

    const agent = await User.findById(agentId)
      .select("agentMainBalance")
      .lean();
    if (!agent) {
      return NextResponse.json(
        { success: false, message: "এজেন্ট পাওয়া যায়নি" },
        { status: 404 },
      );
    }

    const pendingDeposits = await Deposit.find({
      agentId: agentId,
      status: "pending",
    }).lean();

    let pendingAmount = 0;
    pendingDeposits.forEach((dep) => {
      pendingAmount += Number(dep.amount) || 0;
    });

    const availableBalance =
      (Number(agent.agentMainBalance) || 0) - pendingAmount;

    return NextResponse.json({ success: true, availableBalance });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "সার্ভার এরর" },
      { status: 500 },
    );
  }
}
