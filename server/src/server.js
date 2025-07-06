const express = require('express');
const app = express();
const PORT = 5000;

app.get('/api/test', (req, res) => {
  console.log('Route appelée !');
  res.json({ message: 'Serveur fonctionne !' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Serveur démarré sur http://127.0.0.1:${PORT}`);
});