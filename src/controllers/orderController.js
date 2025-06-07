const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { user: true, tiket: true, pembayaran: true } })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, tiket: true, pembayaran: true }
    })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createOrder = async (req, res) => {
  try {
    const { userId, tiketId, jumlah } = req.body
    const order = await prisma.order.create({
      data: { userId, tiketId, jumlah }
    })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateOrder = async (req, res) => {
  try {
    const { userId, tiketId, jumlah } = req.body
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { userId, tiketId, jumlah }
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteOrder = async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Order deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}