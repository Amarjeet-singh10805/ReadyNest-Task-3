import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-gray-200 dark:border-gray-800 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">
          InstaForge
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded py-2 font-semibold text-sm disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-500 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
