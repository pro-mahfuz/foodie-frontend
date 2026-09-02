import {
  AlertIcon,
  BoxIconLine,
  DollarLineIcon,
  GroupIcon,
} from "../../icons";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../../src/store/store.ts";

import { selectTotalSaleOrder, selectSaleTotal } from "../../modules/invoice/features/invoiceSelectors.ts";
import { selectTotalCustomer } from "../../modules/party/features/partySelectors.ts";

import { getSaleReport } from "../../modules/invoice/features/invoiceThunks.ts";
import { fetchParty } from "../../modules/party/features/partyThunks.ts";

export default function EcommerceMetrics() {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    dispatch(getSaleReport());
    dispatch(fetchParty({ type: "all" }));
  }, [dispatch]);

  const totalSaleOrder = useSelector(selectTotalSaleOrder);
  const totalCustomer = useSelector(selectTotalCustomer);
  const saleReports = useSelector(selectSaleTotal);
  //const totalParty = useSelector(selectTotalParty);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-right text-title-sm dark:text-white/90">
              {totalCustomer}
            </h4>
          </div>
          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalSaleOrder}
            </h4>
          </div>

        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Payments
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {saleReports.totals.paidTotal.toFixed(2)}
            </h4>
          </div>
          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <AlertIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Outstanding
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {saleReports.totals.dueTotal.toFixed(2)}
            </h4>
          </div>
          
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
