import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import type { Product, ProductPreview } from '../interfaces/productParameters';
import { StyledBadge, StyledPrice, StyledProductCard } from './styles';
import {
    effectivePrice,
    formatPrice,
    productImage,
    PRODUCT_TYPE_LABELS,
} from './productUtils';

interface ProductCardProps {
    product: ProductPreview;                               // Product also fits (it extends ProductPreview)
    onAddToCart?: (product: ProductPreview) => void;       // optional: the public preview has no cart
    adding?: boolean;
    blockReason?: string | null;
    error?: string | null;
}

const isFullProduct = (product: ProductPreview | Product): product is Product =>
    'is_available' in product;

const PriceTag = ({ product }: { product: ProductPreview }) => {
    if (product.access_type === 'subscription') {
        return (
            <StyledPrice>
                <FaLock aria-hidden='true' /> Subscribers only
            </StyledPrice>
        );
    }
    if (product.access_type === 'free' || effectivePrice(product) === 0) {
        return <StyledPrice>Free</StyledPrice>;
    }
    return (
        <StyledPrice>
            {product.discount_price !== null && <del>{formatPrice(product.price ?? 0)}</del>}
            {formatPrice(effectivePrice(product))}
        </StyledPrice>
    );
};

/** What the button does depends on who is looking and how the product is obtained. */
const CardAction = ({ product, onAddToCart, adding = false, blockReason = null, error = null }: ProductCardProps) => {
    const isSubscription = product.access_type === 'subscription';

    // Home page preview: visitors are invited to log in or sign up
    if (!onAddToCart || !isFullProduct(product)) {
        return isSubscription ? (
            <Link to='/sign-up'>Subscribe</Link>
        ) : (
            <Link to='/login'>Log in to buy</Link>
        );
    }

    // Subscription plans arrive with billing (M4)
    if (isSubscription) {
        return (
            <button type='button' disabled title='Subscription plans coming soon'>
                Subscribe
            </button>
        );
    }

    if (!product.is_available) {
        return (
            <button type='button' disabled>
                Out of stock
            </button>
        );
    }

    if (!onAddToCart) return null;   // public preview: no cart button

    return (
        <>
            <button
                type='button'
                onClick={() => onAddToCart(product)}
                disabled={adding || blockReason !== null}
            >
                {adding ? 'Adding...' : blockReason ?? 'Add to Cart'}
            </button>
            {error && <p role='alert'>{error}</p>}
        </>
    );
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => (
    <StyledProductCard $locked={product.access_type === 'subscription'}>
        <img alt={product.name} src={productImage(product)} />
        {product.product_type !== 'physical' && (
            <StyledBadge>{PRODUCT_TYPE_LABELS[product.product_type]}</StyledBadge>
        )}
        <h3>{product.name}</h3>
        <PriceTag product={product} />
        <div>
            <CardAction product={product} onAddToCart={onAddToCart} />
        </div>
    </StyledProductCard>
);

export default ProductCard;
