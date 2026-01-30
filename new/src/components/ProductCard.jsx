import { Heart } from "lucide-react";
import "./ProductCard.css";

function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export default function ProductCard({ product, onAddToCart }) {
    return (
        <div className="modernCard">
            <div className="cardImageFrame">
                <div className="cardGradientBackground" />
                {/* Placeholder for actual product image if available, otherwise just gradient */}
            </div>

            <div className="cardContent">
                <div className="cardBadges">
                    {product.tag && (
                        <span className={`badgePill ${product.tag === 'New' ? 'badgePink' : 'badgePink'}`}>
                            {product.tag}
                        </span>
                    )}
                </div>

                <h3 className="cardTitle">{product.name}</h3>

                <div className="cardMetaRow">
                    <span className="cardPrice">{formatINR(product.price)}</span>
                    <span className="cardRating">★ {product.rating}</span>
                </div>

                {product.origin && (
                    <span className="originPill">{product.origin}</span>
                )}

                <div className="cardActions">
                    <button className="wishlistBtn" aria-label="Wishlist">
                        <Heart size={20} strokeWidth={1.5} />
                    </button>
                    <button className="addToCartBtn" onClick={() => onAddToCart(product.id)}>
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
}
