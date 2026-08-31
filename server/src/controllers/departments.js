const { supabase, one, maybeOne, many, doc, docs, enrich, publicUser } = require('../data');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const DEFAULT_DEPARTMENTS = [
  { name: 'Artificial Intelligence', code: 'AI', description: 'Department of Artificial Intelligence' },
  { name: 'Information Technology', code: 'IT', description: 'Department of Information Technology' },
  { name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science & Engineering' },
  { name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
  { name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' },
  { name: 'Computer Science & Business Systems', code: 'CSBS', description: 'Department of Computer Science & Business Systems' },
  { name: 'Master of Business Administration', code: 'MBA', description: 'Department of Management Studies (MBA)' },
  { name: 'Master of Computer Applications', code: 'MCA', description: 'Department of Computer Applications (MCA)' },
  { name: 'Cyber Security', code: 'CYBER', description: 'Department of Cyber Security' },
  { name: 'Freshman Engineering', code: 'FE', description: 'Department of Freshman Engineering / Science & Humanities' },
  { name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Department of Electronics & Communication Engineering' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE', description: 'Department of Electrical & Electronics Engineering' },
  { name: 'VLSI Design & Technology', code: 'VLSI', description: 'Department of VLSI Design & Technology' },
];

const seedDefaultDepartments = async () => {
  try {
    const existing = await many(supabase.from('departments').select('code,name'));
    const existingCodes = new Set(existing.map((d) => d.code?.toUpperCase()));
    const missing = DEFAULT_DEPARTMENTS.filter((d) => !existingCodes.has(d.code?.toUpperCase()));
    if (missing.length > 0) {
      await supabase.from('departments').insert(missing);
    }
  } catch (err) {
    // If table does not exist or seeding fails, silently continue
  }
};

// GET /api/departments
exports.getDepartments = asyncHandler(async (req, res) => {
  await seedDefaultDepartments();

  let depts = [];
  try {
    depts = await many(supabase.from('departments').select('*').order('name', { ascending: true }));
  } catch (err) {
    // Fallback in case table is not created yet
    depts = DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, ...d }));
  }

  // Enrich each department with HOD user details, faculty count, and student count
  const enriched = await Promise.all(
    depts.map(async (d) => {
      const item = doc(d);
      let hod = null;
      if (d.hod_id) {
        const hodUser = await maybeOne(supabase.from('users').select('*').eq('id', d.hod_id));
        if (hodUser) hod = publicUser(hodUser);
      }

      // If no direct hod_id, check if a user with role 'hod' matches this department name or code
      if (!hod) {
        const hodUser = await maybeOne(
          supabase.from('users').select('*').eq('role', 'hod').or(`department.eq.${d.name},department.eq.${d.code}`)
        );
        if (hodUser) hod = publicUser(hodUser);
      }

      // Faculty count in department
      let facultyCount = 0;
      let studentCount = 0;
      try {
        const [facRes, stuRes] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty').or(`department.eq.${d.name},department.eq.${d.code}`),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').or(`department.eq.${d.name},department.eq.${d.code}`),
        ]);
        facultyCount = facRes.count || 0;
        studentCount = stuRes.count || 0;
      } catch (e) {}

      return {
        ...item,
        hod,
        facultyCount,
        studentCount,
      };
    })
  );

  res.status(200).json({ success: true, data: enriched });
});

// POST /api/departments (Admin only)
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, hodId } = req.body;
  if (!name || !code) {
    throw ApiError.badRequest('Department name and code are required');
  }

  const existing = await maybeOne(
    supabase.from('departments').select('id').or(`name.eq.${name},code.eq.${code}`)
  );
  if (existing) {
    throw ApiError.conflict('Department with this name or code already exists');
  }

  const payload = {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description ? description.trim() : null,
    hod_id: hodId || null,
  };

  const created = await one(supabase.from('departments').insert(payload).select());

  // If initial HOD assigned, promote user
  if (hodId) {
    await supabase.from('users').update({ role: 'hod', department: payload.name }).eq('id', hodId);
  }

  res.status(201).json({ success: true, data: doc(created) });
});

// PUT /api/departments/:id (Admin only)
exports.updateDepartment = asyncHandler(async (req, res) => {
  const dept = await maybeOne(supabase.from('departments').select('*').eq('id', req.params.id));
  if (!dept) throw ApiError.notFound('Department not found');

  const { name, code, description, hodId } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (code !== undefined) updates.code = code.trim().toUpperCase();
  if (description !== undefined) updates.description = description ? description.trim() : null;
  if (hodId !== undefined) updates.hod_id = hodId || null;

  const updated = await one(supabase.from('departments').update(updates).eq('id', dept.id).select());

  if (hodId && hodId !== dept.hod_id) {
    await supabase.from('users').update({ role: 'hod', department: updated.name }).eq('id', hodId);
  }

  res.status(200).json({ success: true, data: doc(updated) });
});

// PUT /api/departments/:id/assign-hod (Admin only)
exports.assignHOD = asyncHandler(async (req, res) => {
  const { hodId } = req.body;
  if (!hodId) throw ApiError.badRequest('HOD user ID is required');

  const dept = await maybeOne(supabase.from('departments').select('*').eq('id', req.params.id));
  if (!dept) throw ApiError.notFound('Department not found');

  const targetUser = await maybeOne(supabase.from('users').select('*').eq('id', hodId));
  if (!targetUser) throw ApiError.notFound('Target user not found');

  // Update department's hod_id
  await supabase.from('departments').update({ hod_id: hodId }).eq('id', dept.id);

  // Promote user to HOD and assign department
  const updatedUser = await one(
    supabase.from('users').update({ role: 'hod', department: dept.name }).eq('id', hodId).select()
  );

  res.status(200).json({
    success: true,
    message: `${targetUser.name} is now assigned as HOD of ${dept.name}`,
    data: {
      department: doc(dept),
      hod: publicUser(updatedUser),
    },
  });
});

// DELETE /api/departments/:id (Admin only)
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await maybeOne(supabase.from('departments').select('*').eq('id', req.params.id));
  if (!dept) throw ApiError.notFound('Department not found');

  await supabase.from('departments').delete().eq('id', dept.id);
  res.status(200).json({ success: true, message: 'Department deleted successfully' });
});
