// Datos locales de prueba — se usan cuando Supabase no está configurado
let tenants = [
  { id:1, name:"MOGA Veterinaria", adminEmail:"admin@moga.cl", phone:"+56 9 1234 5678", city:"Santiago", plan:"Clínica", status:"active", createdAt:"2026-01-01" },
];
let users = [
  { id:1, name:"Administrador Root", username:"root", email:"root@zovita.cl", password:"admin123", role:"superadmin", isRoot:true,  phone:"+56 9 0000 0000", rut:null, avatar:"RO", tenantId:null },
  { id:2, name:"Dra. María González", email:"admin@moga.cl", password:"admin123", role:"admin",      phone:"+56 9 1234 5678", rut:null, avatar:"MG", tenantId:1 },
  { id:3, name:"Dr. Carlos Pérez",    email:"vet@moga.cl",   password:"vet123",   role:"vet",        phone:"+56 9 8765 4321", rut:null, avatar:"CP", tenantId:1 },
  { id:4, name:"Ana Torres",          email:"ana@email.cl",  password:"123456",   role:"client",     phone:"+56 9 1111 2222", rut:"12.345.678-9",  tenantId:1 },
  { id:5, name:"Pedro Soto",          email:"pedro@email.cl",password:"123456",   role:"client",     phone:"+56 9 3333 4444", rut:"9.876.543-2",   tenantId:1 },
];
let pets = [
  { id:1, name:"Luna",  species:"Perro", breed:"Labrador Dorado",  age:3, weight:25.5, color:"Dorado",        gender:"Hembra", chip:"985141002123456", ownerId:4, tenantId:1 },
  { id:2, name:"Michi", species:"Gato",  breed:"Siamés",           age:5, weight:4.2,  color:"Blanco/Café",   gender:"Macho",  chip:"985141009876543", ownerId:4, tenantId:1 },
  { id:3, name:"Rocky", species:"Perro", breed:"Bulldog Francés",  age:2, weight:12.0, color:"Atigrado",      gender:"Macho",  chip:"985141005432198", ownerId:5, tenantId:1 },
  { id:4, name:"Nala",  species:"Perro", breed:"Golden Retriever", age:4, weight:28.0, color:"Dorado oscuro", gender:"Hembra", chip:"985141001357924", ownerId:5, tenantId:1 },
];
let records = [
  { id:1, petId:1, date:"2024-01-15", vet:"Dra. María González", type:"Control",  diagnosis:"Animal sano, control rutinario",        treatment:"Vacuna antirrábica y desparasitación", weight:24.8, temperature:"38.5", notes:"Mascota en excelente condición corporal.", nextVisit:"2025-01-15", tenantId:1 },
  { id:2, petId:1, date:"2024-07-20", vet:"Dr. Carlos Pérez",    type:"Urgencia", diagnosis:"Otitis externa bilateral leve",           treatment:"Limpieza ótica + Otospray 7 días",     weight:25.2, temperature:"38.8", notes:"Control en 10 días si no mejora.",         nextVisit:"2024-07-30", tenantId:1 },
  { id:3, petId:2, date:"2024-03-10", vet:"Dra. María González", type:"Control",  diagnosis:"Control anual. Vacunas al día.",         treatment:"Vacuna triple felina",                  weight:4.0,  temperature:"38.3", notes:"Peso en rango ideal para la raza.",        nextVisit:"2025-03-10", tenantId:1 },
  { id:4, petId:3, date:"2024-09-05", vet:"Dr. Carlos Pérez",    type:"Control",  diagnosis:"Revisión dental. Sarro moderado.",       treatment:"Limpieza dental bajo anestesia",        weight:11.8, temperature:"38.6", notes:"Traer en ayunas de 8 horas.",              nextVisit:"2024-10-01", tenantId:1 },
  { id:5, petId:4, date:"2024-11-20", vet:"Dra. María González", type:"Control",  diagnosis:"Control post-operatorio esterilización", treatment:"Antibiótico 5 días + AINE 3 días",     weight:27.5, temperature:"38.4", notes:"Cicatrización excelente.",                 nextVisit:"2024-12-05", tenantId:1 },
];
let grooming = [
  { id:1, petId:1, clientId:4, date:"2026-04-28", time:"10:00", service:"Baño y corte completo",          status:"confirmada", notes:"Traer sin collar",       price:18000, tenantId:1 },
  { id:2, petId:3, clientId:5, date:"2026-05-02", time:"14:30", service:"Baño y secado",                  status:"pendiente",  notes:"Shampoo hipoalergénico", price:12000, tenantId:1 },
  { id:3, petId:2, clientId:4, date:"2026-04-20", time:"11:00", service:"Corte de uñas + limpieza ótica", status:"completada", notes:"",                       price:8000,  tenantId:1 },
  { id:4, petId:4, clientId:5, date:"2026-05-05", time:"09:00", service:"Baño y corte completo",          status:"confirmada", notes:"",                       price:20000, tenantId:1 },
  { id:5, petId:2, clientId:4, date:"2026-05-12", time:"15:00", service:"Baño y secado",                  status:"pendiente",  notes:"",                       price:10000, tenantId:1 },
];
let vaccines = [
  { id:1, petId:1, name:"Antirrábica",     dateApplied:"2025-01-15", nextDue:"2026-01-15", vet:"Dra. María González", lot:"VR2025-A01", tenantId:1 },
  { id:2, petId:1, name:"Sétuple canina",  dateApplied:"2025-01-15", nextDue:"2026-01-15", vet:"Dra. María González", lot:"SC2025-B02", tenantId:1 },
  { id:3, petId:2, name:"Triple felina",   dateApplied:"2025-03-10", nextDue:"2026-03-10", vet:"Dra. María González", lot:"TF2025-C03", tenantId:1 },
  { id:4, petId:2, name:"Leucemia felina", dateApplied:"2025-03-10", nextDue:"2026-05-10", vet:"Dra. María González", lot:"LF2025-D04", tenantId:1 },
  { id:5, petId:3, name:"Antirrábica",     dateApplied:"2025-09-01", nextDue:"2026-09-01", vet:"Dr. Carlos Pérez",    lot:"VR2025-E05", tenantId:1 },
  { id:6, petId:3, name:"Sétuple canina",  dateApplied:"2025-09-05", nextDue:"2026-09-05", vet:"Dr. Carlos Pérez",    lot:"SC2025-F06", tenantId:1 },
  { id:7, petId:4, name:"Antirrábica",     dateApplied:"2025-11-20", nextDue:"2026-11-20", vet:"Dra. María González", lot:"VR2025-G07", tenantId:1 },
  { id:8, petId:4, name:"Sétuple canina",  dateApplied:"2025-11-20", nextDue:"2026-11-20", vet:"Dra. María González", lot:"SC2025-H08", tenantId:1 },
];
let appointments = [
  { id:1, petId:1, clientId:4, staffId:2, date:"2026-04-28", time:"09:00", duration:30, type:"consulta",   status:"confirmada", notes:"Control rutinario anual",     tenantId:1 },
  { id:2, petId:3, clientId:5, staffId:3, date:"2026-04-28", time:"11:00", duration:30, type:"control",    status:"pendiente",  notes:"",                            tenantId:1 },
  { id:3, petId:2, clientId:4, staffId:2, date:"2026-04-28", time:"14:30", duration:45, type:"peluqueria", status:"confirmada", notes:"Corte y baño completo",        tenantId:1 },
  { id:4, petId:4, clientId:5, staffId:2, date:"2026-04-29", time:"10:00", duration:30, type:"vacuna",     status:"confirmada", notes:"Antirrábica anual",            tenantId:1 },
  { id:5, petId:1, clientId:4, staffId:3, date:"2026-04-29", time:"15:00", duration:30, type:"consulta",   status:"pendiente",  notes:"Revisión post-tratamiento",    tenantId:1 },
  { id:6, petId:3, clientId:5, staffId:2, date:"2026-04-30", time:"09:30", duration:60, type:"urgencia",   status:"completada", notes:"Ingesta de objeto extraño",    tenantId:1 },
  { id:7, petId:2, clientId:4, staffId:3, date:"2026-05-01", time:"11:00", duration:30, type:"control",    status:"confirmada", notes:"",                            tenantId:1 },
  { id:8, petId:4, clientId:5, staffId:2, date:"2026-05-02", time:"16:00", duration:30, type:"consulta",   status:"pendiente",  notes:"Revisión dermatológica",       tenantId:1 },
];
let payments = [
  { id:1, concept:"Consulta — Control rutinario Luna",      petId:1, clientId:4, date:"2024-01-15", amount:25000,  category:"Consulta",      status:"pagado",    method:"Débito",        tenantId:1 },
  { id:2, concept:"Urgencia — Otitis externa Luna",         petId:1, clientId:4, date:"2024-07-20", amount:45000,  category:"Urgencia",      status:"pagado",    method:"Efectivo",      tenantId:1 },
  { id:3, concept:"Consulta — Control anual Michi",         petId:2, clientId:4, date:"2024-03-10", amount:25000,  category:"Consulta",      status:"pagado",    method:"Transferencia", tenantId:1 },
  { id:4, concept:"Limpieza dental Rocky",                  petId:3, clientId:5, date:"2024-09-05", amount:85000,  category:"Procedimiento", status:"pagado",    method:"Crédito",       tenantId:1 },
  { id:5, concept:"Cirugía esterilización Nala",            petId:4, clientId:5, date:"2024-11-20", amount:180000, category:"Cirugía",       status:"pagado",    method:"Transferencia", tenantId:1 },
  { id:6, concept:"Peluquería — Corte uñas Michi",          petId:2, clientId:4, date:"2026-04-20", amount:8000,   category:"Peluquería",    status:"pagado",    method:"Efectivo",      tenantId:1 },
  { id:7, concept:"Peluquería — Baño y corte Luna",         petId:1, clientId:4, date:"2026-04-28", amount:18000,  category:"Peluquería",    status:"pendiente", method:null,            tenantId:1 },
  { id:8, concept:"Peluquería — Baño Rocky",                petId:3, clientId:5, date:"2026-05-02", amount:12000,  category:"Peluquería",    status:"pendiente", method:null,            tenantId:1 },
  { id:9, concept:"Peluquería — Baño y corte Nala",         petId:4, clientId:5, date:"2026-05-05", amount:20000,  category:"Peluquería",    status:"pendiente", method:null,            tenantId:1 },
];

let blockedSlots = [];

const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1;
const byTenant = (arr, tenantId) => tenantId == null ? arr : arr.filter((x) => x.tenantId === tenantId);

export const store = {
  tenants: {
    findAll:      ()      => [...tenants].sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    findById:     (id)    => tenants.find((t) => t.id === id) ?? null,
    findByEmail:  (email) => tenants.find((t) => t.adminEmail === email) ?? null,
    create: (t) => { const rec = { ...t, id: nextId(tenants) }; tenants.push(rec); return rec; },
    update: (id, fields) => {
      const i = tenants.findIndex((t) => t.id === id);
      if (i === -1) throw new Error("No encontrado");
      tenants[i] = { ...tenants[i], ...fields };
      return { ...tenants[i] };
    },
  },
  users: {
    findAll:            (tenantId)  => byTenant([...users], tenantId),
    findById:           (id)        => users.find((u) => u.id === id) ?? null,
    findByEmail:        (email)     => users.find((u) => u.email === email) ?? null,
    findByUsername:     (uname)     => users.find((u) => u.username === uname) ?? null,
    findByRutOrEmail:   (q)         => users.find((u) => u.rut === q || u.email === q) ?? null,
    create:             (u)         => { const rec = { ...u, id: nextId(users) }; users.push(rec); return rec; },
    update:             (id, fields) => {
      const i = users.findIndex((u) => u.id === id);
      if (i === -1) throw new Error("No encontrado");
      users[i] = { ...users[i], ...fields };
      return { ...users[i] };
    },
    remove:             (id) => {
      const i = users.findIndex((u) => u.id === id);
      if (i === -1) throw new Error("No encontrado");
      users.splice(i, 1);
    },
  },
  pets: {
    findAll:       (tenantId)        => byTenant([...pets], tenantId),
    findById:      (id)              => pets.find((p) => p.id === id) ?? null,
    findByOwnerId: (ownerId, tenantId) => byTenant(pets.filter((p) => p.ownerId === ownerId), tenantId),
    create:        (p)               => { const rec = { ...p, id: nextId(pets) }; pets.push(rec); return rec; },
  },
  records: {
    findAll:      (tenantId) => byTenant([...records], tenantId).sort((a,b) => b.date.localeCompare(a.date)),
    findByPetId:  (petId)    => records.filter((r) => r.petId === petId).sort((a,b) => b.date.localeCompare(a.date)),
    create:       (r)        => { const rec = { ...r, id: nextId(records) }; records.push(rec); return rec; },
  },
  grooming: {
    findAll:       (tenantId)  => byTenant([...grooming], tenantId).sort((a,b) => a.date.localeCompare(b.date)),
    findByClientId:(clientId)  => grooming.filter((g) => g.clientId === clientId).sort((a,b) => a.date.localeCompare(b.date)),
    create:        (g)         => { const rec = { ...g, id: nextId(grooming) }; grooming.push(rec); return rec; },
    updateStatus:  (id, status) => {
      const g = grooming.find((g) => g.id === id);
      if (!g) throw new Error("No encontrado");
      g.status = status;
      return { ...g };
    },
  },
  vaccines: {
    findAll:     (tenantId) => byTenant([...vaccines], tenantId),
    findByPetId: (petId)    => vaccines.filter((v) => v.petId === petId),
    create:      (v)        => { const rec = { ...v, id: nextId(vaccines) }; vaccines.push(rec); return rec; },
  },
  appointments: {
    findAll:       (tenantId)  => byTenant([...appointments], tenantId).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    findByClientId:(clientId)  => appointments.filter((a) => a.clientId === clientId).sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    create: (a) => { const rec = { ...a, id: nextId(appointments) }; appointments.push(rec); return rec; },
    update: (id, fields) => {
      const i = appointments.findIndex((a) => a.id === id);
      if (i === -1) throw new Error("No encontrado");
      appointments[i] = { ...appointments[i], ...fields };
      return { ...appointments[i] };
    },
    remove: (id) => {
      const i = appointments.findIndex((a) => a.id === id);
      if (i === -1) throw new Error("No encontrado");
      appointments.splice(i, 1);
    },
  },
  blockedSlots: {
    findAll:  (tenantId) => byTenant([...blockedSlots], tenantId),
    create:   (b)        => { const rec = { ...b, id: nextId(blockedSlots) }; blockedSlots.push(rec); return rec; },
    remove:   (id)       => {
      const i = blockedSlots.findIndex((b) => b.id === id);
      if (i === -1) throw new Error("No encontrado");
      blockedSlots.splice(i, 1);
    },
  },
  payments: {
    findAll:       (tenantId)  => byTenant([...payments], tenantId).sort((a,b) => b.date.localeCompare(a.date)),
    findByClientId:(clientId)  => payments.filter((p) => p.clientId === clientId).sort((a,b) => b.date.localeCompare(a.date)),
    create:        (p)         => { const rec = { ...p, id: nextId(payments) }; payments.push(rec); return rec; },
    markPaid:      (id, method) => {
      const p = payments.find((p) => p.id === id);
      if (!p) throw new Error("No encontrado");
      p.status = "pagado"; p.method = method;
      return { ...p };
    },
  },
};
