export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          <span className="font-display font-semibold text-foreground">FX Pulse</span> — real-time currency intelligence.
        </p>
        <p className="text-xs">
          Rates by ExchangeRate API · Trends by Frankfurter · Vibe Coding Round
        </p>
      </div>
    </footer>
  );
}
