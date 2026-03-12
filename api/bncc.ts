import { NextResponse } from "next/server.js";
import prisma from "../lib/prisma.js";
import { LibraryItem } from "@/types/library-item.js";
import { subGroupRename } from "@/types/sub-group-rename";

export async function GET() {
  const bncc = await prisma.bncc.findMany();
  return NextResponse.json(bncc);
}

export async function POST(request: Request){
  const item: LibraryItem = await request.json();
  const created = await prisma.bncc.create({
    data: item
  });
  return NextResponse.json(created);
}

export async function DELETE(request: Request){
  const id = await request.text();
  await prisma.bncc.delete({
    where: { id }
  });
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {

  const type = request.headers.get("type")

  if (type === 'updateBncc') {

    const item: LibraryItem = await request.json();
    const idDelete = item.id;
    const { id, ...data } = item; // Se item tiver id, pode dar erro porque você está tentando atualizar o id. Então remove ele
    const updated = await prisma.bncc.update({
      where: { id: idDelete },
      data: data
    })
    return NextResponse.json(updated);

  }else if(type === 'renameSubGroup'){

    const item: subGroupRename = await request.json();
    const updated = await prisma.bncc.updateMany({
      where: { 
        subGroup: item.oldName
      },
      data: { 
        subGroup: item.newName
      }
    })
    return NextResponse.json(updated);

  }

}