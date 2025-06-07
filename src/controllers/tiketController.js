const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.getAllTikets = async (req, res) => {
  try {
    const tikets = await prisma.tiket.findMany()
    res.json(tikets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getTiketById = async (req, res) => {
  try {
    const tiket = await prisma.tiket.findUnique({ where: { id: Number(req.params.id) } })
    if (!tiket) return res.status(404).json({ message: 'Tiket not found' })
    res.json(tiket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createTiket = async (req, res) => {
  try {
    const { nama, harga, stok } = req.body
    const tiket = await prisma.tiket.create({ data: { nama, harga, stok } })
    res.status(201).json(tiket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateTiket = async (req, res) => {
  try {
    const { nama, harga, stok } = req.body
    const tiket = await prisma.tiket.update({
      where: { id: Number(req.params.id) },
      data: { nama, harga, stok }
    })
    res.json(tiket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteTiket = async (req, res) => {
  try {
    await prisma.tiket.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Tiket deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}