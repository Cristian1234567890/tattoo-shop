import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Currency,
  CountryConfig,
  FALLBACK_CURRENCIES,
  FALLBACK_RATES,
  STORAGE_KEY_COUNTRY,
  STORAGE_KEY_CURRENCY,
  getStoredCountry,
  getStoredCurrency,
  findCountryConfig,
  convertCurrency,
  formatPrice as formatPriceUtil,
} from '../utils/currency';
import { API_BASE_URL } from '../api/client';

export interface CurrencyContextType {
  country: string; // e.g. 'PA'
  currency: string; // e.g. 'USD'
  countryInfo: CountryConfig;
  currencies: Currency[];
  rates: Record<string, number>;
  isLoadingRates: boolean;
  setCountry: (countryCodeOrName: string) => void;
  setCurrency: (currencyCode: string) => void;
  formatPrice: (
    amount: number | string,
    fromCurrency?: string,
    options?: { showCode?: boolean; unit?: string }
  ) => string;
  convertPrice: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string
  ) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<string>(() => getStoredCountry());
  const [currency, setCurrencyState] = useState<string>(() => getStoredCurrency());
  const [currencies, setCurrencies] = useState<Currency[]>(FALLBACK_CURRENCIES);
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);

  // Fetch live currency rates from backend /currencies endpoint
  useEffect(() => {
    let isMounted = true;

    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/currencies`);
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status}`);
        }
        const json = await response.json();
        const activeList: Currency[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        if (isMounted && activeList.length > 0) {
          setCurrencies(activeList);
          const newRates: Record<string, number> = { ...FALLBACK_RATES };
          activeList.forEach((c) => {
            if (c.code && typeof c.rate_to_usd === 'number' && c.rate_to_usd > 0) {
              newRates[c.code.toUpperCase()] = c.rate_to_usd;
            }
          });
          setRates(newRates);
        }
      } catch (err) {
        // Fallback rates remain active
      } finally {
        if (isMounted) {
          setIsLoadingRates(false);
        }
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, []);

  const setCountry = useCallback((countryCodeOrName: string) => {
    const matched = findCountryConfig(countryCodeOrName);
    setCountryState(matched.code);
    setCurrencyState(matched.defaultCurrency);
    try {
      localStorage.setItem(STORAGE_KEY_COUNTRY, matched.code);
      localStorage.setItem(STORAGE_KEY_CURRENCY, matched.defaultCurrency);
    } catch {}
  }, []);

  const setCurrency = useCallback((currencyCode: string) => {
    const code = (currencyCode || 'USD').toUpperCase();
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENCY, code);
    } catch {}
  }, []);

  const countryInfo = useMemo(() => findCountryConfig(country), [country]);

  const formatPrice = useCallback(
    (
      amount: number | string,
      fromCurrency = 'USD',
      options?: { showCode?: boolean; unit?: string }
    ) => {
      return formatPriceUtil(amount, fromCurrency, currency, rates, options);
    },
    [currency, rates]
  );

  const convertPrice = useCallback(
    (amount: number, fromCurrency = 'USD', toCurrency = currency) => {
      return convertCurrency(amount, fromCurrency, toCurrency, rates);
    },
    [currency, rates]
  );

  const contextValue = useMemo<CurrencyContextType>(
    () => ({
      country,
      currency,
      countryInfo,
      currencies,
      rates,
      isLoadingRates,
      setCountry,
      setCurrency,
      formatPrice,
      convertPrice,
    }),
    [
      country,
      currency,
      countryInfo,
      currencies,
      rates,
      isLoadingRates,
      setCountry,
      setCurrency,
      formatPrice,
      convertPrice,
    ]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
