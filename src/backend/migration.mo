import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    products : Map.Map<Text, {
      id : Text;
      seller : Principal;
      name : Text;
      description : Text;
      price : Nat;
      category : Text;
      image : ?ExternalBlob.ExternalBlob;
    }>;
    carts : Map.Map<Principal, List.List<{ productId : Text; quantity : Nat }>>;
    orders : Map.Map<Text, {
      id : Text;
      buyer : Principal;
      items : [ { productId : Text; quantity : Nat } ];
      total : Nat;
      status : { #pending; #completed };
    }>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    products : Map.Map<Text, {
      id : Text;
      seller : Principal;
      name : Text;
      description : Text;
      price : Nat;
      category : Text;
      image : ?ExternalBlob.ExternalBlob;
    }>;
    carts : Map.Map<Principal, List.List<{ productId : Text; quantity : Nat }>>;
    orders : Map.Map<Text, {
      id : Text;
      buyer : Principal;
      items : [ { productId : Text; quantity : Nat } ];
      total : Nat;
      status : { #pending; #completed };
    }>;
    accessControlState : AccessControl.AccessControlState;
    reviews : List.List<{
      reviewId : Text;
      productId : Text;
      buyerId : Principal;
      buyerName : Text;
      rating : Nat8;
      comment : Text;
      timestamp : Int;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    { old with reviews = List.empty<{
      reviewId : Text;
      productId : Text;
      buyerId : Principal;
      buyerName : Text;
      rating : Nat8;
      comment : Text;
      timestamp : Int;
    }>() };
  };
};
