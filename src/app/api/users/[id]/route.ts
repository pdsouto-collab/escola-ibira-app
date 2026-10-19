import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSessionOrJwt } from "@/lib/jwt";
import { headers } from "next/headers";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    const sessionUserRoles: string[] = (session.user as any).roles || [(session.user as any).role];
    const isAdminOrDirector = sessionUserRoles.includes("admin") || sessionUserRoles.includes("director");
    const isSelf = session.user.id === id;

    // Apenas o próprio usuário ou administradores/diretores podem editar um perfil
    if (!isSelf && !isAdminOrDirector) {
      return NextResponse.json(
        { error: "Acesso proibido. Permissão insuficiente para editar este usuário." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData = { ...body };

    // O e-mail de login é permanente e não pode ser alterado após a criação
    delete updateData.email;

    // Apenas admin/diretor pode alterar roles, status ou vínculos de outros usuários
    if (!isAdminOrDirector) {
      delete updateData.role;
      delete updateData.roles;
      delete updateData.status;
      delete updateData.assignedClassIds;
      delete updateData.linkedStudentIds;
    } else {
      if (Array.isArray(updateData.roles) && updateData.roles.length > 0) {
        updateData.role = updateData.roles[0];
      } else if (updateData.role) {
        updateData.roles = [updateData.role];
      }
    }

    const { currentPassword, password: newPassword } = body;

    // Se a senha estiver sendo atualizada
    if (newPassword && newPassword.trim() !== "") {
      const dbUser = await prisma.user.findUnique({ where: { id } });
      if (!dbUser || !dbUser.password) {
        return NextResponse.json({ error: "Usuário não encontrado ou sem senha" }, { status: 404 });
      }

      // Se currentPassword foi enviado, SEMPRE valida — independente de sessão
      if (currentPassword) {
        const bcrypt = await import("bcryptjs");
        const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
        }
      } else {
        // Se não foi enviada a senha atual, só permite se for admin/director na sessão
        if (!isAdminOrDirector) {
          return NextResponse.json({ error: "Senha atual é obrigatória" }, { status: 400 });
        }
      }

      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(newPassword, 10);
      delete updateData.currentPassword;
    } else {
      delete updateData.password;
      delete updateData.currentPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PUT]", error);
    return NextResponse.json({ error: "Erro Interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSessionOrJwt();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sessionUserRoles: string[] = (session.user as any).roles || [(session.user as any).role];
    const isAdminOrDirector = sessionUserRoles.includes("admin") || sessionUserRoles.includes("director");
    const isAdmin = sessionUserRoles.includes("admin");

    if (!isAdminOrDirector) {
      return NextResponse.json(
        { error: "Acesso proibido. Apenas administradores e diretores podem excluir usuários." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    // Não permitir auto-exclusão
    if (session.user.id === id) {
      return NextResponse.json({ error: "Não é permitido excluir o próprio usuário" }, { status: 400 });
    }

    // Busca usuário alvo
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Diretor não pode excluir administrador
    const targetRoles = (targetUser.roles && targetUser.roles.length > 0) ? targetUser.roles : [targetUser.role];
    if (targetRoles.includes("admin") && !isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir outro administrador." },
        { status: 403 }
      );
    }

    // Log de auditoria no console com cabeçalho de rede
    const headersList = await headers();
    const clientIp = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    console.warn(`[AUDIT_USER_DELETE] Executed by user '${session.user.id}' (${session.user.email}) from IP '${clientIp}' UA '${userAgent}' -> Deleted user '${targetUser.id}' (${targetUser.email} / ${targetUser.name})`);

    const user = await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json({ error: "Erro Interno" }, { status: 500 });
  }
}
