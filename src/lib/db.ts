import { collection, getDocs, setDoc, doc, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

// Seeding products to Firestore
export async function seedProducts() {
  try {
    const batch = writeBatch(db);
    for (const p of PRODUCTS) {
      const ref = doc(db, 'products', p.id.toString());
      batch.set(ref, p);
    }
    await batch.commit();
    console.log("Aura Boutique products seeded successfully to Firestore.");
  } catch (error) {
    console.error("Critical error seeding default products:", error);
  }
}

// Fetch products from Firestore database
export async function getProductsFromDB(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    if (snapshot.empty) {
      // Auto-populate when empty
      await seedProducts();
      return PRODUCTS;
    }
    const fetched: Product[] = [];
    snapshot.forEach((docSnapshot) => {
      fetched.push(docSnapshot.data() as Product);
    });
    // Sort products by original numeric ID to preserve shop presentation flow
    return fetched.sort((a, b) => a.id - b.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'products');
    return PRODUCTS; // graceful fallback logic
  }
}

// Save order in Firestore database
export interface OrderData {
  id: string;
  userEmail: string;
  customerName: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any; // Firebase server timestamp or Date object
  paymentMethod?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export async function createOrderInDB(orderData: OrderData): Promise<void> {
  const path = `orders/${orderData.id}`;
  try {
    const formattedData = {
      ...orderData,
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'orders', orderData.id), formattedData);
    console.log(`Order ${orderData.id} recorded in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch all orders from Firestore database
export async function getOrdersFromDB(): Promise<OrderData[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const snapshot = await getDocs(ordersCol);
    const fetched: OrderData[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      
      // Safe creation date conversion
      let orderDate = new Date();
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          orderDate = data.createdAt.toDate();
        } else {
          orderDate = new Date(data.createdAt);
        }
      }

      fetched.push({
        id: data.id,
        userEmail: data.userEmail || '',
        customerName: data.customerName || 'Guest User',
        items: data.items || [],
        total: data.total || 0,
        status: data.status || 'processing',
        createdAt: orderDate,
        paymentMethod: data.paymentMethod || 'Card',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || ''
      });
    });
    // Sort descending by order date
    return fetched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'orders');
    return [];
  }
}

// Add new product to Firestore database
export async function addProductToDB(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id.toString()), product);
    console.log(`Product ${product.id} successfully created in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete product from Firestore database
export async function deleteProductFromDB(productId: number): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId.toString()));
    console.log(`Product ${productId} successfully deleted from Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
