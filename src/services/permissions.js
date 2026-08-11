// Central permission matrix. Roles map to a fixed set of permission codes
// that are embedded into the JWT at login time and checked by requirePermission().

export const ALL_PERMISSIONS = [
  'customers.view', 'customers.view_all', 'customers.create', 'customers.edit', 'customers.delete',
  'pipelines.view', 'pipelines.create', 'pipelines.delete',
  'stages.create', 'stages.edit', 'stages.delete',
  'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
  'notes.view', 'notes.create', 'notes.delete',
  'activity.view',
  'webhooks.view', 'webhooks.create', 'webhooks.delete',
  'api.view', 'api.manage',
  'users.view', 'users.manage',
  'settings.view', 'settings.edit',
  'google.manage'
];

// Cross-tenant business management (create/list/disable/delete/impersonate
// other businesses) is NOT part of the role/permission matrix on purpose -
// it is gated separately by the isPlatformOwner flag (see requirePlatformOwner
// in middleware/tenant.js), so a tenant's own admin can never manage other
// tenants no matter what role they hold.

export const ROLE_PERMISSIONS = {
  admin: [...ALL_PERMISSIONS],
  manager: [
    'customers.view', 'customers.view_all', 'customers.create', 'customers.edit', 'customers.delete',
    'pipelines.view', 'pipelines.create', 'pipelines.delete',
    'stages.create', 'stages.edit', 'stages.delete',
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
    'notes.view', 'notes.create', 'notes.delete',
    'activity.view',
    'webhooks.view', 'webhooks.create', 'webhooks.delete',
    'api.view',
    'users.view',
    'settings.view'
  ],
  sales_rep: [
    'customers.view', 'customers.create', 'customers.edit',
    'pipelines.view',
    'tasks.view', 'tasks.create', 'tasks.edit',
    'notes.view', 'notes.create',
    'activity.view'
  ],
  viewer: [
    'customers.view',
    'pipelines.view',
    'tasks.view',
    'notes.view',
    'activity.view'
  ]
};

export const ROLE_LABELS = {
  admin: 'מנהל מערכת',
  manager: 'מנהל צוות',
  sales_rep: 'איש מכירות',
  viewer: 'צפייה בלבד'
};

// Conservative permission set for machine-to-machine API key access
// (e.g. Activepieces creating/updating leads and tasks). No delete, no admin panel access.
export const API_KEY_PERMISSIONS = [
  'customers.view', 'customers.create', 'customers.edit',
  'pipelines.view',
  'tasks.view', 'tasks.create', 'tasks.edit',
  'notes.view', 'notes.create'
];
