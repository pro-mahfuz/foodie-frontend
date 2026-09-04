import { useEffect, useRef, useState, type FormEvent } from "react";
import { restaurantId, restaurantService, type Restaurant, type RestaurantInput } from "./index";
import { dishId, dishService, type Dish, type CreateDishInput } from "../dishes";

type Props = { section: "restaurants" | "dishes"; onDishes: () => void };
type Editor = { kind: "restaurant"; record?: Restaurant } | { kind: "dish"; restaurantId: number; record?: Dish };
const pictures = ["/images/dishes/pizza.jpg", "/images/dishes/pasta.webp", "/images/dishes/salad.jpg"];
const errorText = (error: unknown) => error instanceof Error ? error.message : "Unable to complete the request.";

export default function AdminCatalog({ section, onDishes }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reload, setReload] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    restaurantService.list().then(data => {
      if (!Array.isArray(data)) throw new Error("The restaurant list could not be loaded.");
      if (active) { setRestaurants(data); setSelected(current => data.some(r => restaurantId(r) === current) ? current : data.length ? restaurantId(data[0]) : null); }
    }).catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  useEffect(() => {
    let active = true;
    setDishes([]); setQuery(""); setError("");
    if (section !== "dishes" || selected === null) { setLoadingDishes(false); return; }
    setLoadingDishes(true);
    dishService.listForRestaurant(selected).then(data => {
      if (!Array.isArray(data)) throw new Error("The dish list could not be loaded.");
      if (active) setDishes(data);
    }).catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoadingDishes(false); });
    return () => { active = false; };
  }, [section, selected, reload]);

  useEffect(() => { if (editor) dialog.current?.showModal(); else dialog.current?.close(); }, [editor]);
  const openEditor = (value: Editor) => { setSaveError(""); setNotice(""); setEditor(value); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || saving) return;
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    if (!field("name") || (editor.kind === "restaurant" ? !field("address") || !field("phone") : !field("category"))) { setSaveError("Please fill in all required fields."); return; }
    setSaving(true); setSaveError("");
    try {
      if (editor.kind === "restaurant") {
        const input: RestaurantInput = { name: field("name"), address: field("address"), phone: field("phone"), ...(field("rating") ? { rating: Number(field("rating")) } : {}) };
        const saved = editor.record ? await restaurantService.update(restaurantId(editor.record), input) : await restaurantService.create(input);
        setRestaurants(current => editor.record ? current.map(r => restaurantId(r) === restaurantId(editor.record!) ? saved : r) : [...current, saved]);
        if (!editor.record) setSelected(restaurantId(saved));
      } else {
        const input: CreateDishInput = { name: field("name"), description: field("description"), category: field("category"), price: Number(field("price")) };
        const saved = editor.record ? await dishService.update(editor.restaurantId, dishId(editor.record), input) : await dishService.create(editor.restaurantId, input);
        setDishes(current => editor.record ? current.map(d => dishId(d) === dishId(editor.record!) ? saved : d) : [...current, saved]);
      }
      setNotice(`${editor.kind === "restaurant" ? "Restaurant" : "Dish"} ${editor.record ? "updated" : "created"} successfully.`); setEditor(null);
    } catch (e) { setSaveError(errorText(e)); } finally { setSaving(false); }
  };
  const restaurant = restaurants.find(r => restaurantId(r) === selected);
  const visibleRestaurants = restaurants.filter(r => `${r.name} ${r.address}`.toLowerCase().includes(query.toLowerCase()));
  const visibleDishes = dishes.filter(d => `${d.name} ${d.category}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="admin-list-view">
    <div className="catalog-toolbar">
      <div><h2>{section === "restaurants" ? "Restaurant list" : "Restaurant dishes"}</h2><p>{section === "restaurants" ? `${restaurants.length} restaurants` : restaurant?.name || "Choose a restaurant to manage its menu."}</p></div>
      <button className="create-action" disabled={loading || (section === "dishes" && selected === null)} onClick={() => openEditor(section === "restaurants" ? { kind: "restaurant" } : { kind: "dish", restaurantId: selected! })}>+ Create {section === "restaurants" ? "restaurant" : "dish"}</button>
    </div>
    <div className="catalog-filters">
      {section === "dishes" && <label>Restaurant<select value={selected ?? ""} disabled={loading || saving} onChange={e => setSelected(Number(e.target.value))}><option value="" disabled>Select restaurant</option>{restaurants.map(r => <option key={restaurantId(r)} value={restaurantId(r)}>{r.name}</option>)}</select></label>}
      <label>Search<input value={query} onChange={e => setQuery(e.target.value)} placeholder={section === "restaurants" ? "Search restaurants" : "Search dishes"}/></label>
    </div>
    {notice && <p role="status" className="catalog-success">{notice}</p>}
    {error && <div role="alert" className="catalog-error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
    {(loading || loadingDishes) ? <p role="status">Loading {section}…</p> : !error && (section === "restaurants" ? <div className="admin-restaurant-grid">
      {visibleRestaurants.map(r => <article key={restaurantId(r)}><img src={r.image || "/images/restaurants/restaurant-italian.jpg"} alt={`${r.name} restaurant`}/><div><h2>{r.name}</h2><p>{r.address}</p><p>{r.phone}</p><small>Rating: {r.rating ?? "Not rated"}</small><div className="catalog-card-actions"><button onClick={() => openEditor({ kind: "restaurant", record: r })}>Edit restaurant</button><button onClick={() => { setSelected(restaurantId(r)); onDishes(); }}>View dishes</button></div></div></article>)}
      {!visibleRestaurants.length && <p>{restaurants.length ? "No restaurants match your search." : "No restaurants yet. Create your first restaurant."}</p>}
    </div> : <div className="admin-dish-grid">
      {visibleDishes.map(d => <article key={dishId(d)}><img src={pictures[/salad/i.test(d.name) ? 2 : /pasta|rigatoni|penne/i.test(d.name) ? 1 : 0]} alt={d.name}/><div><span>{d.category}</span><h2>{d.name}</h2><p>{d.description}</p><footer><b>AED {Number(d.price).toFixed(2)}</b><small>{restaurant?.name}</small></footer><div className="catalog-card-actions"><button onClick={() => openEditor({ kind: "dish", restaurantId: selected!, record: d })}>Edit dish</button></div></div></article>)}
      {!visibleDishes.length && <p>{!restaurants.length ? "Create a restaurant before adding dishes." : dishes.length ? "No dishes match your search." : "This restaurant has no dishes yet. Create its first dish."}</p>}
    </div>)}
    <dialog ref={dialog} className="dish-form-modal catalog-dialog" onCancel={event => { event.preventDefault(); if (!saving) setEditor(null); }}>
      {editor && <><div className="dish-form-head"><h2 id="catalog-dialog-title">{editor.record ? "Edit" : "Create"} {editor.kind}</h2><button disabled={saving} aria-label="Close" onClick={() => setEditor(null)}>✕</button></div>
      <form key={`${editor.kind}-${editor.record ? "edit" : "new"}`} onSubmit={save} aria-labelledby="catalog-dialog-title">
        <fieldset disabled={saving} className="catalog-fields">
          <label>Name<input name="name" required maxLength={150} defaultValue={editor.record?.name} autoFocus/></label>
          {editor.kind === "restaurant" ? <>
            <label>Address<input name="address" required maxLength={255} defaultValue={editor.record?.address}/></label>
            <label>Phone<input name="phone" type="tel" required maxLength={20} defaultValue={editor.record?.phone}/></label>
            <label>Rating (optional)<input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={editor.record?.rating}/></label>
          </> : <>
            <p>Restaurant: <strong>{restaurant?.name}</strong></p>
            <label>Category<input name="category" required maxLength={100} defaultValue={editor.record?.category || "MAIN"}/></label>
            <label>Description<textarea name="description" rows={3} defaultValue={editor.record?.description}/></label>
            <label>Price (AED)<input name="price" type="number" required min="0.01" max="99999999.99" step="0.01" defaultValue={editor.record?.price}/></label>
          </>}
          {saveError && <p role="alert" className="catalog-error">{saveError}</p>}
          <button className="primary" type="submit">{saving ? "Saving…" : editor.record ? "Save changes" : `Create ${editor.kind}`}</button>
          <button type="button" onClick={() => setEditor(null)}>Cancel</button>
        </fieldset>
      </form></>}
    </dialog>
  </section>;
}
