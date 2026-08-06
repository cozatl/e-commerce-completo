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
            "price": 800
        },
        {
            "id": 2,
            "name": "Shirt",
            "img": images['shirt.jpg'],
            "price": 600
        },
        {
            "id": 3,
            "name": "Blouse",
            "img": images['blouse.jpg'],
            "price": 700
        },
        {
            "id": 4,
            "name": "Hoodie",
            "img": images['hoodie.jpg'],
            "price": 800
        },
        {
            "id": 5,
            "name": "Jeans",
            "img": images['jeans.jpg'],
            "price": 600
        },
        {
            "id": 6,
            "name": "Pants",
            "img": images['pants.jpg'],
            "price": 700
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