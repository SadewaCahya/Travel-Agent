const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({ include: { user: true } })
    res.json(rewards)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getRewardById = async (req, res) => {
  try {
    const reward = await prisma.reward.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true }
    })
    if (!reward) return res.status(404).json({ message: 'Reward not found' })
    res.json(reward)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createReward = async (req, res) => {
  try {
    const { userId, poin } = req.body
    const reward = await prisma.reward.create({
      data: { userId, poin }
    })
    res.status(201).json(reward)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateReward = async (req, res) => {
  try {
    const { userId, poin } = req.body
    const reward = await prisma.reward.update({
      where: { id: Number(req.params.id) },
      data: { userId, poin }
    })
    res.json(reward)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteReward = async (req, res) => {
  try {
    await prisma.reward.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Reward deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}