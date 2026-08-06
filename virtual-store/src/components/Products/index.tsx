import { useDispatch } from "react-redux";
import { addToCart } from "../Cart/cartSlice";
import { images } from "../utils/images";
import { StyledSectionProducts } from "./styles";
import { AppDispatch } from "../../store/store";
import { CartItem } from "../interfaces/cartParameters";
import { useEffect } from "react";
import { addProducts } from "./productSlice";
import { useAppSelector } from "../Hooks/hooks";
import { selectProducts } from "./productSelector";

const Products = () => {
    const dispatch = useDispatch<AppDispatch>();
    const products = useAppSelector(selectProducts);
    const mockedProducts = [{
            "id": 1,
            "name": "Sweater",
            "img": images['sweater.jpg'],
            "price": 1000
        },
        {
            "id": 2,
            "name": "Sweater",
            "img": images['sweater.jpg'],
            "price": 1200
        },
        {
            "id": 3,
            "name": "Sweater",
            "img": images['sweater.jpg'],
            "price": 1300
        },
        {
            "id": 4,
            "name": "Sweater",
            "img": images['sweater.jpg'],
            "price": 1100
        }
    ]
    useEffect(() => {
        dispatch(addProducts(mockedProducts));
    }, [dispatch]);
    
    const handleAddToCart = (id: number, name: string, img: string, price: number) => {
        if (id) {
            const cartItem: CartItem = {
                "id": id,
                "name": name,
                "img": img,
                "price": price,
                "quantity": 1
            }
            // Dispatch the action with the input value as the payload
            dispatch(addToCart(cartItem));
            
            // Optional: Clear the input after sending
            // setInputValue(''); 
        }
    };
    return (
        <StyledSectionProducts>
            {products.map(product => (
                <article key={product.id}>
                    <img alt={`${product.name}`} src={`${product.img}`} />
                    <h3>{product.name}</h3>
                    <p>$ {product.price}</p>
                    <div>
                        <button onClick={() => handleAddToCart(product.id, product.name!, product.img!, product.price)}>Add to Cart</button>                        
                    </div>
                </article>
                )
            )}
        </StyledSectionProducts>
    )
}

export default Products;