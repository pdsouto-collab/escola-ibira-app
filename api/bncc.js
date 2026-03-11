import prisma from "../lib/prisma.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
      const bncc = await prisma.bncc.findMany();
      return res.status(200).json(bncc);
  }
}