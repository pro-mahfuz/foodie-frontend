import { ReactNode } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
  colSpan?: number; // Optional colspan or rowspan attributes
}

// Props for SearchControls
interface SearchControlProps {
  value: string;
  placeHolder?: string;
  onChange: (value: string) => void;
}

// Props for PaginationControls
interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  showFirstLast?: boolean;
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

const TableFooter: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <tfoot className={className}>{children}</tfoot>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  colSpan,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`} colSpan={colSpan}>{children}</CellTag>;
};

// SearchField Component
const SearchControl: React.FC<SearchControlProps> = ({ value, placeHolder, onChange }) => {
  return (
    <div className="relative w-full max-w-xs m-4">
      {/* Search Icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        />
      </svg>

      {/* Text Input */}
      <input
        type="text"
        placeholder={placeHolder ?? "Search ..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-blue-400"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 11-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// PaginationControl Component
const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showFirstLast = false,
}) => {
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <div className="flex items-center text-sm">
        <label htmlFor="entriesPerPage" className="mr-2 text-gray-600 dark:text-gray-300">
          Show
        </label>

        <Listbox value={itemsPerPage} onChange={(value: number) => {
          onItemsPerPageChange(value);
          onPageChange(1);
        }}>
          {({ open }) => (
            <div>
              <ListboxButton className="border px-2 py-1 rounded-md">
                {itemsPerPage}
              </ListboxButton>

              {open && (
                <ListboxOptions  className="mt-1 rounded-md border bg-white shadow-lg dark:bg-gray-800">
                  {[5, 10, 25, 50].map((n) => (
                    <ListboxOption
                      key={n}
                      value={n}
                      className={({ active, selected }) =>
                        `cursor-pointer px-3 py-1 ${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } ${selected ? 'font-semibold' : ''}`
                      }
                      as="button"
                      type="button"
                    >
                      {n}
                    </ListboxOption>
                  ))}
                </ListboxOptions >
              )}
            </div>
          )}
        </Listbox>

        <span className="ml-2 text-gray-600 dark:text-gray-300">
          entries per page
        </span>
      </div>

      <div className="flex items-center text-sm">
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            First
          </button>
        )}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2 mr-2 py-1 border rounded-full disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2 ml-2 py-1 border rounded-full disabled:opacity-50"
        >
          Next
        </button>
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Last
          </button>
        )}
      </div>
    </div>
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableCell, SearchControl, PaginationControl };
