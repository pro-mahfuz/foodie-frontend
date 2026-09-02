import { FormEvent, useEffect, useState } from "react";
import { ArrowLeftIcon, MagnifyingGlassIcon, MapPinIcon, MinusIcon, PlusIcon, ShoppingBagIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Restaurant = { restaurantId?: number; id?: number; name: string; cuisine?: string; address?: string; rating?: number; deliveryTime?: string; image?: string };
type Dish = { dishId?: number; id?: number; name: string; description?: string; price: number; category?: string; image?: string };
type CartLine = { dish: Dish; quantity: number };
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const images = ["/images/product/product-01.jpg", "/images/product/product-02.jpg", "/images/product/product-03.jpg", "/images/product/product-04.jpg", "/images/product/product-05.jpg"];
const sampleRestaurants: Restaurant[] = [
  { id: 1, name: "Basil & Ember", cuisine: "Italian · Wood-fired", address: "Downtown Dubai", rating: 4.8, deliveryTime: "25–35 min", image: images[0] },
  { id: 2, name: "Saffron Street", cuisine: "Indian · Modern", address: "Business Bay", rating: 4.7, deliveryTime: "30–40 min", image: images[1] },
  { id: 3, name: "Sora Kitchen", cuisine: "Japanese · Sushi", address: "Dubai Marina", rating: 4.9, deliveryTime: "20–30 min", image: images[2] },
];
const sampleDishes: Dish[] = [
  { id: 1, name: "Truffle Burrata Pizza", description: "Wild mushrooms, creamy burrata, truffle oil and basil", price: 58, category: "Popular", image: images[3] },
  { id: 2, name: "Roasted Tomato Rigatoni", description: "Slow-roasted tomato, parmesan, chilli and fresh herbs", price: 46, category: "Pasta", image: images[4] },
  { id: 3, name: "Garden Citrus Salad", description: "Baby leaves, citrus, avocado, pistachio and feta", price: 39, category: "Fresh", image: images[1] },
];
const unwrap = <T,>(value: unknown): T => { const v = value as { data?: unknown; content?: unknown }; return (v?.data ?? v?.content ?? value) as T; };
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  return unwrap<T>(await response.json());
}
const rid = (r: Restaurant) => r.restaurantId ?? r.id ?? 1;
const did = (d: Dish) => d.dishId ?? d.id ?? 1;
const money = (n: number) => `AED ${Number(n || 0).toFixed(0)}`;

export default function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(sampleRestaurants);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>(sampleDishes);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [customerId, setCustomerId] = useState(() => Number(localStorage.getItem("foodieCustomerId")) || 1);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => { request<Restaurant[]>("/api/restaurants").then(data => { if (Array.isArray(data) && data.length) setRestaurants(data); setOffline(false); }).catch(() => setOffline(true)); }, []);
  const chooseRestaurant = async (restaurant: Restaurant) => {
    setSelected(restaurant); window.scrollTo({ top: 0, behavior: "smooth" });
    try { const data = await request<Dish[]>(`/api/restaurants/${rid(restaurant)}/dishes`); if (Array.isArray(data)) setDishes(data); } catch { setDishes(sampleDishes); }
  };
  const flash = (message: string, delay = 2400) => { setNotice(message); window.setTimeout(() => setNotice(""), delay); };
  const addDish = async (dish: Dish) => {
    setCart(current => { const found = current.find(line => did(line.dish) === did(dish)); return found ? current.map(line => did(line.dish) === did(dish) ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { dish, quantity: 1 }]; });
    flash(`${dish.name} added to your bag`);
    try { await request(`/api/customers/${customerId}/cart/items`, { method: "POST", body: JSON.stringify({ dishId: did(dish), quantity: 1 }) }); } catch { /* keep local cart usable */ }
  };
  const changeQty = (id: number, delta: number) => setCart(lines => lines.map(line => did(line.dish) === id ? { ...line, quantity: line.quantity + delta } : line).filter(line => line.quantity > 0));
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cart.reduce((sum, line) => sum + Number(line.dish.price) * line.quantity, 0);
  const filtered = restaurants.filter(r => `${r.name} ${r.cuisine ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const checkout = async () => {
    if (!cart.length || !selected) return; setBusy(true);
    try { const order = await request<{ orderId?: number; id?: number }>("/api/orders", { method: "POST", body: JSON.stringify({ customerId, restaurantId: rid(selected), items: cart.map(line => ({ dishId: did(line.dish), quantity: line.quantity })) }) }); setCart([]); setCartOpen(false); flash(`Order #${order.orderId ?? order.id ?? "confirmed"} is on its way!`, 3500); }
    catch (e) { flash(e instanceof Error ? e.message : "We couldn't place your order.", 3500); } finally { setBusy(false); }
  };
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { const result = await request<{ customerId?: number; userId?: number; token?: string }>(authMode === "login" ? "/api/login" : "/api/users", { method: "POST", body: JSON.stringify(payload) }); const id = result.customerId ?? result.userId ?? customerId; setCustomerId(id); localStorage.setItem("foodieCustomerId", String(id)); if (result.token) localStorage.setItem("foodieToken", result.token); setAuthOpen(false); flash(authMode === "login" ? "Welcome back!" : "Your account is ready."); }
    catch (e) { flash(e instanceof Error ? e.message : "Something went wrong.", 3000); } finally { setBusy(false); }
  };

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setSelected(null)} aria-label="Foodie home"><span>F</span>foodie</button><div className="location"><MapPinIcon/><div><small>Deliver to</small><strong>Dubai, UAE</strong></div></div><div className="header-actions"><button className="text-button" onClick={() => setAuthOpen(true)}>Sign in</button><button className="bag-button" onClick={() => setCartOpen(true)}><ShoppingBagIcon/> Bag <b>{itemCount}</b></button></div></header>
    <main>{!selected ? <><section className="hero"><div className="hero-copy"><div className="eyebrow">GOOD FOOD, GOOD MOOD</div><h1>Your next favourite meal is <em>closer than you think.</em></h1><p>Discover neighbourhood kitchens, local favourites and dishes worth staying in for.</p><label className="search"><MagnifyingGlassIcon/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search restaurants or cuisines" /></label><div className="hero-meta"><span>★ 4.8 average rating</span><span>•</span><span>30 min average delivery</span></div></div><div className="hero-image"><img src="/images/product/product-05.jpg" alt="A freshly prepared signature dish"/><div className="floating-card"><span>Chef's pick</span><strong>Made fresh, delivered fast</strong></div></div></section>
      <section className="content-section"><div className="section-title"><div><span className="kicker">CURATED FOR YOU</span><h2>Popular near you</h2></div><p>{filtered.length} places ready to deliver</p></div>{offline && <div className="offline-note">Showing today’s sample menu while the local API starts up.</div>}<div className="restaurant-grid">{filtered.map((r, index) => <button className="restaurant-card" key={rid(r)} onClick={() => chooseRestaurant(r)}><div className="restaurant-image"><img src={r.image || images[index % images.length]} alt=""/><span>{r.deliveryTime || "25–35 min"}</span></div><div className="restaurant-info"><div><h3>{r.name}</h3><p>{r.cuisine || "Local favourites"}</p></div><div className="rating"><StarIcon/> {r.rating || "4.8"}</div></div><div className="address"><MapPinIcon/>{r.address || "Dubai"}</div></button>)}</div></section></>
      : <section className="menu-page"><button className="back-button" onClick={() => setSelected(null)}><ArrowLeftIcon/> All restaurants</button><div className="restaurant-banner"><img src={selected.image || images[0]} alt=""/><div className="banner-content"><span>OPEN FOR DELIVERY</span><h1>{selected.name}</h1><p>{selected.cuisine || "Chef-made local favourites"} · {selected.address || "Dubai"}</p><div><b>★ {selected.rating || "4.8"}</b><b>{selected.deliveryTime || "25–35 min"}</b><b>AED 5 delivery</b></div></div></div><div className="menu-heading"><div><span className="kicker">THE MENU</span><h2>What are you craving?</h2></div><p>Prepared to order with the freshest ingredients.</p></div><div className="dish-grid">{dishes.map((dish, index) => <article className="dish-card" key={did(dish)}><img src={dish.image || images[(index + 2) % images.length]} alt=""/><div><span>{dish.category || "Chef's choice"}</span><h3>{dish.name}</h3><p>{dish.description || "Freshly prepared with carefully selected ingredients."}</p><footer><strong>{money(dish.price)}</strong><button onClick={() => addDish(dish)} aria-label={`Add ${dish.name}`}><PlusIcon/></button></footer></div></article>)}</div></section>}</main>
    {cartOpen && <div className="overlay" onMouseDown={() => setCartOpen(false)}><aside className="drawer" onMouseDown={e => e.stopPropagation()}><div className="drawer-head"><div><span className="kicker">YOUR ORDER</span><h2>Good choices.</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><XMarkIcon/></button></div>{!cart.length ? <div className="empty-cart"><ShoppingBagIcon/><h3>Your bag is waiting</h3><p>Add something delicious from a restaurant menu.</p><button onClick={() => setCartOpen(false)}>Explore restaurants</button></div> : <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={did(line.dish)}><div><h3>{line.dish.name}</h3><p>{money(line.dish.price)}</p></div><div className="stepper"><button onClick={() => changeQty(did(line.dish), -1)} aria-label="Decrease"><MinusIcon/></button><span>{line.quantity}</span><button onClick={() => changeQty(did(line.dish), 1)} aria-label="Increase"><PlusIcon/></button></div></div>)}</div><div className="totals"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery</span><b>AED 5</b></div><div className="grand"><span>Total</span><b>{money(subtotal + 5)}</b></div><button className="primary" disabled={busy} onClick={checkout}>{busy ? "Placing order…" : "Place order"}</button></div></>}</aside></div>}
    {authOpen && <div className="overlay modal-overlay" onMouseDown={() => setAuthOpen(false)}><div className="auth-modal" onMouseDown={e => e.stopPropagation()}><button className="icon-button modal-close" onClick={() => setAuthOpen(false)} aria-label="Close"><XMarkIcon/></button><div className="auth-mark">F</div><span className="kicker">WELCOME TO FOODIE</span><h2>{authMode === "login" ? "Your table is ready." : "Let's get you fed."}</h2><p>{authMode === "login" ? "Sign in to order favourites in a few taps." : "Create an account for a smoother checkout."}</p><form onSubmit={submitAuth}>{authMode === "register" && <><label>Name<input name="name" required placeholder="Your name"/></label><label>Phone<input name="phone" required placeholder="+971 50 123 4567"/></label><label>Address<input name="address" required placeholder="Dubai"/></label></>}<label>Email<input name="email" required type="email" placeholder="you@example.com"/></label><label>Password<input name="password" required type="password" minLength={8} placeholder="At least 8 characters"/></label><button className="primary" disabled={busy}>{busy ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}</button></form><button className="switch-auth" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "New here? Create an account" : "Already a member? Sign in"}</button></div></div>}
    {notice && <div className="toast">{notice}</div>}
  </div>;
}
