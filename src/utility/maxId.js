const generateMaxId = () => {
  // Generate a random number between 100000000 and 999999999 (inclusive)
  const maxId = Math.floor(100000000 + Math.random() * 900000000);
  return maxId.toString();
};

module.exports = generateMaxId;
