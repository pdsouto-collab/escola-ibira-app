import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    if (!id) {
      return new NextResponse("ID do usuário é obrigatório", { status: 400 });
    }

    const updateData = { ...body };
    const { currentPassword, password: newPassword } = body;

    // Se a senha estiver sendo atualizada, precisamos validar a antiga e fazer o hash da nova
    if (newPassword && newPassword.trim() !== "") {

      const dbUser = await prisma.user.findUnique({ where: { id } });
      if (!dbUser || !dbUser.password) {
        return new NextResponse("Usuário não encontrado ou sem senha", { status: 404 });
      }

      // Se currentPassword foi enviado, SEMPRE valida — independente de sessão
      if (currentPassword) {
        const bcrypt = await import("bcryptjs");
        const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isPasswordValid) {
          return new NextResponse("Senha atual incorreta", { status: 401 });
        }
      } else {
        // Se não foi enviada a senha atual, só permite se for admin/director na sessão
        const { getServerSession } = await import("next-auth/next");
        const { authOptions } = await import("../../auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);
        const isAdminOrDirector = session?.user && ["admin", "director"].includes((session.user as any).role);
        if (!isAdminOrDirector) {
          return new NextResponse("Senha atual é obrigatória", { status: 400 });
        }
      }

      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(newPassword, 10);
      delete updateData.currentPassword;
    } else {
      // Se newPassword estiver vazio, garante que não tentamos atualizar o campo senha
      delete updateData.password;
      delete updateData.currentPassword;
    }

    const user = await prisma.user.update({
      where: {
        id
      },
      data: updateData
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PUT]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("ID do usuário é obrigatório", { status: 400 });
    }

    const user = await prisma.user.delete({
      where: {
        id
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
