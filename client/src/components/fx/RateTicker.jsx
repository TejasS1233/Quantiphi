import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/client.js";

const DEFAULTS = ["EUR", "GBP", "JPY", "INR", "AUD", "CAD", "CHF", "SGD"];

export function RateTicker({ base = "USD" }) {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    let live = true;
    api
      .rates(base)
      .then((d) => {
        if (!live) return;
        const entries = Object.entries(d.rates || {})
          .filter(([c]) => DEFAULTS.includes(c))
          .map(([code, rate]) => ({ code, rate }));
        setRates(entries);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [base]);

  if (!rates.length) return null;
  const row = [...rates, ...rates];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-card/50">
      <motion.div
        className="flex w-max items-center gap-8 px-4 py-2.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 32 }}
      >
        {row.map((r, i) => (
          <span key={i} className="flex items-baseline gap-2 text-sm whitespace-nowrap">
            <span className="font-semibold text-foreground">
              {base}/{r.code}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {Number(r.rate).toFixed(4)}
            </span>
          </span>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
