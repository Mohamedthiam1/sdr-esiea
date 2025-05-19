const express = require('express');
const admin = require('firebase-admin');
const app = express();

require('dotenv').config();
app.use(express.json());

// Charger les credentials Firebase depuis la variable d'environnement
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Ajouter une ruche
app.post('/api/ruches', async (req, res) => {
  try {
    const rucheData = req.body;
    const ref = await db.collection('ruches').add(rucheData);
    res.status(201).json({ id: ref.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir toutes les ruches
app.get('/api/ruches', async (req, res) => {
  try {
    const snapshot = await db.collection('ruches').get();
    const ruches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(ruches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une ruche par ID
app.get('/api/ruches/:id', async (req, res) => {
  try {
    const rucheRef = db.collection('ruches').doc(req.params.id);
    const doc = await rucheRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Ruche non trouvée' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une ruche
app.put('/api/ruches/:id', async (req, res) => {
  try {
    const rucheRef = db.collection('ruches').doc(req.params.id);
    await rucheRef.update(req.body);
    res.status(200).json({ message: 'Ruche mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
