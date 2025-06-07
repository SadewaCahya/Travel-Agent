const express = require('express');
const router = express.Router();
const pembayaranController = require('../controllers/pembayaranController');

// CRUD Pembayaran
router.get('/', pembayaranController.getAllPembayaran);
router.get('/:id', pembayaranController.getPembayaranById);
router.post('/', pembayaranController.createPembayaran);
router.put('/:id', pembayaranController.updatePembayaran);
router.delete('/:id', pembayaranController.deletePembayaran);

module.exports = router;