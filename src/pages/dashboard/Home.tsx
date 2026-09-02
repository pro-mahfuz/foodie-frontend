import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";


import { useEffect } from "react";
import { useNavigate  } from 'react-router-dom';

import { selectAccessToken, selectAuth, selectAuthStatus } from "../../modules/auth/features/authSelectors";
import { selectUserById } from "../../modules/user/features/userSelectors";
import { useSelector } from "react-redux";



export default function Home() {
  const accessToken = useSelector(selectAccessToken);
  const authUser = useSelector(selectAuth);
  const authStatus = useSelector(selectAuthStatus);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const API_URL = import.meta.env.VITE_API_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;

  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'idle' || authStatus === 'loading') return;
    if (!accessToken || !authUser) {
      navigate("/signin", { replace: true });
    }
  }, [authStatus, accessToken, authUser, navigate]);
  
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <div className="rounded-2xl border border-gray-100 bg-white my-8 p-2 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <div className="rounded-2xl">
            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
              <div className="flex flex-col items-center w-full gap-1">
                <>
                {
                  user?.business?.businessLogo
                  ? <img
                      src={
                      user?.business?.businessLogo instanceof File
                          ? URL.createObjectURL(user.business.businessLogo)
                          : user?.business?.businessLogo
                          ? `${API_URL}${user?.business.businessLogo}`
                          : `${APP_URL}/public/images/logo/logo.svg`
                      }
                      alt="user"
                      className="w-[310px] h-[100px]"
                  />
                  : ''
                }
                  
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {user?.business?.businessName}
                  </h4>
                  {user?.business?.trnNo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      TRN No: {user.business.trnNo}
                  </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                  Address: {user?.business?.address}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email: {user?.business?.email} , Phone: {(user?.business?.phoneCode ?? '') + (user?.business?.phoneNumber ?? '')}
                  </p>
                </>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      { user?.role?.permissions?.some(p => p.action === "dashboard_data") && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-5">
            <EcommerceMetrics />
            

            
          </div>

          <div className="col-span-12 space-y-6 xl:col-span-7">
            <MonthlySalesChart />
          </div>

        </div>
      )}
    </>
  );
}
