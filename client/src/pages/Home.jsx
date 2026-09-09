import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeftRight,
  LineChart as LineChartIcon,
  Plane,
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";
import { api } from "@/api/client.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/reui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RateTicker } from "@/components/fx/RateTicker.jsx";
import { FxLineChart } from "@/components/fx/FxLineChart.jsx";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

function useHomeData() {
  const [trend, setTrend] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    Promise.all([api.trends("USD", "INR", 30), api.rates("USD")])
      .then(([t, r]) => {
        if (!live) return;
        setTrend(t);
        setRates(r.rates);
        setLoading(false);
      })
      .catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return { trend, rates, loading };
}

const FEATURES = [
  {
    to: "/convert",
    icon: ArrowLeftRight,
    title: "Instant conversion",
    text: "Dual selectors, live interbank rates, one-tap favorite pairs.",
  },
  {
    to: "/trends",
    icon: LineChartIcon,
    title: "30-day trends",
    text: "Cinematic line charts with brush-zoomable history per pair.",
  },
  {
    to: "/budget",
    icon: Plane,
    title: "Travel budgeting",
    text: "One amount, five major currencies — server-computed comparison.",
  },
  {
    to: "/favorites",
    icon: Star,
    title: "Favorites",
    text: "Pin the pairs you trade daily and reload them in one click.",
  },
];

export function Home() {
  const { trend, rates, loading } = useHomeData();

  const stats = useMemo(() => {
    if (!trend?.points?.length || !rates) return [];
    const pts = trend.points;
    const first = pts[0].rate;
    const last = pts[pts.length - 1].rate;
    const chg = ((last - first) / first) * 100;
    return [
      { label: "USD → INR", value: last.toFixed(4), delta: chg, invert: false },
      { label: "USD → EUR", value: Number(rates.EUR).toFixed(4), delta: null },
      { label: "USD → JPY", value: Number(rates.JPY).toFixed(2), delta: null },
      { label: "USD → GBP", value: Number(rates.GBP).toFixed(4), delta: null },
    ];
  }, [trend, rates]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid mask-fade-b absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-14 text-center sm:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="success-light">
              <Sparkles className="size-3" /> Live FX · 160+ currencies
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display mx-auto mt-6 max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-6xl"
          >
            Move money with <span className="text-primary">total clarity</span>
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
          >
            Real-time conversion, 30-day trend intelligence and travel
            budgeting — in one fast, premium workspace.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
          >
            <Button size="lg" asChild className="h-12 rounded-full px-8 text-base shadow-[0_0_32px_-6px_var(--primary)]">
              <Link to="/convert">
                Start converting <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 rounded-full px-8 text-base">
              <Link to="/trends">View trends</Link>
            </Button>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Zap className="size-3.5 text-primary" />
            Server-computed rates · SQLite-persisted history · Zero API keys
          </motion.div>
        </div>
      </section>

      <RateTicker />

      {/* LIVE MARKET */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Live market</h2>
            <p className="mt-1 text-sm text-muted-foreground">USD base · refreshed hourly from ExchangeRate API</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/showcase">All visuals <ArrowRight /></Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading || !stats.length
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-28 animate-pulse" />
              ))
            : stats.map((s) => (
                <Card key={s.label}>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-2xl font-bold tabular-nums">{s.value}</div>
                    {s.delta != null && (
                      <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${s.delta >= 0 ? "text-success" : "text-destructive"}`}>
                        {s.delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                        {s.delta >= 0 ? "+" : ""}{s.delta.toFixed(2)}% / 30d
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              USD → INR · 30 days
              <Badge variant="success-light">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FxLineChart points={trend?.points || []} loading={loading} />
          </CardContent>
        </Card>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Everything in one workspace</h2>
        <p className="mt-1 text-sm text-muted-foreground">Four tools, one backend, zero friction.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.to}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link to={f.to}>
                <Card className="group h-full transition-colors hover:border-primary/40">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="size-5" />
                    </span>
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        {f.title}
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">{f.text}</span>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden">
          <div className="bg-dots absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-[100px]" />
          <CardContent className="relative flex flex-col items-center gap-4 py-12 text-center">
            <h3 className="font-display max-w-md text-3xl font-bold tracking-tight text-balance">
              Planning a trip? Compare five currencies at once.
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">Travel Budgeting mode computes the full comparison table server-side.</p>
            <Button size="lg" asChild>
              <Link to="/budget"><Plane /> Try budget mode</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
