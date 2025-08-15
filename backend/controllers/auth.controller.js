const jwt = require('jsonwebtoken');

const users = [
  { username: 'admin', password: 'Crazymgirl.7', role: 'admin' },
  { username: 'marko', password: 'marko123', role: 'clerk' },
  { username: 'ana', password: 'ana123', role: 'manager' },
];

exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username, role: user.role }, 'tajna_rec', { expiresIn: '1h' });
  res.json({ token });
};
