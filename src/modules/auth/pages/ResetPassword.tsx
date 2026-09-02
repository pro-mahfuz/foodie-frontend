
import Button from "../../../components/ui/button/Button";
import PageMeta from "../../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

import { useState } from "react";
import { useParams, useNavigate  } from 'react-router-dom';
import { Link } from "react-router";
import axiosInstance from "../../../api/axios";

export default function ResetPassword() {

    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirm) {
            setMessage("Passwords do not match");
            return;
        }
        try {
            const res = await axiosInstance.post("/auth/reset-password", { password, token });
            setMessage(res.data.message);
            setTimeout(() => navigate("/signin"), 2000);
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Error resetting password");
            console.error('Login error:', err);
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

                        
                        <div className="mb-5 text-center sm:mb-5">
                            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                Set Your Password?
                            </h1>
                            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                                Enter the email address linked to your account, and we’ll send you a link to reset your password.
                            </p> */}
                        </div>
                        
                    
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-6">
                                <div>
                                    <input
                                        type="password"
                                        className="border p-2 w-full mb-3"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    <input
                                        type="password"
                                        className="border p-2 w-full mb-3"
                                        placeholder="Confirm Password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                
                                <div>
                                    <Button type="submit" className="w-full" size="sm">
                                        Reset Password
                                    </Button>
                                </div>

                                {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
                            </div>
                        </form>

                        <div className="mt-5">
                            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                                Login my account... {""}
                                <Link
                                to="/signin"
                                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                >
                                Sign In
                                </Link>
                            </p>
                        </div>
                        
                    </div>
                </div>
                
            </AuthLayout>
        </>
    );
}
