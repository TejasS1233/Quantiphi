import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotFound() {
  return (
    <div className="relative mx-auto flex max-w-6xl flex-1 items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
      <div className="bg-grid mask-fade-b absolute inset-0" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-72 w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-8 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="size-6" />
            </span>
            <p className="font-display text-6xl font-bold tabular-nums">404</p>
            <h1 className="font-display text-xl font-bold tracking-tight">Lost in the market?</h1>
            <p className="text-sm text-muted-foreground">
              This corridor doesn't exist — no liquidity here. Let's get you back
              to tradeable waters.
            </p>
            <div className="mt-2 flex gap-3">
              <Button asChild className="h-11 rounded-full px-6">
                <Link to="/"><HomeIcon /> Take me home</Link>
              </Button>
              <Button variant="outline" asChild className="h-11 rounded-full px-6">
                <Link to="/convert">Convert</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
