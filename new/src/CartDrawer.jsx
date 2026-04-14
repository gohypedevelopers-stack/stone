import React, { memo } from "react";
import { resolveImage } from "./utils/urlHelper";

const CartDrawer = memo(function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  subtotal, 
  remainingForFreeDelivery, 
  pointsEarned, 
  decQty, 
  incQty, 
  removeFromCart,
  setCart,
  formatINR,
  onCheckout
}) {
  return (
    <div className="cart-drawer-wrapper">
      {/* Backdrop for closing by clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed top-0 right-0 w-[min(420px,92vw)] h-[100vh] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-[110%]"}`} aria-label="Shopping cart">
      <div className="p-[16px] border-b border-line-custom flex items-start justify-between gap-[12px]">
        <div>
          <div className="font-bold">Your Cart</div>
          <div className="text-[13px] text-muted-custom mt-[4px]">
            Subtotal: <strong>{formatINR(subtotal)}</strong>
            {remainingForFreeDelivery > 0 ? (
              <span className="ml-[6px]"> • Add {formatINR(remainingForFreeDelivery)} for free delivery</span>
            ) : (
              <span className="ml-[6px]"> • Free delivery unlocked</span>
            )}
          </div>
        </div>
        <button className="border border-line-custom bg-white h-[40px] w-[40px] rounded-[2px] grid place-items-center cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" onClick={onClose} aria-label="Close cart">✕</button>
      </div>

      <div className="p-[14px_16px_18px] overflow-auto">
        {cartItems.length === 0 ? (
          <div className="text-muted-custom">
            <p>Your cart is empty.</p>
            <button className="border border-line-custom bg-white rounded-[2px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] mt-4" onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <>
            <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
              {cartItems.map((it) => (
                <li key={it.id} className="grid grid-cols-[54px_1fr_auto] gap-[12px] items-center p-[10px] border border-line-custom rounded-[2px]">
                    <div className="h-[54px] w-[54px] rounded-[2px] bg-stone-100 overflow-hidden shrink-0">
                      <img 
                        src={
                          resolveImage(it.imageUrls?.[0]) || 
                          resolveImage(it.image) || 
                          "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80"
                        } 
                        alt={it.name} 
                        className="w-full h-full object-cover"
                        decoding="async"
                      />
                    </div>
                  <div>
                    <div className="font-[650] text-[13px]">{it.name}</div>
                    <div className="flex items-center gap-2 mt-[2px]">
                      <div className="text-[12px] text-muted-custom ">{formatINR(it.price)}</div>
                      {it.stock <= 0 && (
                        <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                          Pre-Order
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-[10px] mt-[6px]">
                      <button className="h-[28px] w-[28px] rounded-[2px] border border-line-custom bg-white cursor-pointer" onClick={() => decQty(it.id)} aria-label="Decrease quantity">−</button>
                      <span className="text-[13px] min-w-[16px] text-center">{it.qty}</span>
                      <button className="h-[28px] w-[28px] rounded-[2px] border border-line-custom bg-white cursor-pointer" onClick={() => incQty(it.id)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <div className="font-bold text-[13px]">{formatINR(it.line)}</div>
                </li>
              ))}
            </ul>

            <div className="my-[14px] mx-0 px-[12px] py-[12px] rounded-[2px] border border-black/6 bg-[linear-gradient(90deg,rgba(111,92,255,0.10),rgba(255,93,177,0.08),rgba(255,138,42,0.08))] text-[13px]">
              Earn <strong>{pointsEarned} loyalty points</strong> on this order.
              <span className="text-muted-custom"> Redeem points for discounts on your next purchase.</span>
            </div>

            <button className="w-full border border-line-custom bg-white rounded-[2px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-transparent text-white bg-[linear-gradient(90deg,var(--brand1),var(--brand2),var(--brand3))]" onClick={onCheckout}>
              Checkout
            </button>
            <button className="w-full border border-line-custom bg-white rounded-[2px] h-[42px] px-[16px] inline-flex items-center justify-center gap-[10px] cursor-pointer hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] bg-white mt-2" onClick={() => setCart([])}>
              Clear cart
            </button>
          </>
        )}
      </div>
    </aside>
    </div>
  );
});

export default CartDrawer;
