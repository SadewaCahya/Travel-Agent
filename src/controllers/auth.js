
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
					isAdmin: user.isAdmin,
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
	const { email, password, nama, alamat, noTelp } = req.body;
	try {
		const checkUser = await prisma.user.findFirst({
			where: {
				email,
			},
		});
		if (checkUser != null) {
			return res.status(400).json({
				message: "Register gagal",
			});
		}
		const user = await prisma.user.create({
			data: {
				email,
				password: await hashPassword(password),
				nama,
				alamat,
				noTelp,
			},
			select: {
				nama: true,
				alamat: true,
				noTelp: true,
				email: true,
			},
		});
		res.status(200).json({
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
