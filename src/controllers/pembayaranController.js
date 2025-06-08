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
    const { orderId, status, metode } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { tiket: true }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const total = order.tiket.harga * order.jumlah;

    const pembayaran = await prisma.pembayaran.create({
      data: { orderId, status, metode, total }
    });

    const newStok = order.tiket.stok - order.jumlah;
    if (newStok < 0) {
      await prisma.pembayaran.delete({ where: { id: pembayaran.id } });
      return res.status(400).json({ error: 'Stok tiket tidak cukup' });
    }
    await prisma.tiket.update({
      where: { id: order.tiketId },
      data: { stok: newStok }
    });

    res.status(201).json(pembayaran);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePembayaran = async (req, res) => {
  try {
    const { orderId, status, metode } = req.body

    const pembayaranLama = await prisma.pembayaran.findUnique({
      where: { id: Number(req.params.id) },
      include: { order: { include: { tiket: true } } }
    })
    if (!pembayaranLama) return res.status(404).json({ message: 'Pembayaran not found' })

    const usedOrderId = orderId || pembayaranLama.orderId

    const order = await prisma.order.findUnique({
      where: { id: usedOrderId },
      include: { tiket: true }
    })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const total = order.tiket.harga * order.jumlah

    const pembayaran = await prisma.pembayaran.update({
      where: { id: Number(req.params.id) },
      data: {
        orderId: usedOrderId,
        status,
        metode,
        total
      }
    })

    if (
      status === "sukses" &&
      pembayaranLama.status !== "sukses"
    ) {
      const newStok = order.tiket.stok - order.jumlah
      if (newStok < 0) {
        await prisma.pembayaran.update({
          where: { id: Number(req.params.id) },
          data: pembayaranLama
        })
        return res.status(400).json({ error: 'Stok tiket tidak cukup' })
      }
      await prisma.tiket.update({
        where: { id: order.tiketId },
        data: { stok: newStok }
      })
    }

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