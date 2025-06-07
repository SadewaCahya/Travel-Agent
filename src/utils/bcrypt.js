const bcrypt = require("bcrypt");
const saltRounds = 10;

const hashPassword = (password) => {
	const hash = bcrypt.hash(password, saltRounds);
	return hash;
};

const comparePassword = (password, hash) => {
	const result = bcrypt.compare(password, hash);
	return result;
};

module.exports = {
	hashPassword,
	comparePassword,
};
