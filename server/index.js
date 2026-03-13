const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const cors      = require('cors');
const { v4: uuid } = require('uuid');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ── In-memory store ──
let users  = [];   // { id, name, email, password, avatar }
let events = [];   // { id, title, description, date, time, location, category, createdBy, attendees:[], capacity, image }

// ── Seed demo data ──
const DEMO_USER = { id: 'u1', name: 'Omar El akrae', email: 'demo@demo.com', password: 'demo123', avatar: 'OE' };
users.push(DEMO_USER);

const categories = ['Academic', 'Social', 'Sports', 'Tech', 'Arts', 'Career'];
const seedEvents = [
  { title: 'Hackathon 2026', description: 'Build something amazing in 24 hours! Open to all Concordia students.', date: '2026-03-20', time: '09:00', location: 'EV Building, Room 2.260', category: 'Tech', capacity: 100, createdBy: 'u1' },
  { title: 'Study Group — COEN 352', description: 'Final exam prep session. Bring your notes!', date: '2026-03-15', time: '14:00', location: 'Webster Library, Room 303', category: 'Academic', capacity: 20, createdBy: 'u1' },
  { title: 'Engineering Career Fair', description: 'Meet top companies hiring new grads and interns.', date: '2026-03-25', time: '10:00', location: 'Concordia Gym', category: 'Career', capacity: 500, createdBy: 'u1' },
  { title: 'Soccer Tournament', description: 'Inter-faculty 5v5 soccer. Sign up your team!', date: '2026-03-22', time: '13:00', location: 'Loyola Campus Field', category: 'Sports', capacity: 60, createdBy: 'u1' },
];
seedEvents.forEach(e => events.push({ ...e, id: uuid(), attendees: ['u1'] }));

// ── Auth routes ──
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  const user = { id: uuid(), name, email, password, avatar: name.slice(0,2).toUpperCase() };
  users.push(user);
  res.json({ user: sanitize(user) });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user: sanitize(user) });
});

// ── Event routes ──
app.get('/api/events', (req, res) => res.json(events));

app.post('/api/events', (req, res) => {
  const event = { ...req.body, id: uuid(), attendees: [req.body.createdBy] };
  events.push(event);
  io.emit('events:update', events);
  res.json(event);
});

app.delete('/api/events/:id', (req, res) => {
  events = events.filter(e => e.id !== req.params.id);
  io.emit('events:update', events);
  res.json({ ok: true });
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const { userId } = req.body;
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (event.attendees.includes(userId)) {
    event.attendees = event.attendees.filter(a => a !== userId);
  } else {
    if (event.attendees.length >= event.capacity) return res.status(400).json({ error: 'Event is full' });
    event.attendees.push(userId);
  }
  io.emit('events:update', events);
  res.json(event);
});

const sanitize = u => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar });

server.listen(4000, () => console.log('🚀 Server running on http://localhost:4000'));
