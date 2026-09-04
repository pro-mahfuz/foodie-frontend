import type { useCustomerCart } from "./useCustomerCart";
const money = (value: number) => `AED ${Number(value).toFixed(2)}`;
export default function CustomerCart({ state, onBrowse }: { state: ReturnType<typeof useCustomerCart>; onBrowse: () => void }) {
  const { cart, order, busy, error, run } = state;
  return <section className="content-section customer-cart"><div className="catalog-toolbar"><h1>Your cart</h1><button onClick={onBrowse}>Continue browsing</button></div>
    {error && <div role="alert" className="catalog-error">{error}<button disabled={busy} onClick={() => run("load")}>Refresh cart</button></div>}
    {order && <article className="panel order-confirmation" role="status"><h2>Order #{order.orderId} placed</h2><p>Status: {order.status}</p>{order.items?.map(item => <p key={item.dishId}>{item.quantity} × {item.dishName} — {money(item.subtotal)}</p>)}<strong>Total: {money(order.totalAmount ?? order.total ?? 0)}</strong></article>}
    {busy && <p role="status">Updating your cart…</p>}
    {cart?.items.length ? <><p>One restaurant per cart. To order from another restaurant, clear this cart first.</p><div className="cart-lines">{cart.items.map(item => <div className="cart-line" key={item.dishId}><div><h3>{item.dishName}</h3><p>{money(item.unitPrice)} each</p></div><div className="stepper"><span>Quantity: {item.quantity}</span><button disabled={busy} aria-label={`Add one more ${item.dishName}`} onClick={() => run("add", item.dishId)}>+</button></div><strong>{money(item.subtotal)}</strong></div>)}</div><div className="totals"><div className="grand"><span>Total</span><strong>{money(cart.total)}</strong></div><button className="primary" disabled={busy || Boolean(error)} onClick={() => run("checkout")}>{busy ? "Please wait…" : "Place order"}</button><button disabled={busy} onClick={() => { if (window.confirm("Remove all dishes from your cart?")) void run("clear"); }}>Clear cart</button></div></> : !busy && !error && !order && <div className="empty-cart"><h2>Your cart is empty</h2><p>Choose a restaurant and add your favourite dishes.</p><button onClick={onBrowse}>Browse restaurants</button></div>}
  </section>;
}
