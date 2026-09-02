import { useEffect, useState } from "react";

interface CountryCode {
  code: string; // e.g., "AE"
  label: string; // e.g., "+971"
}

interface PhoneInputProps {
    value?: {
      countryCode: string;
      phoneCode: string;
      phoneNumber: string;
    };
    countries: CountryCode[];
    placeholder?: string;
    onChange?: (countryCode: string, phoneCode: string, phoneNumber: string) => void;
    selectPosition?: "start" | "end";
    id?: string;
    name?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countries,
  placeholder = "+971 000 000000",
  value,
  onChange,
  selectPosition = "start",
  id,
  name,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("AE");

  const countryCodes: Record<string, string> = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );

  // Automatically detect and set selected country based on value
  useEffect(() => {
    if (!value) return;
    const found = countries.find((c) => value.phoneCode === c.label);
    if (found) setSelectedCountry(found.code);
  }, [value, countries]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);

    const numberWithoutPrefix = e.target.value.replace(/[^\d]/g, "");
    const phoneCode = countryCodes[newCountry];
    onChange?.(newCountry, phoneCode, numberWithoutPrefix);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const strippedNumber = raw.replace(/^\+\d+\s?/, ""); // Remove old country code if typed manually
    const phoneCode = countryCodes[selectedCountry];
    onChange?.(selectedCountry, phoneCode, strippedNumber);
  };

  const countrySelect = (
    <div className="absolute z-10">
      <select
        value={selectedCountry}
        onChange={handleCountryChange}
        className={`appearance-none bg-none ${
          selectPosition === "start" ? "rounded-l-lg" : "rounded-r-lg"
        } border-0 ${
          selectPosition === "start" ? "border-r" : "border-l"
        } border-gray-200 bg-transparent py-3 pl-3.5 pr-8 text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400`}
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.code}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 flex items-center pointer-events-none right-3 text-gray-700 dark:text-gray-400">
        <svg
          className="stroke-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
      </div>
      
    </div>
  );

  return (
    <div className="relative flex items-center">
      {selectPosition === "start" && countrySelect}
      
      <input
        id={id}
        type="tel"
        value={`${value?.phoneCode}`.trim()}
        className={`dark:bg-dark-900 h-11 w-40 ${
          selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"
        } rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
        readOnly
      />

      <input
        id={id}
        name={name}
        type="tel"
        value={`${value?.phoneNumber}`.trim()}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        className={`dark:bg-dark-900 h-11 w-full ${
          selectPosition === "start" ? "pl-4" : "pr-[84px]"
        } rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
      />

      {selectPosition === "end" && countrySelect}
    </div>
  );
};

export default PhoneInput;
