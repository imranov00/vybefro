import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ZodiacSwipeCardProps {
  photos: string[];
  name: string;
  onPhotoIndexChange?: (index: number) => void;
}

const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.48;

const ZodiacSwipeCard: React.FC<ZodiacSwipeCardProps> = ({ photos, name, onPhotoIndexChange }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(y / CARD_HEIGHT);
    if (newIndex !== photoIndex) {
      setPhotoIndex(newIndex);
      onPhotoIndexChange?.(newIndex);
    }
  };

  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        {photos && photos.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={photos}
            keyExtractor={(item, idx) => `${item}-${idx}`}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
            )}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            horizontal={false}
            style={{ flex: 1 }}
            onScroll={handleScroll}
            snapToInterval={CARD_HEIGHT}
            decelerationRate="fast"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Fotoğraf yok</Text>
          </View>
        )}
        {/* Fotoğraf index göstergesi */}
        {photos && photos.length > 1 && (
          <View style={styles.photoIndicator}>
            {photos.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === photoIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}
        {/* Kullanıcı adı overlay */}
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 28,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#22223b',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_HEIGHT,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#393960',
    width: '100%',
    height: CARD_HEIGHT,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.7,
  },
  photoIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'column',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 2,
  },
  activeDot: {
    backgroundColor: '#B57EDC',
    width: 10,
    height: 10,
  },
  nameOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  nameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default ZodiacSwipeCard; 