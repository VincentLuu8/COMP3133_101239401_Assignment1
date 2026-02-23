function toISO(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatUser(doc) {
  const u = doc?.toObject ? doc.toObject() : doc;
  return {
    _id: u._id?.toString(),
    username: u.username,
    email: u.email,
    created_at: toISO(u.created_at),
    updated_at: toISO(u.updated_at)
  };
}

export function formatEmployee(doc) {
  const e = doc?.toObject ? doc.toObject() : doc;
  return {
    _id: e._id?.toString(),
    first_name: e.first_name,
    last_name: e.last_name,
    email: e.email,
    gender: e.gender,
    designation: e.designation,
    salary: e.salary,
    date_of_joining: toISO(e.date_of_joining),
    department: e.department,
    employee_photo: e.employee_photo || null,
    created_at: toISO(e.created_at),
    updated_at: toISO(e.updated_at)
  };
}