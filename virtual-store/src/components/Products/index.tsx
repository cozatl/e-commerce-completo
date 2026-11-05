import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { addToCart } from '../Cart/cartSlice';
import { selectCartItems } from '../Cart/cartSelectors';
import { useAppSelector } from '../Hooks/hooks.ts';
import type { RootState } from '../../store/store';
import type { AppDispatch } from '../../store/store';
import type { Category, Product } from '../interfaces/productParameters';
import { useFetch } from '../../lib/useFetch';
import type { Paginated } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { StyledError } from '../Theme/components';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { StyledPager, StyledSectionProducts } from './styles';
import type { ProductPreview } from '../interfaces/productParameters';

/** Products per page. The backend accepts up to 10 (ProductPagination.max_page_size). */
export const PAGE_SIZE = 3;

const Products = () => {
    const dispatch = useDispatch<AppDispatch>();
    // The page lives in the URL (?page=2) so reload and the back button keep it
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const category = searchParams.get('category') ?? '';

    const cartItems = useAppSelector(selectCartItems);
    const pendingProducts = useAppSelector((state: RootState) => state.cart.pendingProducts);
    const [cartErrors, setCartErrors] = useState<Record<string, string>>({});

    const { data, loading, error } = useFetch<Paginated<Product>>('/products/', {
        page,
        page_size: PAGE_SIZE,
        category: category || undefined,
    });
    // If categories fail to load, the catalog still works without the filter
    const { data: categories } = useFetch<Category[]>('/categories/');

    /** Keeps ?category and ?page in the URL; empty values are dropped. */
    const updateParams = (next: { page?: number; category?: string }) => {
        const params: Record<string, string> = {};
        const nextCategory = next.category ?? category;
        const nextPage = next.page ?? page;
        if (nextCategory) params.category = nextCategory;
        if (nextPage > 1) params.page = String(nextPage);
        setSearchParams(params);
    };

    const goToPage = (next: number) => updateParams({ page: next });
    // A new category starts again on page 1
    const selectCategory = (slug: string) => updateParams({ category: slug, page: 1 });

    /** Why this product cannot be added right now (null = it can). */
    const addBlockReason = (product: Product): string | null => {
        if (product.access_type !== 'purchase') return 'Subscription only';
        const inCart = cartItems.find((item) => item.product.slug === product.slug)?.quantity ?? 0;
        if (product.product_type !== 'physical') return inCart >= 1 ? 'In cart' : null;
        if (product.stock <= 0) return 'Out of stock';
        return inCart >= product.stock ? 'Max in cart' : null;
    };

    const handleAddToCart = async (product: ProductPreview) => {
        setCartErrors(({ [product.slug]: _, ...rest }) => rest);
        try {
            await dispatch(addToCart({ product: product.slug })).unwrap();
        } catch (message) {
            if (message) setCartErrors((prev) => ({ ...prev, [product.slug]: String(message) }));
        }
    };

    const filter = categories && categories.length > 0 && (
        <CategoryFilter categories={categories} value={category} onChange={selectCategory} />
    );

    if (loading && !data) return <p role='status'>Loading products...</p>;

    if (error) {
        return (
            <>
            {filter}
            <StyledError role='alert'>
                {getErrorMessage(error, 'Could not load the products.')}
                {page > 1 && (
                    <button type='button' onClick={() => goToPage(1)}>
                        Go to the first page
                    </button>
                )}
            </StyledError>
            </>
        );
    }

    if (!data || data.results.length === 0) {
        return (
            <>
                {filter}
                <p>{category ? 'No products in this category.' : 'No products available yet.'}</p>
            </>
        );
    }

    const totalPages = Math.max(1, Math.ceil(data.count / PAGE_SIZE));

    return (
        <>
            {filter}
            <StyledSectionProducts aria-busy={loading}>
                {data.results.map((product) => (
                    <ProductCard 
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        adding={pendingProducts.includes(product.slug)}
                        blockReason={addBlockReason(product)}
                        error={cartErrors[product.slug] ?? null}
                    />
                ))}
            </StyledSectionProducts>
            <StyledPager aria-label='Pagination'>
                <button type='button' onClick={() => goToPage(page - 1)} disabled={!data.previous || loading}>
                    Previous
                </button>
                <span>
                    Page {page} of {totalPages}
                </span>
                <button type='button' onClick={() => goToPage(page + 1)} disabled={!data.next || loading}>
                    Next
                </button>
            </StyledPager>
        </>
    );
};

export default Products;
