import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { addToCart } from '../Cart/cartSlice';
import type { AppDispatch } from '../../store/store';
import type { Category, Product } from '../interfaces/productParameters';
import { useFetch } from '../../lib/useFetch';
import type { Paginated } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { StyledError } from '../Theme/components';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { StyledPager, StyledSectionProducts } from './styles';
import { effectivePrice, productImage } from './productUtils';

/** Products per page. The backend accepts up to 10 (ProductPagination.max_page_size). */
export const PAGE_SIZE = 3;

const Products = () => {
    const dispatch = useDispatch<AppDispatch>();
    // The page lives in the URL (?page=2) so reload and the back button keep it
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const category = searchParams.get('category') ?? '';

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

    const handleAddToCart = (product: Product) => {
        dispatch(
            addToCart({
                id: product.id,
                name: product.name,
                img: productImage(product),
                price: effectivePrice(product),
                quantity: 1,
            })
        );
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
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
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
