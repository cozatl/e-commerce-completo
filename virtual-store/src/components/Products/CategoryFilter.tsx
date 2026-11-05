import type { Category } from '../interfaces/productParameters';
import { StyledCategoryFilter } from './styles';

interface CategoryFilterProps {
    categories: Category[];
    /** Selected slug; empty string means "all". */
    value: string;
    onChange: (slug: string) => void;
}

/** Select with top-level categories and their subcategories indented below. */
const CategoryFilter = ({ categories, value, onChange }: CategoryFilterProps) => {
    const parents = categories.filter((c) => c.parent === null);
    const childrenOf = (slug: string) => categories.filter((c) => c.parent === slug);

    return (
        <StyledCategoryFilter>
            <label htmlFor='categoryFilter'>Category</label>
            <select id='categoryFilter' value={value} onChange={(e) => onChange(e.target.value)}>
                <option value=''>All</option>
                {parents.map((parent) => [
                    <option key={parent.id} value={parent.slug}>
                        {parent.name}
                    </option>,
                    ...childrenOf(parent.slug).map((child) => (
                        <option key={child.id} value={child.slug}>
                            {'  — '}
                            {child.name}
                        </option>
                    )),
                ])}
            </select>
        </StyledCategoryFilter>
    );
};

export default CategoryFilter;
