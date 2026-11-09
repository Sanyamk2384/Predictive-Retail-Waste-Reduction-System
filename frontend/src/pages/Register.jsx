import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractErrorMessage } from "../api/client.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

export default function Register() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "", email: "", password: "", confirmPassword: "" } });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await registerAccount(values);
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, "Could not create your account."));
    }
  };

  return (
    <div>
      <h1 className="font-display text-xl text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Set up manager access for your store.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
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
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === watch("password") || "Passwords do not match",
          })}
        />

        {serverError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-ink underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
