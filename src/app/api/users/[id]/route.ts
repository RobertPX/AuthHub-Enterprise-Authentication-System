import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requireRole, hashPassword, getClientInfo } from '@/lib/auth';
import { handleError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { updateUserSchema, updateRoleSchema } from '@/validators/user.schema';
import logger from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireAuth();

    // Users can only view themselves, ADMIN can view anyone
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenError('You can only view your own profile');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireAuth();
    const { ip } = getClientInfo(request);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Parse request body
    const body = await request.json();

    // Check if trying to update role (ADMIN only)
    if (body.role !== undefined) {
      await requireRole(['ADMIN']);
      const { role } = updateRoleSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'UPDATE_USER_ROLE',
          ip,
          metadata: { targetUserId: id, newRole: role },
        },
      });

      logger.audit('UPDATE_USER_ROLE', currentUser.id, { targetUserId: id, newRole: role });

      return Response.json({
        success: true,
        data: updatedUser,
        message: 'User role updated successfully',
      });
    }

    // Regular profile update - users can update themselves, ADMIN can update anyone
    if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
      throw new ForbiddenError('You can only update your own profile');
    }

    const validatedData = updateUserSchema.parse(body);

    // Hash password if provided
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.password) {
      updateData.password = await hashPassword(validatedData.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE_USER',
        ip,
        metadata: { targetUserId: id, fields: Object.keys(validatedData) },
      },
    });

    logger.audit('UPDATE_USER', currentUser.id, { targetUserId: id });

    return Response.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireRole(['ADMIN']);
    const { ip } = getClientInfo(request);

    // Prevent self-deletion
    if (currentUser.id === id) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Delete user (cascades to sessions and audit logs)
    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE_USER',
        ip,
        metadata: { deletedUserId: id, deletedEmail: existingUser.email },
      },
    });

    logger.audit('DELETE_USER', currentUser.id, { deletedUserId: id });

    return Response.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
