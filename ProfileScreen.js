import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../herramientasDeLaApp/AuthContext';

import ElectricParticles from '../Componentes/ElectricParticles';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const { user, username, email, phone } = useAuth();

  return (
    <SpaceBackground
      backgroundImage={{
        uri: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80'
      }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={100} color="#00FFFF" />
          </View>
          <Text style={styles.title}>PERFIL DE USUARIO</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="person" size={24} color="#00FFFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Usuario</Text>
                <Text style={styles.infoValue}>{username || 'No disponible'}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <Icon name="email" size={24} color="#00FFFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email || 'No disponible'}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <Icon name="phone" size={24} color="#00FFFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{phone || 'No disponible'}</Text>
              </View>
            </View>

            {user && (
              <>
                <View style={styles.separator} />

                <View style={styles.infoRow}>
                  <Icon name="badge" size={24} color="#00FFFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Nombre Completo</Text>
                    <Text style={styles.infoValue}>
                      {`${user.nombre || ''} ${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() || 'No disponible'}
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.infoRow}>
                  <Icon name="credit-card" size={24} color="#00FFFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>DNI</Text>
                    <Text style={styles.infoValue}>{user.dni || 'No disponible'}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>ESTADÍSTICAS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="login" size={30} color="#FFD700" />
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Sesiones</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="security" size={30} color="#00FF00" />
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>Seguridad</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="verified" size={30} color="#0080FF" />
                <Text style={styles.statValue}>✓</Text>
                <Text style={styles.statLabel}>Verificado</Text>
              </View>
            </View>
          </View>
        </View>

        <ElectricParticles count={20} color="#FFD700" />
      </ScrollView>
    </SpaceBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  content: {
    paddingBottom: 30,
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    shadowColor: '#00FFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,255,255,0.2)',
    marginHorizontal: 10,
  },
  statsCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

export default ProfileScreen;

