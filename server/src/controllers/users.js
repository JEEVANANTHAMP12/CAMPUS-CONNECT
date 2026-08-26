const bcrypt = require('bcryptjs');
const { supabase, many, maybeOne, count, page, range, publicUser, enrich, one } = require('../data');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
exports.getUsers = async (req,res) => { try { const p=page(req.query.page,1), l=page(req.query.limit,20); let q=supabase.from('users').select('*',{count:'exact'}); if(req.query.role)q=q.eq('role',req.query.role); if(req.query.department)q=q.eq('department',req.query.department); if(req.query.search)q=q.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%`); const {data,error,count:total}=await q.range(...range(p,l)); if(error)throw error; res.status(200).json({success:true,data:await Promise.all(data.map(async x=>{const u=publicUser(x);u.clubs=await Promise.all((await many(supabase.from('club_members').select('club_id').eq('user_id',x.id))).map(async m=>enrich('clubs',await maybeOne(supabase.from('clubs').select('*').eq('id',m.club_id)))));return u;})),total,pages:Math.ceil(total/l)});}catch(err){res.status(500).json({success:false,message:err.message});} };
exports.getUser=async(req,res)=>{try{const u=await maybeOne(supabase.from('users').select('*').eq('id',req.params.id));if(!u)return res.status(404).json({success:false,message:'User not found'});res.status(200).json({success:true,data:publicUser(u)});}catch(err){res.status(500).json({success:false,message:err.message});}};
exports.deleteUser=async(req,res)=>{try{await supabase.from('users').delete().eq('id',req.params.id);res.status(200).json({success:true,message:'User deleted'});}catch(err){res.status(500).json({success:false,message:err.message});}};
exports.updateUserRole=async(req,res)=>{try{const {data,error}=await supabase.from('users').update({role:req.body.role}).eq('id',req.params.id).select().single();if(error)throw error;res.status(200).json({success:true,data:publicUser(data)});}catch(err){res.status(500).json({success:false,message:err.message});}};

// POST /api/users - hierarchical creation: admin -> hod, hod -> faculty (staff). Students only via /api/auth/register
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, year } = req.body;
    const creatorRole = req.user.role;
    const targetRole = String(role || '').toLowerCase();

    // Validate required
    if (!name || !email || !password || !targetRole) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    }
    if (!['hod', 'faculty'].includes(targetRole)) {
      return res.status(400).json({ success: false, message: 'Only hod and faculty can be created via this endpoint. Students must register via /api/auth/register' });
    }
    // Hierarchy enforcement
    if (creatorRole === 'admin') {
      if (!['hod', 'faculty'].includes(targetRole)) {
        return res.status(403).json({ success: false, message: 'Admin can only create hod or faculty' });
      }
    } else if (creatorRole === 'hod') {
      if (targetRole !== 'faculty') {
        return res.status(403).json({ success: false, message: 'HOD can only create faculty (staff)' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'Only admin or HOD can create users' });
    }

    if (await maybeOne(supabase.from('users').select('id').eq('email', String(email).toLowerCase()))) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, env.bcryptRounds);
    // HOD's department is forced to creator's department if not provided, to keep staff in same dept
    const finalDept = department || (creatorRole === 'hod' ? req.user.department : null);
    const payload = {
      name,
      email: String(email).toLowerCase(),
      password: hash,
      role: targetRole,
      department: finalDept,
      year: year ? Number(year) : null,
    };
    const inserted = await one(supabase.from('users').insert(payload).select());
    return res.status(201).json({ success: true, data: publicUser(inserted) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
