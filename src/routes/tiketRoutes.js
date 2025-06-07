const express = require('express');
const router = express.Router();
const tiketController = require('../controllers/tiketController');

// CRUD Tiket
router.get('/', tiketController.getAllTikets);
router.get('/:id', tiketController.getTiketById);
router.post('/', tiketController.createTiket);
router.put('/:id', tiketController.updateTiket);
router.delete('/:id', tiketController.deleteTiket);

module.exports = router;