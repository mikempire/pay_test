const getRandomRange = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const isString = (value) =>
	typeof value === "string" || value instanceof String;

module.exports = { getRandomRange, isString };
