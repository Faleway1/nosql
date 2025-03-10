const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect("mongodb://localhost:27017/adresses_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schéma et modèle MongoDB
const ItemSchema = new mongoose.Schema({
  nom: String,
});
const Item = mongoose.model("Item", ItemSchema);

// Route : Afficher les 20 premiers éléments avec ajout, modification et suppression
router.get("/xxx", async (req, res) => {
  const items = await Item.find().limit(20);
  res.json(items);
});

// Route : Afficher le formulaire d'ajout
router.get("/xxx/edit", (req, res) => {
  res.send('<form action="/xxx/edit" method="POST">Nom: <input type="text" name="nom"><button type="submit">Ajouter</button></form>');
});

// Route : Ajouter un élément
router.post("/xxx/edit", async (req, res) => {
  await Item.create({ nom: req.body.nom });
  res.redirect("/xxx");
});

// Route : Afficher le formulaire de modification
router.get("/xxx/edit/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.send(`<form action="/xxx/edit/${item._id}" method="POST">Nom: <input type="text" name="nom" value="${item.nom}"><button type="submit">Modifier</button></form>`);
});

// Route : Modifier un élément
router.post("/xxx/edit/:id", async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, { nom: req.body.nom });
  res.redirect("/xxx");
});

// Route : Supprimer un élément
router.post("/xxx/delete/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect("/xxx");
});

module.exports = router;

