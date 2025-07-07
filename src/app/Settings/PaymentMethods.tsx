// PaymentMethods.tsx - Nuevo componente para medios de pago
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert , BackHandler} from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { useLanguage } from '../../utils/LanguageContext';
import BackButton from '../../utils/BackButton';
import { useRouter } from 'expo-router';

function PaymentMethods  ()  {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Lista de métodos de pago con sus logotipos
  const paymentMethods = [
    { 
      id: 'credit', 
      name: t('creditCard'), 
      icon: 'credit-card',
      logo: 'https://cdn-icons-png.flaticon.com/512/196/196578.png'
    },
    { 
      id: 'debit', 
      name: t('debitCard'), 
      icon: 'credit-card',
      logo: 'https://cdn-icons-png.flaticon.com/512/179/179457.png'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: 'account-balance-wallet',
      logo: 'https://cdn-icons-png.flaticon.com/512/174/174861.png'
    },
    { 
      id: 'bank', 
      name: t('bankTransfer'), 
      icon: 'account-balance',
      logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png'
    },
    { 
      id: 'cash', 
      name: t('cash'), 
      icon: 'attach-money',
      logo: 'https://cdn-icons-png.flaticon.com/512/639/639365.png'
    },
    { 
      id: 'yape', 
      name: 'Yape', 
      icon: 'smartphone',
      logo: 'https://marketing-peru.beglobal.biz/wp-content/uploads/2024/06/1-yape-logo-transparencia-2.png'
    },
    { 
      id: 'plin', 
      name: 'Plin', 
      icon: 'smartphone',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN94zsmpdqN7p2ugqBBrPygthpvfIsDB4QJA&s'
    }
  ];
  useEffect(() => {
      const backAction = () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
        return true;
      };
  
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
  
      return () => backHandler.remove();
    }, [router]);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedMethod(id);
  };
  const dynamicStyles = {
    
    text: {
      color: theme === 'dark' ? '#fff' : '#000',
      
    },
    
  };

  const handleSubmit = () => {
    // Validación básica según el método seleccionado
    if (selectedMethod === 'credit' || selectedMethod === 'debit') {
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        Alert.alert(t('error'), t('required'));
        return;
      }
    } else if (selectedMethod === 'bank') {
      if (!accountNumber) {
        Alert.alert(t('error'), t('required'));
        return;
      }
    }
      
    // Simulación de procesamiento exitoso
    Alert.alert(t('success'), t('paymentSuccess'));
    
    // Limpiar formulario
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
    setAccountNumber('');
    setSelectedMethod(null);
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    if (selectedMethod === 'credit' || selectedMethod === 'debit') {
      return (
        
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            {selectedMethod === 'credit' ? t('creditCard') : t('debitCard')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              {t('cardNumber')}
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }
              ]}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="XXXX XXXX XXXX XXXX"
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              {t('cardHolder')}
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }
              ]}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder={t('cardHolder')}
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                {t('expiryDate')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#555' : '#ddd'
                  }
                ]}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
                {t('cvv')}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#555' : '#ddd'
                  }
                ]}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      );
    } else if (selectedMethod === 'bank') {
      return (
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            {t('bankTransfer')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme === 'dark' ? '#fff' : '#000' }]}>
              {t('accountNumber')}
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme === 'dark' ? '#34495e' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#000',
                  borderColor: theme === 'dark' ? '#555' : '#ddd'
                }
              ]}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={t('accountNumber')}
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#888'}
              keyboardType="numeric"
            />
          </View>
        </View>
      );
    } else if (selectedMethod === 'paypal') {
      return (
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            PayPal
          </Text>
          <Text style={[styles.infoText, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
            {t('chatResponse6')}
          </Text>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174861.png' }} 
            style={styles.paypalLogo} 
            resizeMode="contain"
          />
        </View>
      );
    } else if (selectedMethod === 'yape' || selectedMethod === 'plin') {
      const appName = selectedMethod === 'yape' ? 'Yape' : 'Plin';
      return (
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            {appName}
          </Text>
          <Text style={[styles.infoText, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
            {t('chatResponse6')}
          </Text>
          <Image 
            source={{ 
              uri: selectedMethod === 'yape' 
                ? 'https://seeklogo.com/images/Y/yape-logo-8DB3E0B8F5-seeklogo.com.png'
                : 'https://play-lh.googleusercontent.com/Eu_YgH_vKpRdQ-fFNfFVVNAqdemQl2nLhMJKuP9XJjsMHr_RdqoGGLdwMnOjDGDXgpU'
            }} 
            style={styles.appLogo} 
            resizeMode="contain"
          />
          
        </View>
        
      );
    } else {
      return (
        
        <View style={styles.formContainer}>
          
          <Text style={[styles.formTitle, { color: theme === 'dark' ? '#fff' : '#000' }]}>
            {t('cash')}
          </Text>
          <Text style={[styles.infoText, { color: theme === 'dark' ? '#ccc' : '#666' }]}>
            {t('chatResponse6')}
          </Text>
        </View>
        
      );
    }
  };

  return (
    
    
    <View style={[
      styles.container, 
      { backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5' }
    ]}>
       <View style={styles.header}>
        <BackButton 
          onPress={() => router.back()} 
          tintColor={theme === 'dark' ? '#fff' : '#000'} 
        />
        <Text style={[
          styles.headerTitle, 
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>
          {t('Métodos de Pago')}
        </Text>
      </View>
    

      <ScrollView style={styles.content}>
       
        
        <View style={styles.methodsGrid}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                { 
                  backgroundColor: theme === 'dark' ? '#2c3e50' : '#fff',
                  borderColor: selectedMethod === method.id ? '#3498db' : theme === 'dark' ? '#555' : '#ddd'
                },
                selectedMethod === method.id && styles.selectedCard
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
            >
              <Image 
                source={{ uri: method.logo }} 
                style={styles.methodLogo} 
                resizeMode="contain"
              />
              <Text style={[
                styles.methodName, 
                { color: theme === 'dark' ? '#fff' : '#000' }
              ]}>
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderPaymentForm()}

        {selectedMethod && (
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: theme === 'dark' ? '#3498db' : '#2ecc71' }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t('confirm')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16},
 
  content: {
    flex: 1,
    paddingTop:80,
    padding: 40,
  },
 
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  methodCard: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  methodLogo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  
  methodName: {
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoText: {
    marginBottom: 15,
    lineHeight: 20,
  },
  paypalLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  appLogo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
});

export default PaymentMethods;
