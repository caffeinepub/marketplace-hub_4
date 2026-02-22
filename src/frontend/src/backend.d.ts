import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ProductInput {
    name: string;
    description: string;
    category: string;
    image?: ExternalBlob;
    price: bigint;
}
export interface Product {
    id: string;
    name: string;
    description: string;
    seller: Principal;
    category: string;
    image?: ExternalBlob;
    price: bigint;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface Order {
    id: string;
    status: OrderStatus;
    total: bigint;
    buyer: Principal;
    items: Array<CartItem>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Review {
    productId: string;
    comment: string;
    buyerId: Principal;
    timestamp: bigint;
    rating: number;
    buyerName: string;
    reviewId: string;
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(input: ProductInput): Promise<string>;
    addReview(productId: string, rating: number, comment: string): Promise<void>;
    addToCart(productId: string, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getBuyerOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getProductAverageRating(productId: string): Promise<number>;
    getProductReviews(productId: string): Promise<Array<Review>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getSellerOrders(): Promise<Array<Order>>;
    getSellerProducts(seller: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    updateCartItem(productId: string, quantity: bigint): Promise<void>;
    updateProduct(id: string, input: ProductInput): Promise<void>;
}
