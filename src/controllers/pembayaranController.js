const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.getAllPembayaran = async (req, res) => {
  try {
    const pembayaran = await prisma.pembayaran.findMany({ include: { order: true } })
    res.json(pembayaran)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getPembayaranById = async (req, res) => {
  try {
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: Number(req.params.id) },
      include: { order: true }
    })
    if (!pembayaran) return res.status(404).json({ message: 'Pembayaran not found' })
    res.json(pembayaran)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createPembayaran = async (req, res) => {
  try {
    const { orderId, status, metode } = req.body
    const pembayaran = await prisma.pembayaran.create({
      data: { orderId, status, metode }
    })
    res.status(201).json(pembayaran)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updatePembayaran = async (req, res) => {
  try {
    const { orderId, status, metode } = req.body
    const pembayaran = await prisma.pembayaran.update({
      where: { id: Number(req.params.id) },
      data: { orderId, status, metode }
    })
    res.json(pembayaran)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deletePembayaran = async (req, res) => {
  try {
    await prisma.pembayaran.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Pembayaran deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}