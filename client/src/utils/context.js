import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const Context = createContext();

const AppContext = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartSubTotal, setCartSubTotal] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0); 
    const [totalUsers, setTotalUsers] = useState(0);
    const [topSellingProductsByRevenue, setTopSellingProductsByRevenue] = useState([]);
    const [orders, setOrders] = useState([]);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        let count = 0;
        let subTotal = 0;

        cartItems.forEach((item) => {
            count += item.attributes.quantity;
            subTotal += item.attributes.price * item.attributes.quantity;
        });

        setCartCount(count);
        setCartSubTotal(subTotal);
    }, [cartItems]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    useEffect(() => {
        if (user) {
            const storedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`)) || [];
            setFavorites(storedFavorites);
            const storedCartItems = JSON.parse(localStorage.getItem(`cartItems_${user.id}`)) || [];
            setCartItems(storedCartItems);
        } else {
            setFavorites([]);
            setCartItems([]);
        }
    }, [user]);

    useEffect(() => {
        // Fetch all orders to calculate total revenue
        fetch(`${process.env.REACT_APP_DEV_URL}/api/orders?populate=*`)
            .then(response => response.json())
            .then(data => {
                const total = data.data.reduce((acc, order) => acc + parseFloat(order.attributes.total), 0);
                setTotalRevenue(total);
                setOrders(data.data); // Save order data
            })
            .catch(error => console.error("Error fetching orders:", error));
    }, []);

    useEffect(() => {
        // Fetch all users to calculate total users
        fetch(`${process.env.REACT_APP_DEV_URL}/api/clients`)
            .then(response => response.json())
            .then(data => {
                setTotalUsers(data.data.length);
            })
            .catch(error => console.error("Error fetching users:", error));
    }, []);

    useEffect(() => {
        // Calculate top-selling products by revenue
        const productSales = {};

        orders.forEach(order => {
            order.attributes.products.forEach(product => {
                const productId = product.id;
                const productPrice = product.attributes.price;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        id: productId,
                        title: product.attributes.title,
                        totalPrice: 0,
                        ...product.attributes
                    };
                }
                productSales[productId].totalPrice += product.attributes.quantity * productPrice;
            });
        });

        const sortedProducts = Object.values(productSales).sort((a, b) => b.totalPrice - a.totalPrice);
        setTopSellingProductsByRevenue(sortedProducts.slice(0, 8));
    }, [orders]);

    const handleAddToCart = (product, quantity) => {
        let items = [...cartItems];
        const index = items.findIndex((p) => p.id === product.id);

        if (index !== -1) {
            items[index].attributes.quantity += quantity;
        } else {
            product.attributes.quantity = quantity;
            items = [...items, product];
        }

        setCartItems(items);
        if (user) {
            localStorage.setItem(`cartItems_${user.id}`, JSON.stringify(items));
        }
    };

    const handleRemoveFromCart = (product) => {
        const items = cartItems.filter((p) => p.id !== product.id);
        setCartItems(items);

        if (user) {
            localStorage.setItem(`cartItems_${user.id}`, JSON.stringify(items));
        }
    };

    const handleCartProductQuantity = (type, product) => {
        const items = [...cartItems];
        const index = items.findIndex((p) => p.id === product.id);

        if (type === "inc") {
            items[index].attributes.quantity += 1;
        } else if (type === "dec") {
            if (items[index].attributes.quantity === 1) return;
            items[index].attributes.quantity -= 1;
        }

        setCartItems(items);
        if (user) {
            localStorage.setItem(`cartItems_${user.id}`, JSON.stringify(items));
        }
    };

    const clearCartItems = () => {
        setCartItems([]);
        setCartSubTotal(0);
        setCartCount(0);

        if (user) {
            localStorage.removeItem(`cartItems_${user.id}`);
        }
    };

    const addFavorite = (product) => {
        const updatedFavorites = [...favorites, product];
        setFavorites(updatedFavorites);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    };

    const removeFavorite = (productId) => {
        const updatedFavorites = favorites.filter((product) => product.id !== productId);
        setFavorites(updatedFavorites);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
    };

    return (
        <Context.Provider
            value={{
                categories,
                setCategories,
                products,
                setProducts,
                cartItems,
                setCartItems,
                cartCount,
                setCartCount,
                cartSubTotal,
                setCartSubTotal,
                handleAddToCart,
                handleRemoveFromCart,
                handleCartProductQuantity,
                clearCartItems,
                favorites,
                addFavorite,
                removeFavorite,
                user,
                setUser,
                setFavorites,
                totalRevenue, 
                totalUsers, 
                topSellingProductsByRevenue,
                orders
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default AppContext;
