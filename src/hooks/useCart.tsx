import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get(`products/${productId}`)
      
      if(cart.some(product => product.id === response.data.id)) {
        toast.info('produto já no carrinho');
        return;
      }
      const newProductList = [...cart, response.data]
      await localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      setCart(newProductList)
    } catch {
      toast.error('Erro ao adicionar ao carrinho')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCartList = cart.filter(product => product.id !== productId)
      setCart(newCartList)
    } catch {
      toast.error('Erro ao remover produto do carrinho')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productUpdate = cart.map(product => {
        if(product.id === productId) product.amount = amount;
        return product;
      })
      setCart(productUpdate)
    } catch {
      toast.error('Erro ao alterar produto do carrinho')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      { children }
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
