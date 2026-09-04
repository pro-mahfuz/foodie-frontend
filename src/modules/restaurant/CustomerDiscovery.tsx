import { useEffect, useState } from "react";
import "./customer-discovery.css";
import { HeartIcon } from "@heroicons/react/24/outline";
import { restaurantId, restaurantService, type Restaurant } from "./index";

export default function CustomerDiscovery({ customerId, favouritesOnly, onRestaurant }: { customerId: number; favouritesOnly: boolean; onRestaurant: (restaurant: Restaurant) => void }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [saved, setSaved] = useState<number[]>(() => {
    try { const value: unknown = JSON.parse(localStorage.getItem(`foodieFavourites:${customerId}`) || "[]"); return Array.isArray(value) ? value.filter((id): id is number => typeof id === "number") : []; } catch { return []; }
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    restaurantService.list().then(data => { if (!Array.isArray(data)) throw new Error("Invalid restaurant response."); if (active) setRestaurants(data); }).catch(() => { if (active) setError("Unable to load restaurants. Please try again."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => { setQuery(""); }, [favouritesOnly]);
  const toggle = (id: number) => {
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    try { localStorage.setItem(`foodieFavourites:${customerId}`, JSON.stringify(next)); setSaved(next); setSaveError(""); } catch { setSaveError("Your browser could not save this favourite. Check your storage settings."); }
  };
  const visible = restaurants.filter(r => (!favouritesOnly || saved.includes(restaurantId(r))) && `${r.name} ${r.cuisine || ""} ${r.address || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="customer-discovery">
    <div className="catalog-toolbar"><div><h1>{favouritesOnly ? "Your favourites" : "Browse food"}</h1><p>{favouritesOnly ? "Your saved restaurants. Favourites are stored in this browser for your account." : "Choose a restaurant, explore its dishes, and order your favourites."}</p></div></div>
    <div className="catalog-filters"><label>Search restaurants<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Restaurant, cuisine or location"/></label></div>
    {saveError && <p className="catalog-error" role="alert">{saveError}</p>}
    {loading ? <p role="status">Loading restaurants…</p> : error ? <div className="catalog-error" role="alert">{error} <button onClick={() => setRetry(n => n + 1)}>Retry</button></div> : <>
      <div className="restaurant-grid">{visible.map(r => { const id = restaurantId(r); const favourite = saved.includes(id); return <article className="restaurant-card discovery-card" key={id}>
        <button className="discovery-open" onClick={() => onRestaurant(r)} aria-label={`View dishes at ${r.name}`}><div className="restaurant-image"><img src={r.image || "/images/restaurants/restaurant-italian.jpg"} alt={`${r.name} restaurant`}/></div><div className="restaurant-info"><div><h2>{r.name}</h2><p>{r.cuisine || r.address}</p></div><div className="rating">★ {r.rating ?? "New"}</div></div></button>
        <div className="discovery-actions"><button onClick={() => onRestaurant(r)}>View dishes</button><button className={favourite ? "favourite-toggle saved" : "favourite-toggle"} aria-pressed={favourite} aria-label={`${favourite ? "Remove" : "Save"} ${r.name} ${favourite ? "from" : "to"} favourites`} onClick={() => toggle(id)}><HeartIcon/>{favourite ? "Saved" : "Save"}</button></div>
      </article>; })}</div>
      {!visible.length && <div className="empty-cart"><h2>{query ? "No matching restaurants" : favouritesOnly ? "No favourites yet" : "No restaurants available"}</h2><p>{query ? "Try another name or location." : favouritesOnly ? "Open Browse food and tap Save on a restaurant to find it here." : "Please check back later."}</p></div>}
    </>}
  </section>;
}
