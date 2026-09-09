import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Star, Trash2, ArrowUpRight } from "lucide-react";
import { api } from "@/api/client.js";
import { useCurrencies } from "@/hooks/useCurrencies.js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyFavorites } from "@/components/fx/EmptyFavorites.jsx";

export function FavoritesPage() {
  const { currencies } = useCurrencies();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("EUR");

  async function load() {
    try {
      const d = await api.favorites();
      setFavorites(d.favorites || []);
    } catch (err) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await api.addFavorite(base, target);
      toast.success(`Saved ${base} → ${target}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(id) {
    await api.removeFavorite(id);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Favorites</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pin pairs, reload them anywhere in one click.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="size-4 text-primary" /> New favorite</CardTitle>
            <CardDescription>Pairs persist in SQLite.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={add} className="flex items-end gap-3">
              <div className="grid gap-1.5">
                <Label>Base</Label>
                <NativeSelect value={base} onChange={(e) => setBase(e.target.value)} className="w-28">
                  {currencies.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid gap-1.5">
                <Label>Target</Label>
                <NativeSelect value={target} onChange={(e) => setTarget(e.target.value)} className="w-28">
                  {currencies.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Saved pairs ({favorites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <EmptyFavorites />
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {favorites.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 transition-colors hover:border-primary/40"
                  >
                    <span className="font-display text-lg font-bold">
                      {f.base_code} <span className="text-muted-foreground">→</span> {f.target_code}
                    </span>
                    <span className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" title="Open in converter" onClick={() => navigate("/convert")}>
                        <ArrowUpRight />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Remove" onClick={() => remove(f.id)}>
                        <Trash2 className="text-destructive" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
