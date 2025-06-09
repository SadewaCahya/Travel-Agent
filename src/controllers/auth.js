require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		});
		if (user) {
			const result = await comparePassword(password, user.password);
			if (!result) {
				return res.status(401).json({
					message: "Login gagal",
				});
			}
			jwt.sign(
				{
					email: user.email,
					role: user.role,
				},
				JWT_SECRET,
				{ expiresIn: 60 * 60 },
				(err, token) => {
					res.status(200).json({
						message: "Login berhasil, token akan expire dalam 1 jam",
						token,
					});
				}
			);
		} else {
			res.status(401).json({
				message: "Login gagal",
			});
		}
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

const register = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		// Check if user already exists
		const checkUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ email },
					{ username }
				]
			},
		});
		
		if (checkUser) {
			return res.status(400).json({
				message: "Username atau email sudah terdaftar",
			});
		}

		// Create new user
		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: await hashPassword(password),
				role: "user" // Default role
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true
			},
		});

		res.status(201).json({
			message: "Register berhasil",
			user,
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

module.exports = {
	login,
	register,
};
