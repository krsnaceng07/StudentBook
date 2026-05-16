// A simple UUID v4 validator to replace Mongoose ObjectId validation
const isUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const id = req.params[paramName];
    if (!id || !isUUID(id)) {
      return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
    }
  }
  next();
};

module.exports = validateObjectId;
