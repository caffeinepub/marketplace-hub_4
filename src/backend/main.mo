import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  public type Product = {
    id : Text;
    seller : Principal;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : ?ExternalBlob.ExternalBlob;
  };

  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  public type Order = {
    id : Text;
    buyer : Principal;
    items : [CartItem];
    total : Nat;
    status : OrderStatus;
  };

  public type OrderStatus = { #pending; #completed };

  public type Review = {
    reviewId : Text;
    productId : Text;
    buyerId : Principal;
    buyerName : Text;
    rating : Nat8;
    comment : Text;
    timestamp : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Text, Product>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Text, Order>();
  let reviews = List.empty<Review>();

  type ProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : ?ExternalBlob.ExternalBlob;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  // Helper function to slice array from start index to the end
  func sliceFrom<T>(array : [T], from : Nat) : [T] {
    let size = array.size();
    if (from >= size) {
      return [];
    };
    let newSize = size - from;
    Array.tabulate<T>(
      newSize,
      func(i) {
        array[from + i];
      },
    );
  };

  // Helper function to get elements less than natIndex
  func take<T>(array : [T], natIndex : Nat) : [T] {
    Array.tabulate<T>(
      natIndex,
      func(i) { array[i] },
    );
  };

  // Helper function to filter and create a new cart
  func filterCartItemsByProductId(array : [CartItem], productId : Text) : List.List<CartItem> {
    let result = List.empty<CartItem>();
    for (item in array.values()) {
      if (item.productId != productId) {
        result.add(item);
      };
    };
    result;
  };

  func isSeller(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.role == "seller" };
    };
  };

  func isBuyer(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.role == "buyer" };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Seller Functions
  public shared ({ caller }) func addProduct(input : ProductInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add products");
    };

    if (not isSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can add products");
    };

    let id = input.name.concat(caller.toText());
    let product : Product = {
      id;
      seller = caller;
      name = input.name;
      description = input.description;
      price = input.price;
      category = input.category;
      image = input.image;
    };

    products.add(id, product);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Text, input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    if (not isSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can update products");
    };

    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (existingProduct.seller != caller) {
      Runtime.trap("Unauthorized: You can only update your own products");
    };

    let updatedProduct : Product = {
      id;
      seller = caller;
      name = input.name;
      description = input.description;
      price = input.price;
      category = input.category;
      image = input.image;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };

    if (not isSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can delete products");
    };

    let product = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (product.seller != caller) {
      Runtime.trap("Unauthorized: You can only delete your own products");
    };

    products.remove(id);
  };

  public query ({ caller }) func getSellerProducts(seller : Principal) : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view seller products");
    };

    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own products");
    };

    products.values().toArray().filter(
      func(p) {
        p.seller == seller;
      }
    );
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.category == category;
      }
    );
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.name.toLower().contains(#text(searchTerm.toLower()));
      }
    );
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can add items to cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existing) { existing };
    };
    let itemsArray = cart.toArray();
    let existingIndex = switch (itemsArray.findIndex(func(item) { item.productId == productId })) {
      case (?index) { index };
      case (null) { -1 };
    };

    if (existingIndex != -1) {
      let natIndex = existingIndex.toNat();
      if (natIndex < itemsArray.size()) {
        let currentItem = itemsArray[natIndex];
        let newQuantity = currentItem.quantity + quantity;
        let updatedItem = {
          productId = currentItem.productId;
          quantity = newQuantity;
        };

        let beforeIndex = take(itemsArray, natIndex);
        let afterIndex = sliceFrom(itemsArray, (natIndex + 1));

        let newCart = List.fromArray<CartItem>(beforeIndex);
        newCart.add(updatedItem);
        for (item in afterIndex.values()) {
          newCart.add(item);
        };

        carts.add(caller, newCart);
      };
    } else {
      cart.add({
        productId;
        quantity;
      });
      carts.add(caller, cart);
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from cart");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can remove items from cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existing) { existing };
    };

    let filteredCart = filterCartItemsByProductId(cart.toArray(), productId);
    carts.add(caller, filteredCart);
  };

  public shared ({ caller }) func updateCartItem(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can update cart items");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existing) { existing };
    };

    let itemsArray = cart.toArray();
    let existingIndex = switch (itemsArray.findIndex(func(item) { item.productId == productId })) {
      case (?index) { index };
      case (null) { -1 };
    };
    if (existingIndex == -1) {
      Runtime.trap("Item not found in cart");
    };
    let natIndex = existingIndex.toNat();
    let currentItem = itemsArray[natIndex];
    let updatedItem = {
      productId = currentItem.productId;
      quantity;
    };

    let beforeIndex = take(itemsArray, natIndex);
    let afterIndex = sliceFrom(itemsArray, (natIndex + 1));
    let newCart = List.fromArray<CartItem>(beforeIndex);
    newCart.add(updatedItem);
    for (item in afterIndex.values()) {
      newCart.add(item);
    };
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func checkout() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can checkout");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can checkout");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existing) { existing };
    };

    let total = cart.toArray().foldLeft(
      0,
      func(acc, item) {
        let product = switch (products.get(item.productId)) {
          case (null) { return acc };
          case (?p) { p };
        };
        acc + (product.price * item.quantity);
      },
    );

    let orderId = "order_" #caller.toText();
    let order : Order = {
      id = orderId;
      buyer = caller;
      items = cart.toArray();
      total;
      status = #pending;
    };

    orders.add(orderId, order);
    carts.remove(caller);
  };

  public query ({ caller }) func getBuyerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can view buyer orders");
    };

    orders.values().toArray().filter(
      func(o) {
        o.buyer == caller;
      }
    );
  };

  public query ({ caller }) func getSellerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    if (not isSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can view seller orders");
    };

    let sellerProducts = products.values().toArray().filter(
      func(p) {
        p.seller == caller;
      }
    );

    let sellerProductIds = sellerProducts;
    orders.values().toArray().filter(
      func(o) {
        o.items.foldLeft(false, func(acc, item) { acc or sellerProductIds.find(func(i) { i.id == item.productId }) != null });
      }
    );
  };

  // Review Management

  func hasPurchasedProduct(buyerId : Principal, productId : Text) : Bool {
    let buyerOrders = orders.values().toArray().filter(func(order) { order.buyer == buyerId });
    
    for (order in buyerOrders.values()) {
      switch (order.items.find(func(item) { item.productId == productId })) {
        case (?_) { return true };
        case (null) {};
      };
    };
    
    false;
  };

  public shared ({ caller }) func addReview(productId : Text, rating : Nat8, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add reviews");
    };

    if (not isBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can add reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let productExists = products.containsKey(productId);
    if (not productExists) {
      Runtime.trap("Product does not exist");
    };

    if (not hasPurchasedProduct(caller, productId)) {
      Runtime.trap("You must purchase the product before leaving a review");
    };

    let buyerName = switch (userProfiles.get(caller)) {
      case (null) { "" };
      case (?profile) { profile.name };
    };

    let review : Review = {
      reviewId = productId #caller.toText() #Time.now().toText();
      productId;
      buyerId = caller;
      buyerName;
      rating;
      comment;
      timestamp = Time.now();
    };

    reviews.add(review);
  };

  public query func getProductReviews(productId : Text) : async [Review] {
    reviews.filter(func(r) { r.productId == productId }).toArray();
  };

  public query func getProductAverageRating(productId : Text) : async Float {
    let productReviews = reviews.filter(func(r) { r.productId == productId });
    let reviewCount = productReviews.size();

    if (reviewCount == 0) {
      return 0;
    };

    let totalRating = productReviews.toArray().foldLeft(
      0,
      func(acc, review) {
        acc + review.rating.toNat();
      },
    );

    totalRating.toFloat() / reviewCount.toFloat();
  };
};
