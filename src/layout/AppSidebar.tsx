import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

import { selectUserById } from "../modules/user/features/userSelectors";
import { selectAuth } from "../modules/auth/features/authSelectors";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById } from "../modules/user/features/userThunks";
import { AppDispatch } from "../store/store";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean, permission?: string }[];
};


const AppSidebar: React.FC<any> = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;

  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);

  useEffect(() => {
    dispatch(fetchUserById(Number(authUser.user?.id)));
  }, [authUser, dispatch]);
  
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const hasPermission = (permission: string) => {
    return user?.role?.permissions?.some((p) => p.action === permission) ?? false;
  };


  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/",
      permission:"manage_dashboard"
    },
    {
      name: "Item & Unit",
      icon: <ListIcon />,
      permission:"manage_item",
      subItems: [
        { name: "Item List", path: "/item/list", pro: false, permission:"manage_item" },
        { name: "Unit List", path: "/unit/list", pro: false, permission:"manage_unit" },
      ],
    },
    {
      name: "Container",
      icon: <ListIcon />,
      permission:"manage_container",
      subItems: [
        { name: "Container List", path: "/container/0/list", pro: false, permission:"manage_container" },
        { name: "Container Add", path: "/container/create", pro: false, permission:"create_container" }
      ],
    },
    {
      name: "Party",
      icon: <ListIcon />,
      subItems: [
        { name: "Party List", path: "/party/all/list", pro: false, permission: "manage_party" },
        { name: "Party Add", path: "/party/create", pro: false, permission: "create_party" },
      ],
    },
    {
      name: "Supplier",
      icon: <ListIcon />,
      permission:"manage_supplier",
      subItems: [
        { name: "Supplier List", path: "/party/supplier/list", pro: false, permission:"manage_supplier" },
        { name: "Supplier Add", path: "/party/supplier/create", pro: false, permission:"create_supplier" },
      ],
    },
    {
      name: "Customer",
      icon: <ListIcon />,
      permission:"manage_customer",
      subItems: [
        { name: "Customer List", path: "/party/customer/list", pro: false, permission:"manage_customer" },
        { name: "Customer Add", path: "/party/customer/create", pro: false, permission:"create_customer" },
      ],
    },
    {
      name: "Ledger",
      icon: <ListIcon />,
      permission:"manage_ledger",
      subItems: [
        { name: "All Ledger", path: "/ledger/all/list/0", permission:"manage_ledger" },
        { name: "Purchase Ledger", path: "/ledger/purchase/list/0", permission:"purchase_ledger" },
        { name: "Sale Ledger", path: "/ledger/sale/list/0", permission:"sale_ledger" },
      ],
    },
    {
      name: "Invoice",
      icon: <ListIcon />,
      permission: "manage_invoice",
      subItems: [
        { name: "Invoice List", path: "/invoice/all/0/list", pro: false, permission: "manage_invoice" },
        { name: "Invoice Add", path: "/invoice/all/create", pro: false, permission: "create_invoice" },
      ],
    },
    {
      name: "Purchase",
      icon: <ListIcon />,
      permission:"manage_purchase",
      subItems: [
        { name: "Purchase List", path: "/invoice/purchase/0/list", pro: false, permission:"manage_purchase" },
        { name: "Purchase Add", path: "/invoice/purchase/create", pro: false, permission:"create_purchase" }
      ],
    },
    {
      name: "Sale",
      icon: <ListIcon />,
      permission:"manage_sale",
      subItems: [
        { name: "Sale List", path: "/invoice/sale/0/list", pro: false, permission:"manage_sale" },
        { name: "Sale Add", path: "/invoice/sale/create", pro: false, permission:"create_sale" }
      ],
    },
    {
      name: "Sell",
      icon: <ListIcon />,
      permission:"manage_sale_2",
      subItems: [
        { name: "Sell List", path: "/invoice/sell/0/list", pro: false, permission:"manage_sale_2" },
        { name: "Sell Add", path: "/invoice/sell/create", pro: false, permission:"create_sale_2" }
      ],
    },
    {
      name: "Stock",
      icon: <ListIcon />,
      permission:"manage_stock",
      subItems: [
        { name: "Stock List", path: "/stock/list", pro: false, permission:"manage_stock", },
        { name: "Stock Add", path: "/stock/create", pro: false, permission:"create_stock", }
      ],
    },
    {
      name: "Payments",
      icon: <ListIcon />,
      permission:"manage_payment",
      subItems: [
        { name: "Payment List", path: "/payment/list", pro: false, permission:"manage_payment" },
        { name: "Payment Add", path: "/payment/create", pro: false, permission:"create_payment" }
      ],
    },
    {
      name: "Payment",
      icon: <ListIcon />,
      permission:"manage_payment_2",
      subItems: [
        { name: "Payment List", path: "/paymentSys2/list", pro: false, permission:"manage_payment_2" },
        { name: "Payment Add", path: "/paymentSys2/create", pro: false, permission:"create_payment_2" }
      ],
    },
    {
      name: "Bill (Clearance)",
      icon: <ListIcon />,
      permission:"manage_bill",
      subItems: [
        { name: "Bill (Clearance) List", path: "/bill/list", pro: false, permission:"manage_bill" },
        { name: "Bill (Clearance) Add", path: "/bill/create", pro: false, permission:"create_bill" }
      ],
    },
    {
      name: "Expense",
      icon: <ListIcon />,
      permission:"manage_expense",
      subItems: [
        { name: "Expense List", path: "/expense/list", pro: false, permission:"manage_expense" },
        { name: "Expense Add", path: "/expense/create", pro: false, permission:"create_expense" }
      ],
    },
    {
      name: "Reports",
      icon: <ListIcon />,
      permission:"manage_report",
      subItems: [
        { name: "Purchase Report", path: "/report/purchase", permission:"report_purchase" },
        { name: "Payment Transaction", path: "/report/purchase/cash-payment", permission:"report_purchase_cash_payment" },
        { name: "Sale Report", path: "/report/sale", permission:"report_sale" },
        { name: "Sale Statement", path: "/report/sale/statement", permission:"report_sale_statement" },
        { name: "Sell Report", path: "/report/sell", permission:"report_sale_2" },
        { name: "Sale (Container) Report", path: "/report/sale/container", permission:"report_sale_container" },
        { name: "Received Transaction", path: "/report/sale/cash-collection", permission:"report_sale_cash_collection" },
        { name: "Sale Cash Report", path: "/report/sale/cash-report", permission:"report_sale_cash" },
        { name: "Sale Outstanding", path: "/report/sale/due", permission:"report_sale_outstanding" },
        { name: "Stock Report", path: "/report/stock", permission:"report_stock" },
        { name: "Bill Report", path: "/report/bill", permission:"report_bill" }, // report_bill
        { name: "Expense (Container) Report", path: "/report/expense/container", permission:"report_container_expense" }, 
        { name: "Expense (Office) Report", path: "/report/expense/office", permission:"report_expense" },
        { name: "Daily Profit/Loss Report", path: "/report/dailyProfitLoss", permission:"report_daily_profit" },
        { name: "Profit/Loss Report", path: "/report/profitLoss", permission:"report_profit" },
        { name: "Receivable & Payable", path: "/report/receivable", permission:"report_receivable" },
        // { name: "Payable Report", path: "/report/payable", permission:"report_payable" },
        { name: "Balance Report", path: "/report/balance/statement", permission:"report_balance" },
        { name: "Account Statement", path: "/report/account/statement", permission:"report_balance" },
        { name: "Capital Report", path: "/report/capitalReport", permission:"report_capital" },
      ],
    },
  ];

  const othersItems: NavItem[] = [
    {
      name: "Business Profile",
      icon: <ListIcon />,
      permission: "view_business",
      path: `/business/view/${user?.business?.id}`,
    },
    {
      name: "Business",
      icon: <ListIcon />,
      permission: "manage_business",
      subItems: [
        { name: "Business List", path: "/business/list", permission: "manage_business" },
        { name: "Business Add", path: "/business/create", permission: "create_business" },
      ],
    },
    {
      name: "User",
      icon: <ListIcon />,
      permission: "manage_users",
      subItems: [
        { name: "User List", path: "/user/list", permission: "manage_users" },
        { name: "User Add", path: "/user/create", permission: "create_users" }
      ],
    },
    {
      name: "Access Control",
      icon: <ListIcon />,
      permission: "manage_roles",
      subItems: [
        { name: "Role List", path: "/role/list", permission: "manage_roles" },
        { name: "Role Add", path: "/role/create", permission: "manage_roles" },
        { name: "Permission List", path: "/permission/list", permission: "manage_permissions" }
      ],
    },
    {
      name: "Payment Account",
      icon: <ListIcon />,
      path: "/account/list",
      permission:"manage_account"
    },
    {
      name: "Status",
      icon: <ListIcon />,
      path: "/status/list",
      permission:"manage_status"
    },
    
  ];

  /** ------------------- FILTERED ITEMS ------------------- */
  const filterItems = (items: NavItem[]) =>
    items
      .map((item) => {
        if (item.subItems) {
          const allowedSubItems = item.subItems.filter((sub) =>
            hasPermission(sub.permission ?? "")
          );
          return allowedSubItems.length > 0 ? { ...item, subItems: allowedSubItems } : null;
        }
        return hasPermission(item.permission ?? "") ? item : null;
      })
      .filter(Boolean) as NavItem[];

  const filteredNavItems = filterItems(navItems);
  const filteredOthersItems = filterItems(othersItems);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "text-center md:justify-center" : "justify-center"
        }`}
      >

        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
            { user?.business?.businessLogo
              ? <img
                  className="dark:hidden"
                  src={
                    user?.business?.businessLogo instanceof File
                      ? URL.createObjectURL(user?.business?.businessLogo)
                      : `${API_URL}${user?.business?.businessLogo}`
                      
                  }
                  alt="Logo"
                  width={150}
                  height={40}
                />
              : <h4 className="font-bold uppercase">Admin Dashboard</h4>
            }
              
              <img
                className="hidden dark:block"
                src={
                  user?.business?.businessLogo instanceof File
                    ? URL.createObjectURL(user?.business?.businessLogo)
                    : user?.business?.businessLogo
                    ? `${API_URL}${user?.business?.businessLogo}`
                    : `${APP_URL}/public/images/logo/logo.svg`
                }
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
