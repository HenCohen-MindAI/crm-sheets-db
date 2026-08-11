import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS } from './permissions.js';

// Mock user database
const users = new Map();

function seedDemoUser() {
  const passwordHash = bcrypt.hashSync('password', 10);
  const user = {
    id: 'user-1',
    tenant_id: 'tenant-1',
    name: 'Admin User',
    email: 'admin@test.com',
    password_hash: passwordHash,
    role: 'admin',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  users.set(user.id, user);
}

seedDemoUser();

export function findUserByEmail(email) {
  return Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase() && u.active);
}

export function getUser(id) {
  return users.get(id);
}

export function listUsersByTenant(tenantId) {
  return Array.from(users.values()).filter(u => u.tenant_id === tenantId && u.active);
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function createUser(tenantId, { name, email, password, role }) {
  if (!ROLE_PERMISSIONS[role]) {
    throw new Error(`תפקיד לא תקין: ${role}`);
  }
  if (findUserByEmail(email)) {
    throw new Error('כתובת האימייל כבר בשימוש');
  }

  const user = {
    id: uuidv4(),
    tenant_id: tenantId,
    name,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    role,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.set(user.id, user);
  return user;
}

export function updateUser(id, tenantId, updates) {
  const user = users.get(id);
  if (!user || user.tenant_id !== tenantId) return null;

  if (updates.role && !ROLE_PERMISSIONS[updates.role]) {
    throw new Error(`תפקיד לא תקין: ${updates.role}`);
  }
  if (updates.password) {
    updates.password_hash = bcrypt.hashSync(updates.password, 10);
    delete updates.password;
  }

  Object.assign(user, updates, { updated_at: new Date().toISOString() });
  return user;
}

export function deactivateUser(id, tenantId) {
  const user = users.get(id);
  if (!user || user.tenant_id !== tenantId) return null;
  user.active = false;
  user.updated_at = new Date().toISOString();
  return user;
}

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
}
