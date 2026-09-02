
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import PageMeta from "../../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import axiosInstance from "../../../api/axios";

import { useState } from "react";
import { Link } from "react-router";


export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
        const res = await axiosInstance.post("/auth/forgot-password", { email });
        setMessage(res.data.message);
    } catch (err: any) {
        setMessage(err.response?.data?.message || "Error sending email");
    }
  }

  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
                <div className="mb-5 text-center sm:mb-5">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    Forgot Your Password?
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the email address linked to your account, and we’ll send you a link to reset your password.
                    </p>
                </div>

                <div>
              
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-6">
                            <div>
                            <Label>
                                Email <span className="text-error-500">*</span>{" "}
                            </Label>
                            <Input
                                type="text"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            </div>
                            
                            
                            <div>
                            <Button type="submit" className="w-full" size="sm">
                                Send Reset Link
                            </Button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-5">
                        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                            Wait, I remember my password... {""}
                            <Link
                            to="/signin"
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                            >
                            Sign In
                            </Link>
                        </p>
                    </div>

                    {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
                </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
