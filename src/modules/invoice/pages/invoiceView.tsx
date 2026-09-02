import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Invoice } from "../features/invoiceTypes";

import { AppDispatch } from "../../../store/store";
import { selectInvoiceById } from "../features/invoiceSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchById } from "../features/invoiceThunks";
import { ArrowLeftIcon, ListBulletIcon, PencilIcon, PrinterIcon } from "@heroicons/react/20/solid";


export default function InvoiceView() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;
    const APP_URL = import.meta.env.VITE_APP_URL;

    useEffect(() => {
        if (id) {
            dispatch(fetchById(Number(id)));
        }
        dispatch(fetchAllCategory());
    }, [id, dispatch]);

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    const invoice = useSelector(selectInvoiceById);
    
    const categories = useSelector(selectAllCategory);

    const handleEdit = (invoice: Invoice) => {
        invoice.invoiceType === "clearance_bill"
        ? navigate(`/bill/${invoice.id}/edit`)
        : navigate(`/invoice/${invoice.id}/edit`);
    };

    const handleList = (invoice: Invoice) => {
        if (!invoice.invoiceType) return; // stop if undefined

        const purchaseTypes = ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"];
        const path = purchaseTypes.includes(invoice.invoiceType)
            ? "/invoice/purchase/0/list"
            : "/invoice/sale/0/list";

        navigate(path);
    };

    function numberToWords(amount: number): string {
        const ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
            "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        const convertTens = (num: number): string => {
            if (num < 20) return ones[num];
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            return tens[ten] + (unit ? " " + ones[unit] : "");
        };

        const convertHundreds = (num: number): string => {
            if (num > 99) {
            return ones[Math.floor(num / 100)] + " Hundred " + convertTens(num % 100);
            }
            return convertTens(num);
        };

        const convert = (num: number): string => {
            if (num === 0) return "Zero";
            let words = "";

            if (Math.floor(num / 1000) > 0) {
            words += convertHundreds(Math.floor(num / 1000)) + " Thousand ";
            num %= 1000;
            }

            words += convertHundreds(num);

            return words.trim();
        };

        // Split amount into dirhams and fils
        const [dirhams, fils] = amount.toString().split(".").map(Number);

        let result = "";
        if (dirhams > 0) {
            result += convert(dirhams);
        }
        if (fils > 0) {
            result += (result ? " and " : "") + convert(fils);
        }

        return result || "Zero";
    }

    return (
        <div className="mx-auto max-w-7xl">
            <PageMeta title="Invoice View" description="Form to create a new invoice" />
            <PageBreadcrumb pageTitle="Invoice View" />

            {/* Print Button */}
            {user?.role?.permissions?.some(s => s.action === "print_invoice" || s.action === "print_purchase_invoice" || s.action === "print_sale_invoice") && (
            <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm print:hidden sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                    </button>

                    <button
                        onClick={() => {if (invoice)  handleList(invoice)}}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
                    >
                        <ListBulletIcon className="h-4 w-4" /> Invoice list
                    </button>

                    <button
                        onClick={() => {
                            if (invoice) handleEdit(invoice);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
                    >
                        <PencilIcon className="h-4 w-4" /> Update
                    </button>
                </div>

                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
                >
                    <PrinterIcon className="h-4 w-4" /> Print invoice
                </button>
            </div>
            )}
            

            <div id="print-section">
                <div className="mb-6 rounded-2xl border-2 border-gray-500 bg-white p-5 shadow-sm print:m-0 print:rounded-2xl print:border-gray-500 print:shadow-none dark:border-white/[0.20] dark:bg-white/[0.03] lg:p-6">
                {id != invoice?.id ? (
                    <div className="flex justify-center py-10">
                        <p className="text-gray-500 text-lg font-medium animate-pulse">
                        Loading data...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl lg:p-6">
                            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                                <div className="flex flex-col items-center w-full gap-1">
                                    {invoice?.isVat && (
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
                                        
                                    )}

                                    {!invoice?.isVat && !invoice?.business?.businessShortName && (
                                        <>
                                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? (
                                            <>
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
                                        ) : (
                                            <>
                                                <h1 className="text-6xl font-semibold text-gray-800 dark:text-white/90">
                                                    {user?.business?.businessShortName}
                                                </h1>
                                                <p className="text-lg text-gray-500 dark:text-gray-400">
                                                    Phone: {(user?.business?.phoneCode ?? '') + (user?.business?.phoneNumber ?? '')}
                                                </p>
                                            </>
                                        )}
                                        </>
                                    )}

                                </div>
                                
                            </div>
                            
                        </div>

                        <div className="rounded-2xl lg:p-1">
                            <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                                <div className="flex flex-col items-center w-full gap-1">
                                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 border border-black-500 px-2 rounded">
                                        {   invoice?.isVat && invoice?.invoiceType === "sale" ? "TAX INVOICE" : 
                                            invoice?.invoiceType === "fix_sale" ? "FIX SALE VOUCHER" : 
                                            invoice?.invoiceType === "unfix_sale" ? "UNFIX SALE VOUCHER" : 
                                            invoice?.invoiceType === "wholesale_sale" ? "WHOLESALE SALE VOUCHER" : 
                                            invoice?.invoiceType === "fix_purchase" ? "FIX PURCHASE VOUCHER" : 
                                            invoice?.invoiceType === "unfix_purchase" ? "UNFIX PURCHASE VOUCHER" : 
                                            invoice?.invoiceType === "wholesale_purchase" ? "WHOLESALE PURCHASE VOUCHER" : 
                                            invoice?.invoiceType === "CLEARANCE_BILL" ? "BILL VOUCHER" : 
                                            invoice?.invoiceType?.toUpperCase() + ' VOUCHER'
                                        } 
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row items-start text-center gap-5 xl:flex-row xl:justify-between">
                            <div className="flex flex-col items-start w-full gap-1 xl:justify-between">
                                <h6 className="text-lg font-semibold text-gray-800 dark:text-white/90">To,</h6>
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Name:</b>{" "}
                                    <span
                                        className={`font-semibold text-gray-800 ${invoice?.isVat ? "text-lg" : "text-2xl"}`}
                                    >
                                        {invoice?.party?.name}
                                    </span>
                                </p>
                                {invoice?.party?.trnNo && (
                                    <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                        <b>TRN No:</b> {invoice?.party?.trnNo}
                                    </p>
                                )}
                                {invoice?.party?.address && (
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Address:</b> {invoice?.party?.address}
                                </p>
                                )}
                                {invoice?.party?.phoneCode && (
                                <p className="text-lg text-left text-gray-500 dark:text-gray-400">
                                    <b>Phone:</b> {(invoice?.party?.phoneCode ?? '') + invoice?.party?.phoneNumber}
                                </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end w-full gap-1 xl:justify-between">

                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-lg text-gray-500 dark:text-gray-400">
                                            Date:
                                        </span>
                                        <span className="text-lg text-gray-500 dark:text-white/90 pr-4">{invoice?.date
                                            ? new Date(invoice.date).toLocaleDateString("en-GB").replace(/\//g, "-")
                                            : ""}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-lg text-gray-500 dark:text-gray-400">
                                            Ref #
                                        </span>
                                        <span className="text-lg text-gray-500 dark:text-white/90 pr-4">{invoice?.isVat === true ? invoice.vatInvoiceRefNo : invoice?.invoiceNo}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        {!categories.find((c) => ["gold"].includes(c.name.toLowerCase())) && (
                            <div className="min-h-[300px]">
                                <Table className="border border-gray-500">
                                    <TableHeader className="border-b border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                                        <TableRow>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Sl</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Description</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Quantity</TableCell>
                                            
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Unit</TableCell>
                                            
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Rate</TableCell>
                                            <TableCell isHeader className="text-lg text-right px-4 py-2">Amount ({invoice?.currency})</TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {invoice?.items.length === 0 ? (
                                            <TableRow className="">
                                                <TableCell colSpan={6} className="text-center py-4">
                                                    No items added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            invoice?.items.map((item, index) => (
                                                <TableRow key={item.id ?? index}>
                                                    <TableCell className="text-lg text-center px-4 py-2">{index + 1}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.name}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.quantity}</TableCell>
                                                    
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.unit}</TableCell>
                                                    
                                                    <TableCell className="text-lg text-center px-4 py-2">{item?.price?.toFixed(2)}</TableCell>
                                                    <TableCell className="text-lg text-right px-4 py-2">
                                                        {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {categories.find((c) => ["gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <div className="min-h-[300px]">
                                <Table className="border border-gray-500">
                                    <TableHeader className="border-b border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                                        <TableRow>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Sl</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Description</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Quantity</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Unit</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Rate</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Vat(%)</TableCell>
                                            <TableCell isHeader className="text-lg text-center px-4 py-2">Vat Amount</TableCell>
                                            <TableCell isHeader className="text-lg text-right px-4 py-2">Net Amount ({invoice?.currency})</TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {invoice?.items.length === 0 ? (
                                            <TableRow className="">
                                                <TableCell colSpan={6} className="text-center py-4">
                                                    No items added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            invoice?.items.map((item, index) => (
                                                <TableRow key={item.id ?? index}>
                                                    <TableCell className="text-lg text-center px-4 py-2">{index + 1}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.name}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.quantity}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item.unit}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item?.price?.toFixed(2)}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item?.vatPercentage}</TableCell>
                                                    <TableCell className="text-lg text-center px-4 py-2">{item?.itemVat}</TableCell>
                                                    <TableCell className="text-lg text-right px-4 py-2">
                                                        {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                {invoice?.note && (
                                    <div>
                                        <p className="font-bold mt-4">
                                        Note: <span className="font-normal">{invoice.note}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            </>
                        )}

                        <div className="flex justify-between text-right">
                            <div className="w-[600px]">

                                {categories.find((c) => ["gold"].includes(c.name.toLowerCase())) && (Number(invoice?.vatPercentage) > 0 || Number(invoice?.vatAmount) > 0) && (
                                    <Table className="border border-gray-500">
                                        <TableHeader className="border-b border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                                            <TableRow>
                                                <TableCell colSpan={5} isHeader className="border border-gray-500 text-sm text-center px-4 py-2">VAT DETAILS</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell isHeader className="text-sm text-center px-4 py-2">Sl</TableCell>
                                                <TableCell isHeader className="text-sm text-center px-4 py-2">Description</TableCell>
                                                <TableCell isHeader className="text-sm text-right px-4 py-2">Net Amount ({invoice?.currency})</TableCell>
                                                <TableCell isHeader className="text-sm text-right px-4 py-2">Vat (%)</TableCell>
                                                <TableCell isHeader className="text-sm text-right px-4 py-2">Vat Amount ({invoice?.currency})</TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {invoice?.items.length === 0 ? (
                                                <TableRow className="">
                                                    <TableCell colSpan={6} className="text-center py-4">
                                                        No items added yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                invoice?.items.map((item, index) => (
                                                    <TableRow key={item.id ?? index}>
                                                        <TableCell className="text-sm text-center px-4 py-2">{index + 1}</TableCell>
                                                        <TableCell className="text-sm text-center px-4 py-2">{item.name}</TableCell>
                                                        <TableCell className="text-sm text-center px-4 py-2">{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</TableCell>
                                                        <TableCell className="text-sm text-center px-4 py-2">{item.vatPercentage}</TableCell>
                                                        <TableCell className="text-sm text-center px-4 py-2">{(((item.price ?? 0) * (item.quantity ?? 0) * (item.vatPercentage ?? 0)) / 100).toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <div className="w-[300px]">

                                {!categories.find((c) => ["gold"].includes(c.name.toLowerCase())) && (
                                    <ul className="space-y-2">
                                        <li className="flex items-center justify-between border border-gray-500 px-2">
                                            <span className="text-lg text-gray-700 dark:text-gray-400">
                                                Sub-Total :
                                            </span>
                                            <span className="text-lg text-gray-800 dark:text-white/90">{invoice?.totalAmount.toFixed(2) + ` (${invoice?.currency})`}</span>
                                        </li>
                                        {/* <li className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700 dark:text-gray-400">
                                                Discount (Dhs.) :
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{(invoice?.discount ?? 0).toFixed(2)}</span>
                                        </li> */}

                                        {(Number(invoice?.vatPercentage) > 0 || Number(invoice?.vatAmount) > 0) && (
                                            <li className="flex items-center justify-between border border-gray-500 px-2">
                                                <span className="text-lg text-gray-700 dark:text-gray-400">
                                                Vat ({invoice?.vatPercentage} %) :
                                                </span>
                                                <span className="text-lg text-gray-800 dark:text-white/90">
                                                {(Number(invoice?.totalAmount) * Number(invoice?.vatPercentage) / 100).toFixed(2) + ` (${invoice?.currency})`}
                                                </span>
                                            </li>
                                        )}

                                        {(Number(invoice?.vatAmount) > 0) && Number(invoice?.discount) > 0 && (
                                            <li className="flex items-center justify-between border border-gray-500 px-2">
                                                <span className="text-lg font-semibold text-gray-700 dark:text-gray-400">
                                                    Net Total :
                                                </span>
                                                <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{(invoice?.grandTotal ?? 0).toFixed(2) + ` (${invoice?.currency})`}</span>
                                            </li>
                                        )}

                                        {Number(invoice?.discount) > 0 && (

                                            <li className="flex items-center justify-between border border-gray-500 px-2">
                                                <span className="text-lg text-gray-700 dark:text-gray-400">
                                                    Discount :
                                                </span>
                                                <span className="text-lg text-gray-800 dark:text-white/90">{(invoice?.discount ?? 0).toFixed(2) + ` (${invoice?.currency})`}</span>
                                            </li>
                                        )}

                                        <li className="flex items-center justify-between border border-gray-500 px-2">
                                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-400">
                                                Grand Total :
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                                {((invoice?.grandTotal ?? 0) - (invoice?.discount ?? 0)).toFixed(2) + ` (${invoice?.currency})`}
                                            </span>
                                        </li>
                                    </ul>
                                )}

                                {categories.find((c) => ["gold"].includes(c.name.toLowerCase())) && (
                                    <ul className="space-y-2">
                                        <li className="flex items-center justify-between border border-gray-500 px-2">
                                            <span className="text-lg text-gray-700 dark:text-gray-400">
                                                Net Total :
                                            </span>
                                            <span className="text-lg text-gray-800 dark:text-white/90">{invoice?.totalAmount.toFixed(2) + ` (${invoice?.currency})`}</span>
                                        </li>
                                        {/* <li className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700 dark:text-gray-400">
                                                Discount (Dhs.) :
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{(invoice?.discount ?? 0).toFixed(2)}</span>
                                        </li> */}

                                        
                                        <li className="flex items-center justify-between border border-gray-500 px-2">
                                            <span className="text-lg text-gray-700 dark:text-gray-400">
                                            Vat Total :
                                            </span>
                                            <span className="text-lg text-gray-800 dark:text-white/90">
                                            {invoice?.vatAmount + ` (${invoice?.currency})`}
                                            </span>
                                        </li>
                                       

                                        
                                        <li className="flex items-center justify-between border border-gray-500 px-2">
                                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-400">
                                                Grand Total :
                                            </span>
                                            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{(invoice?.grandTotal ?? 0).toFixed(2) + ` (${invoice?.currency})`}</span>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center text-center">
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                <span className="font-bold">In-Words:</span> {numberToWords((invoice?.grandTotal ?? 0) - (invoice?.discount ?? 0)) + " " + ` (${invoice?.currency})` + " Only"}
                            </p>
                        </div>

                        <div className="flex flex-row items-start text-center gap-5 xl:flex-row xl:justify-between">
                            <div className="flex flex-col items-start w-full gap-1 xl:justify-between">
                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ---------------------
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Receiver's Signature
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col items-end w-full gap-1 xl:justify-between">

                                <ul className="space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ---------------------
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Authorized Signature
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
