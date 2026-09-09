import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export const FALLBACK = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF"];

export function useCurrencies() {
  const [currencies, setCurrencies] = useState(FALLBACK);
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .currencies()
      .then((d) => {
        if (!live) return;
        if (d.currencies?.length) setCurrencies(d.currencies);
        setBackendDown(false);
      })
      .catch(() => live && setBackendDown(true));
    return () => {
      live = false;
    };
  }, []);

  return { currencies, backendDown };
}
