import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractErrorMessage } from "../api/client.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, "Could not log in. Check your credentials."));
    }
  };

  return (
    <div>
      <h1 className="font-display text-xl text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to view today's at-risk inventory.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@store.com"
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />

        {serverError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-ink underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
