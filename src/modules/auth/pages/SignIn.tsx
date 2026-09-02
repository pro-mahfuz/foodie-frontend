import { EyeCloseIcon, EyeIcon } from "../../../icons";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import Button from "../../../components/ui/button/Button";
import PageMeta from "../../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

import { ChangeEvent, useState, useEffect } from "react";
import { useNavigate  } from 'react-router-dom';
import { Link } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from '../../../store/store';
import { login } from "../../../modules/auth/features/authThunks";
import { selectAccessToken, selectUser, selectAuthStatus } from "../features/authSelectors";


export default function SignIn() {

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const accessToken = useSelector(selectAccessToken);
  const authUser = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isChecked: false,
  });

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("formData: ", formData);
      await dispatch(login(formData));
      //navigate("/", { replace: true });
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>{
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  useEffect(() => {
    if (authStatus === 'succeeded' && accessToken && authUser) {
      navigate("/", { replace: true });
    }
  }, [authStatus, accessToken, authUser, navigate]);


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
                  Sign In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email and password to sign in!
                </p>
              </div>
              <div>
              
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Username <span className="text-error-500">*</span>{" "}
                      </Label>
                      <Input
                        type="text"
                        name="email"
                        placeholder="Enter your username"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        Password <span className="text-error-500">*</span>{" "}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={rememberMe} onChange={setRememberMe} />
                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                          Keep me logged in
                        </span>
                      </div>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div>
                      <Button type="submit" className="w-full" size="sm">
                        Sign in
                      </Button>
                    </div>
                  </div>
                </form>

                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don&apos;t have an account? {""}
                    <Link
                      to="/signup"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
