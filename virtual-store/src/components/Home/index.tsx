import { Link, Navigate } from 'react-router-dom';
import { useFetch } from '../../lib/useFetch';
import { getErrorMessage } from '../../lib/errors';
import { useAppSelector } from '../Hooks/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '../Auth/authSelectors';
import type { ProductPreview } from '../interfaces/productParameters';
import ProductCard from '../Products/ProductCard';
import { StyledSectionProducts } from '../Products/styles';
import { StyledError } from '../Theme/components';
import { StyledHero } from './styles';

/**
 * Public landing page (/): a preview of featured products for visitors.
 * Customers with a session go straight to the full catalog.
 */
const Home = () => {
    const initialized = useAppSelector(selectAuthInitialized);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    // Public endpoint: no session needed (the backend ignores any token here)
    const { data, loading, error } = useFetch<ProductPreview[]>('/products/preview/');

    if (initialized && isAuthenticated) return <Navigate to='/store' replace />;

    return (
        <>
            <StyledHero>
                <h2>Welcome to Virtual Store</h2>
                <p>Here are some of our products. Log in or create an account to see the full catalog and buy.</p>
                <div>
                    <Link to='/login'>Log in</Link>
                    <Link to='/sign-up'>Sign up</Link>
                </div>
            </StyledHero>

            {loading && <p role='status'>Loading products...</p>}
            {error && (
                <StyledError role='alert'>{getErrorMessage(error, 'Could not load the products.')}</StyledError>
            )}
            {data && data.length === 0 && <p>No products available yet.</p>}
            {data && data.length > 0 && (
                <StyledSectionProducts>
                    {data.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </StyledSectionProducts>
            )}
        </>
    );
};

export default Home;
