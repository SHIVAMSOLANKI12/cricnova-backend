import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Identity Domain Seeding...');

  // 1. Seed System Roles
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full system control and configuration',
      isSystem: true,
    },
    {
      name: 'ADMIN',
      displayName: 'Platform Administrator',
      description: 'Manages platform users, disputes, and settings',
      isSystem: true,
    },
    {
      name: 'ORGANIZER',
      displayName: 'Tournament Organizer',
      description: 'Creates and manages tournaments, leagues, and fixtures',
      isSystem: true,
    },
    {
      name: 'GROUND_OWNER',
      displayName: 'Ground / Venue Owner',
      description: 'Manages venue availability, bookings, and slots',
      isSystem: true,
    },
    {
      name: 'TEAM_MANAGER',
      displayName: 'Team Manager',
      description: 'Manages team roster, player invites, and registrations',
      isSystem: true,
    },
    {
      name: 'PLAYER',
      displayName: 'Player',
      description: 'Participates in matches, tracks personal stats and profile',
      isSystem: true,
    },
    {
      name: 'CAPTAIN',
      displayName: 'Team Captain',
      description: 'Leads team on-field, manages playing XI and toss',
      isSystem: true,
    },
    {
      name: 'VICE_CAPTAIN',
      displayName: 'Vice Captain',
      description: 'Assists team captain with squad decisions',
      isSystem: true,
    },
    {
      name: 'SCORER',
      displayName: 'Official Scorer',
      description: 'Authorized ball-by-ball match scorer',
      isSystem: true,
    },
    {
      name: 'UMPIRE',
      displayName: 'Official Umpire',
      description: 'Match official enforcing rules and officiating matches',
      isSystem: true,
    },
  ];

  const rolesMap = {};
  for (const role of rolesData) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, description: role.description },
      create: role,
    });
    rolesMap[role.name] = createdRole;
  }
  console.log(`✅ Seeded ${Object.keys(rolesMap).length} Roles`);

  // 2. Seed Permissions
  const permissionsData = [
    {
      name: 'user:create',
      module: 'users',
      action: 'create',
      description: 'Create user accounts',
      isSystem: true,
    },
    {
      name: 'user:view',
      module: 'users',
      action: 'view',
      description: 'View user profiles',
      isSystem: true,
    },
    {
      name: 'user:update',
      module: 'users',
      action: 'update',
      description: 'Update user profiles',
      isSystem: true,
    },
    {
      name: 'user:delete',
      module: 'users',
      action: 'delete',
      description: 'Delete user accounts',
      isSystem: true,
    },
    {
      name: 'tournament:create',
      module: 'tournaments',
      action: 'create',
      description: 'Create cricket tournaments',
      isSystem: true,
    },
    {
      name: 'tournament:manage',
      module: 'tournaments',
      action: 'manage',
      description: 'Manage tournament rules and fixtures',
      isSystem: true,
    },
    {
      name: 'match:create',
      module: 'matches',
      action: 'create',
      description: 'Schedule new matches',
      isSystem: true,
    },
    {
      name: 'match:score',
      module: 'matches',
      action: 'score',
      description: 'Score live ball-by-ball matches',
      isSystem: true,
    },
    {
      name: 'team:create',
      module: 'teams',
      action: 'create',
      description: 'Form new cricket teams',
      isSystem: true,
    },
    {
      name: 'team:manage',
      module: 'teams',
      action: 'manage',
      description: 'Manage team roster and squads',
      isSystem: true,
    },
  ];

  const permissionsMap = {};
  for (const perm of permissionsData) {
    const createdPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module, action: perm.action },
      create: perm,
    });
    permissionsMap[perm.name] = createdPerm;
  }
  console.log(`✅ Seeded ${Object.keys(permissionsMap).length} Permissions`);

  // 3. Map Super Admin Role to All Permissions
  for (const permKey of Object.keys(permissionsMap)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: rolesMap['SUPER_ADMIN'].id,
          permissionId: permissionsMap[permKey].id,
        },
      },
      update: { isActive: true },
      create: {
        roleId: rolesMap['SUPER_ADMIN'].id,
        permissionId: permissionsMap[permKey].id,
      },
    });
  }
  console.log('✅ Assigned all permissions to SUPER_ADMIN role');

  // 4. Seed Default Super Admin Account
  const passwordHash = await bcrypt.hash('SuperAdminSecret123!', 10);
  const superAdminUser = await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: { status: 'ACTIVE' },
    create: {
      firstName: 'CricNova',
      lastName: 'SuperAdmin',
      username: 'superadmin',
      phone: '+919999999999',
      email: 'admin@cricnova.com',
      passwordHash: passwordHash,
      phoneVerified: true,
      emailVerified: true,
      status: 'ACTIVE',
    },
  });

  // 5. Assign SUPER_ADMIN role to Super Admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: rolesMap['SUPER_ADMIN'].id,
      },
    },
    update: { isActive: true },
    create: {
      userId: superAdminUser.id,
      roleId: rolesMap['SUPER_ADMIN'].id,
    },
  });

  console.log('✅ Super Admin user seeded successfully (+919999999999 / admin@cricnova.com)');
  console.log('🚀 Enterprise Identity Domain Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
