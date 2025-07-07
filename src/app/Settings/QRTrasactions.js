import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ScrollView,ActivityIndicator,Platform} from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import BackButton from '../../utils/BackButton';
import * as MediaLibrary from 'expo-media-library';
import * as Crypto from 'expo-crypto';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

function QRTransactions  ()  {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [qrSecurityToken, setQrSecurityToken] = useState('');
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const qrRef = useRef();
  const viewShotRef = useRef();

  // Simular carga de transacciones
  useEffect(() => {
    const loadTransactions = async () => {
      // Simular llamada a API
      setTimeout(() => {
        const mockTransactions = [
          { id: '1', date: '2025-05-19', amount: '120.50', status: 'completed', reference: 'REF-001-2025' },
          { id: '2', date: '2025-05-15', amount: '85.30', status: 'completed', reference: 'REF-002-2025' },
          { id: '3', date: '2025-05-10', amount: '200.00', status: 'completed', reference: 'REF-003-2025' },
        ];
        setTransactions(mockTransactions);
        setLoading(false);
      }, 1000);
    };

    loadTransactions();
  }, []);

  // Solicitar permisos para guardar en galería
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === 'granted');
    })();
  }, []);

  // Generar token de seguridad
  const generateSecurityToken = async (transactionId) => {
    try {
      const timestamp = new Date().getTime();
      const randomValue = Math.random().toString(36).substring(2);
      const dataToHash = `${transactionId}-${timestamp}-${randomValue}`;
      
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataToHash
      );
      
      return digest.substring(0, 16);
    } catch (error) {
      console.error('Error generating security token:', error);
      return Math.random().toString(36).substring(2, 18);
    }
  };

  // Seleccionar transacción
  const selectTransaction = async (transaction) => {
    if (!transaction || !transaction.id) {
      console.error('Invalid transaction data');
      Alert.alert(t('error'), t('invalidTransactionData'));
      return;
    }
    
    setSelectedTransaction(transaction);
    
    try {
      const securityToken = await generateSecurityToken(transaction.id);
      setQrSecurityToken(securityToken);
      
      const qrData = JSON.stringify({
        reference: transaction.reference,
        amount: transaction.amount,
        date: transaction.date,
        securityToken: securityToken
      });
      
      setQrValue(qrData);
    } catch (error) {
      console.error('Error selecting transaction:', error);
      Alert.alert(t('error'), t('errorProcessingTransaction'));
    }
  };

  // Compartir QR como texto
  const shareQR = async () => {
    if (!selectedTransaction || !qrValue) {
      Alert.alert(t('error'), t('noTransactionSelected'));
      return;
    }
    
    try {
      await Share.share({
        message: `${t('paymentSuccess')}\n${t('reference')}: ${selectedTransaction.reference}\n${t('amount')}: $${selectedTransaction.amount}\n${t('securityToken')}: ${qrSecurityToken}`,
        title: t('qrTransactions')
      });
    } catch (error) {
      console.error('Error sharing QR:', error);
      Alert.alert(t('error'), t('sharingFailed'));
    }
  };

  // Guardar QR como imagen
  const saveQR = async () => {
    if (!selectedTransaction || !qrValue) {
      Alert.alert(t('error'), t('noTransactionSelected'));
      return;
    }
    
    if (!hasMediaPermission) {
      Alert.alert(t('error'), t('permissionDenied'));
      return;
    }

    try {
      if (!viewShotRef.current) {
        throw new Error('ViewShot reference is not available');
      }
      
      const uri = await viewShotRef.current.capture();
      if (!uri) {
        throw new Error('Failed to capture QR code image');
      }
      
      const album = 'QR Codes';
      
      // Crear el álbum si no existe
      const { exists } = await MediaLibrary.getAlbumAsync(album);
      if (!exists) {
        await MediaLibrary.createAlbumAsync(album);
      }
      
      // Guardar la imagen
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      
      Alert.alert(t('success'), t('qrSavedToGallery'));
    } catch (error) {
      console.error('Error saving QR:', error);
      Alert.alert(t('error'), t('savingFailed'));
    }
  };

  // Verificar QR
  const verifyQR = () => {
    if (!selectedTransaction || !qrSecurityToken) {
      Alert.alert(t('error'), t('noTransactionSelected'));
      return;
    }
    
    Alert.alert(
      t('qrVerification'),
      `${t('qrVerificationMessage')}\n${t('securityToken')}: ${qrSecurityToken}`,
      [{ text: t('ok') }]
    );
  };

  // Estilos dinámicos
  const dynamicStyles = {
    container: {
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    text: {
      color: theme === 'dark' ? '#fff' : '#000',
    },
    card: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    },
    detailLabel: {
      color: theme === 'dark' ? '#ccc' : '#666',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.header}>
        <BackButton 
          onPress={() => router.back()} 
          tintColor={theme === 'dark' ? '#fff' : '#000'}
        />
        <Text style={[styles.headerTitle, dynamicStyles.text]}>
          {t('Transacciones por Qr')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={[styles.loadingText, dynamicStyles.text]}>
            {t('loading')}
          </Text>
        </View>
      ) : selectedTransaction ? (
        <View style={styles.qrContainer}>
          <Text style={[styles.qrTitle, dynamicStyles.text]}>
            {t('paymentSuccess')}
          </Text>
          
          {qrValue ? (
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
              <View style={[styles.qrCard, dynamicStyles.card]}>
                <QRCode
                  value={qrValue || 'https://electropuno.com'}
                  size={200}
                  backgroundColor={theme === 'dark' ? '#1e1e1e' : '#fff'}
                  color={theme === 'dark' ? '#fff' : '#000'}
                  getRef={(ref) => (qrRef.current = ref)}
                />
                
                <View style={styles.transactionDetails}>
                  <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>
                    {t('reference')}:
                  </Text>
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    {selectedTransaction.reference}
                  </Text>
                  
                  <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>
                    {t('amount')}:
                  </Text>
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    ${selectedTransaction.amount}
                  </Text>
                  
                  <Text style={[styles.detailLabel, dynamicStyles.detailLabel]}>
                    {t('date')}:
                  </Text>
                  <Text style={[styles.detailValue, dynamicStyles.text]}>
                    {selectedTransaction.date}
                  </Text>
                  
                  <Text style={[
                    styles.securityToken,
                    { color: theme === 'dark' ? '#4caf50' : '#2e7d32' }
                  ]}>
                    {t('securityToken')}: {qrSecurityToken}
                  </Text>
                </View>
              </View>
            </ViewShot>
          ) : (
            <View style={styles.errorContainer}>
              <Icon name="error" size={60} color="#e74c3c" />
              <Text style={[styles.errorText, dynamicStyles.text]}>
                {t('errorGeneratingQR')}
              </Text>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3498db' }]}
              onPress={shareQR}
              disabled={!qrValue}
            >
              <Icon name="share" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t('share')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
              onPress={saveQR}
              disabled={!qrValue}
            >
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t('save')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
              onPress={verifyQR}
              disabled={!qrValue}
            >
              <Icon name="verified-user" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t('verify')}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedTransaction(null);
              setQrValue('');
              setQrSecurityToken('');
            }}
          >
            <Text style={[styles.backButtonText, { color: '#3498db' }]}>
              {t('back')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>
            {t('recentTransactions')}
          </Text>
          
          <ScrollView style={styles.transactionsList}>
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <TouchableOpacity 
                  key={transaction.id}
                  style={[styles.transactionItem, dynamicStyles.card]}
                  onPress={() => selectTransaction(transaction)}
                >
                  <View style={styles.transactionIcon}>
                    <Icon 
                      name="receipt" 
                      size={24} 
                      color={theme === 'dark' ? '#3498db' : '#2980b9'} 
                    />
                  </View>
                  
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionReference, dynamicStyles.text]}>
                      {transaction.reference}
                    </Text>
                    
                    <Text style={[styles.transactionDate, dynamicStyles.detailLabel]}>
                      {transaction.date}
                    </Text>
                  </View>
                  
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amountText,
                      { color: theme === 'dark' ? '#2ecc71' : '#27ae60' }
                    ]}>
                      ${transaction.amount}
                    </Text>
                    
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: theme === 'dark' ? '#2ecc71' : '#27ae60' }
                    ]}>
                      <Text style={styles.statusText}>{t('completed')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="receipt-long" size={60} color="#bdc3c7" />
                <Text style={[styles.emptyText, dynamicStyles.text]}>
                  {t('noTransactionsFound')}
                </Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    padding:16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingTop:30
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transactionIcon: {
    marginRight: 16,
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionReference: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    
  },
  qrCard: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transactionDetails: {
    width: '100%',
    marginTop: 20,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  securityToken: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default QRTransactions;
