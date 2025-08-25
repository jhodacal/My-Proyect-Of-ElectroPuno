import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
  Modal,
  StatusBar,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedCarousel = () => {
  // Datos de las imágenes con información sobre electricidad
  const carouselData = [
    {
      id: 1,
      title: 'Electricidad y Rayos',
      image: require('../Imagenes/carrucel/Electro1.png'),
      color: '#4c6ef5',
    },
    {
      id: 2,
      title: 'Transmisión Eléctrica',
      image: require('../Imagenes/carrucel/foto2.jpg'),
      color: '#12d8fa',
    },
    {
      id: 3,
      title: 'Trabajo Eléctrico',
      image: require('../Imagenes/carrucel/foto3.jpg'),
      color: '#ffa726',
    },
    {
      id: 4,
      title: 'Torres de Alta Tensión',
      image: require('../Imagenes/carrucel/foto4.jpg'),
      color: '#66bb6a',
    },
    {
      id: 5,
      title: 'Red Eléctrica Nocturna',
      image: require('../Imagenes/carrucel/foto5.jpg'),
      color: '#ab47bc',
    },
    {
      id: 6,
      title: 'Energía Renovable',
      image: require('../Imagenes/carrucel/foto6.jpg'),
      color: '#26c6da',
    },
    {
      id: 7,
      title: 'Plantas de Energía',
      image: require('../Imagenes/carrucel/foto 7.jpg'),
      color: '#ef5350',
    },
    {
      id: 8,
      title: 'Energía Eólica',
      image: require('../Imagenes/carrucel/foto8.jpg'),
      color: '#42a5f5',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const scrollViewRef = useRef(null);
  const autoPlayRef = useRef(null);
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Animaciones para cada imagen
  const imageAnims = useRef(
    carouselData.map(() => ({
      scale: new Animated.Value(0.8),
      opacity: new Animated.Value(0.5),
      translateY: new Animated.Value(50),
    }))
  ).current;

  // Animación de pulso continuo para indicadores
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Animación de brillo para el header
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, []);

  // Auto-play con animaciones
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % carouselData.length;
          animateTransition(nextIndex);
          scrollToIndex(nextIndex);
          return nextIndex;
        });
      }, 5000);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlay, carouselData.length]);

  // Animar transición entre imágenes
  const animateTransition = (index) => {
    // Animar salida de la imagen actual
    Animated.parallel([
      Animated.timing(imageAnims[currentIndex].scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageAnims[currentIndex].opacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animar entrada de la nueva imagen
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(imageAnims[index].scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(imageAnims[index].opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(imageAnims[index].translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 150);
  };

  // Función para hacer scroll a un índice específico
  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  // Manejar el scroll manual
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      animateTransition(index);
    }
  };

  // Navegación manual con animaciones
  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % carouselData.length;
    
    // Animación de rotación para el botón
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(nextIndex);
    animateTransition(nextIndex);
    scrollToIndex(nextIndex);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? carouselData.length - 1 : currentIndex - 1;
    
    // Animación de rotación para el botón
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: -1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentIndex(prevIndex);
    animateTransition(prevIndex);
    scrollToIndex(prevIndex);
  };

  // Manejar click en imagen para expandir con animaciones
  const handleImagePress = (item, index) => {
    // Animación de escala y rebote
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de fade para el modal
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedImage(item);
      setIsModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Cerrar modal con animación
  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setSelectedImage(null);
      fadeAnim.setValue(1);
    });
  };

  // Toggle auto-play con animación
  const toggleAutoPlay = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: isAutoPlay ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsAutoPlay(!isAutoPlay);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-180deg', '0deg', '180deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });


  // Estados para login
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    showPassword: false,
  });
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
      
  
     

      {/* Carrusel principal con animaciones */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => setIsAutoPlay(false)}
          onScrollEndDrag={() => setIsAutoPlay(true)}
        >
          {carouselData.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.carouselItem}
              onPress={() => handleImagePress(item, index)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.imageContainer,
                  {
                    transform: [
                      { scale: currentIndex === index ? imageAnims[index].scale : 0.95 },
                      { translateY: imageAnims[index].translateY },
                    ],
                    opacity: currentIndex === index ? imageAnims[index].opacity : 0.7,
                  },
                ]}
              >
                <Image source={item.image} style={styles.carouselImage} />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Botones de navegación animados */}
        <Animated.View style={[styles.navButtonLeft, { transform: [{ rotate: spin }] }]}>
          <TouchableOpacity onPress={goToPrevious} style={styles.navButton}>
            <LinearGradient
              colors={['#00d4ff', '#0099cc']}
              style={styles.navButtonGradient}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.navButtonRight, { transform: [{ rotate: spin }] }]}>
          <TouchableOpacity onPress={goToNext} style={styles.navButton}>
            <LinearGradient
              colors={['#00d4ff', '#0099cc']}
              style={styles.navButtonGradient}
            >
              <Text style={styles.navButtonText}>›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Indicadores de página animados */}
      <View style={styles.indicatorContainer}>
        {carouselData.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              animateTransition(index);
              scrollToIndex(index);
            }}
          >
            <Animated.View
              style={[
                styles.indicator,
                {
                  backgroundColor: currentIndex === index ? item.color : '#ffffff30',
                  width: currentIndex === index ? 10 : 10,

                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Controles animados */}
      <View style={styles.controlsContainer}>
        <Animated.View style={{ transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }) }] }}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: isAutoPlay ? '#ff4757' : '#2ed573' }
            ]}
            onPress={toggleAutoPlay}
          >
            <LinearGradient
              colors={isAutoPlay ? ['#ff4757', '#ff3742'] : ['#2ed573', '#20bf6b']}
              style={styles.controlButtonGradient}
            >
              <Text style={styles.controlButtonText}>
                {isAutoPlay ? ' ⏸ ' : ' ▶ '}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={[styles.counterContainer, { borderColor: carouselData[currentIndex].color }]}>
          <Text style={[styles.counterText, { color: carouselData[currentIndex].color }]}>
            {currentIndex + 1} / {carouselData.length}
          </Text>
        </View>
      </View>

      {/* Modal mejorado para imagen expandida */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    { 
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      })
                    }
                  ],
                }
              ]}
            >
              {selectedImage && (
                <>
                  <Image source={selectedImage.image} style={styles.expandedImage} />
         
                  
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <LinearGradient
                      colors={['#ff4757', '#ff3742']}
                      style={styles.closeButtonGradient}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  carouselContainer: {
    height: screenHeight * 0.80,
    justifyContent: 'center',
    alignSelf:'center',
    alignItems:'center', 
    marginTop: 10,
    
  },
  carouselItem: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems:'center',
    paddingHorizontal:10

  },
  imageContainer: {
    width:'90%',
    height:undefined,
    aspectRatio:1/1.414,
    flex: 1, 
    margin:50,
    overflow:'hidden',
    resizeMode:'stretch',
    borderRadius: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth:10,
    borderColor:'#37efefff'
  },
  carouselImage: {
    width: '100%',
    height: '100%',
   
  },
  imageOverlay: {
    position: 'absolute',
    marginBottom:0,
    right:0,
    left:0,
  },


  //botonesDeManejoDeCarrsuel---------------------------------------------
  //BotonRetrocedeImagenCarrusel
  navButtonLeft: { 
    position: 'absolute',
    left: 15,
    top: '106%',
    transform: [{ translateY: -30 }],
  },
  //BotonAdelantaImagenCarrusel
  navButtonRight: {
    position: 'absolute',
    right: 15,
    top: '106%',
    transform: [{ translateY: -30 }],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  navButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems:'center',
    shadowColor: '#2ae6ffff',
    elevation: 20,
  },
  navButtonText: {
    fontSize: 35,
    color: '#ffffff',
    
    fontWeight: 'bold',
  },
  //------------------------------------------------------------------
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margintop: 15,
    
  },
  indicator: {
    height: 10,
    borderRadius: 50,
    marginTop:20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent:'space-around'
    ,
    paddingHorizontal: 70,
    paddingTop:15,
    marginBottom: 15,
  },
  controlButton: {
    borderRadius: 30,
    width:70,
    height:45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  controlButtonGradient: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 25,
    margin:-10,
    textAlign:'center',
    fontWeight: 'bold',
  },
  counterContainer: {
    backgroundColor: 'rgba(1, 60, 245, 8)',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  counterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: '#16213e',
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  expandedImage: {
    
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  closeButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default AnimatedCarousel;

