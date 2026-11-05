import { mediaUrl } from '../../lib/config';
import { images } from '../utils/images';
import type { AccessType, ProductPreview, ProductType } from '../interfaces/productParameters';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    physical: 'Physical',
    software: 'Software',
    ebook: 'E-book',
    video: 'Video',
};

export const ACCESS_TYPE_LABELS: Record<AccessType, string> = {
    purchase: 'Purchase',
    subscription: 'Subscription',
    free: 'Free',
};

/** Price the customer pays: the discount when there is one, otherwise the regular price. */
export const effectivePrice = (product: ProductPreview): number =>
    Number(product.discount_price ?? product.price ?? 0);

export const formatPrice = (value: number | string): string => `$ ${Number(value).toFixed(2)}`;

/** Uploaded image or, if the product has none, the store logo as placeholder. */
export const productImage = (product: ProductPreview): string =>
    mediaUrl(product.image) ?? images['logo.png'];
