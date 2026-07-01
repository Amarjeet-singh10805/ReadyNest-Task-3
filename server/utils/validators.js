import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots, underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(150).optional(),
});

export const postSchema = z.object({
  caption: z.string().max(2200).optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(500),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  req.body = result.data;
  next();
};
