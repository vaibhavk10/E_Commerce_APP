import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

export default function ProductDetailsScreen() {  const route = useRoute();
  const product = (route.params as { product: Product }).product;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWishlistStatus();
  }, []);

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await AsyncStorage.getItem('wishlist');
      const wishlistItems = wishlist ? JSON.parse(wishlist) : [];
      setIsInWishlist(wishlistItems.some((item: Product) => item.id === product.id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      const wishlist = await AsyncStorage.getItem('wishlist');
      let wishlistItems = wishlist ? JSON.parse(wishlist) : [];
      
      if (isInWishlist) {
        wishlistItems = wishlistItems.filter((item: Product) => item.id !== product.id);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Removed from wishlist'
        });
      } else {
        wishlistItems.push(product);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Added to wishlist'
        });
      }
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update wishlist'
      });
    }
  };

  const addToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      
      const existingItem = cart.find((item: Product) => item.id === product.id);
      if (existingItem) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Item already in cart'
        });
        return;
      }

      cart.push(product);
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Added to cart!'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add to cart'
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={toggleWishlist}
            style={styles.wishlistButton}
          >
            <Text style={[styles.wishlistButtonText, isInWishlist && styles.wishlistButtonActive]}>
              {isInWishlist ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.category}>{product.category.toUpperCase()}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#0066CC',
  },
  wishlistButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistButtonText: {
    fontSize: 24,
    color: '#666',
  },
  wishlistButtonActive: {
    color: '#FF3B30',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  category: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});