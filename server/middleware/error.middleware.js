export const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};
