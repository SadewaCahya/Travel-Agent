const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get single user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const user = await prisma.user.create({ data: { username, email, password } })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body
    const id = Number(req.params.id);

    const dataToUpdate = {};
      if (username !== undefined) dataToUpdate.username = username;
      if (email !== undefined) dataToUpdate.email = email;
      if (password !== undefined) dataToUpdate.password = password;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedUser)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}