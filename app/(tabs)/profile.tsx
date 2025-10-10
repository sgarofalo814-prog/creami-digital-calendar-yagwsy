
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, textStyles, commonStyles } from '@/styles/commonStyles';
import * as Calendar from 'expo-calendar';

export default function ProfileScreen() {
  const [calendarPermission, setCalendarPermission] = useState<string>('undetermined');
  const [availableCalendars, setAvailableCalendars] = useState<Calendar.Calendar[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(true);
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadCalendars();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      setCalendarPermission(status);
      console.log('Current calendar permission:', status);
    } catch (error) {
      console.log('Error checking permissions:', error);
    }
  };

  const loadCalendars = async () => {
    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setAvailableCalendars(calendars);
        console.log('Available calendars:', calendars.length);
      }
    } catch (error) {
      console.log('Error loading calendars:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setCalendarPermission(status);
      if (status === 'granted') {
        loadCalendars();
        Alert.alert('Successo', 'Permessi concessi con successo!');
      } else {
        Alert.alert(
          'Permessi Negati',
          'Per utilizzare tutte le funzionalità del calendario, è necessario concedere i permessi nelle impostazioni del dispositivo.'
        );
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
      Alert.alert('Errore', 'Impossibile richiedere i permessi');
    }
  };

  const getPermissionStatusText = () => {
    switch (calendarPermission) {
      case 'granted':
        return 'Concessi';
      case 'denied':
        return 'Negati';
      case 'undetermined':
        return 'Non richiesti';
      default:
        return 'Sconosciuto';
    }
  };

  const getPermissionStatusColor = () => {
    switch (calendarPermission) {
      case 'granted':
        return colors.success;
      case 'denied':
        return colors.error;
      case 'undetermined':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <IconSymbol name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={textStyles.body}>{title}</Text>
        <Text style={textStyles.caption}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.card : colors.textSecondary}
      />
    </View>
  );

  const renderCalendarItem = (calendar: Calendar.Calendar) => (
    <View key={calendar.id} style={styles.calendarItem}>
      <View style={[styles.calendarColor, { backgroundColor: calendar.color || colors.primary }]} />
      <View style={styles.calendarInfo}>
        <Text style={textStyles.body}>{calendar.title}</Text>
        <Text style={textStyles.caption}>
          {calendar.source.name} • {calendar.allowsModifications ? 'Modificabile' : 'Solo lettura'}
        </Text>
      </View>
      <IconSymbol 
        name={calendar.allowsModifications ? 'checkmark.circle' : 'eye'} 
        size={20} 
        color={calendar.allowsModifications ? colors.success : colors.textSecondary} 
      />
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
        <View style={commonStyles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={textStyles.title}>Impostazioni Calendario</Text>
            <Text style={textStyles.caption}>
              Gestisci le tue preferenze e i permessi del calendario
            </Text>
          </View>

          {/* Permissions Section */}
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[textStyles.subtitle, { marginBottom: 16 }]}>Permessi</Text>
            
            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Text style={textStyles.body}>Accesso al Calendario</Text>
                <Text style={[
                  textStyles.caption,
                  { color: getPermissionStatusColor(), fontWeight: '600' }
                ]}>
                  {getPermissionStatusText()}
                </Text>
              </View>
              
              {calendarPermission !== 'granted' && (
                <TouchableOpacity 
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={[textStyles.body, { color: colors.primary, fontWeight: '600' }]}>
                    Richiedi
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {calendarPermission === 'granted' && (
              <View style={styles.permissionSuccess}>
                <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
                <Text style={[textStyles.caption, { marginLeft: 8 }]}>
                  L'app può accedere ai tuoi calendari e creare eventi
                </Text>
              </View>
            )}
          </View>

          {/* Calendar Settings */}
          <View style={[commonStyles.card, { marginBottom: 16 }]}>
            <Text style={[textStyles.subtitle, { marginBottom: 16 }]}>Preferenze</Text>
            
            {renderSettingItem(
              'Notifiche',
              'Ricevi notifiche per gli eventi imminenti',
              notifications,
              setNotifications,
              'bell'
            )}
            
            {renderSettingItem(
              'Settimana inizia di Lunedì',
              'La settimana inizia il lunedì invece della domenica',
              weekStartsOnMonday,
              setWeekStartsOnMonday,
              'calendar'
            )}
            
            {renderSettingItem(
              'Mostra numeri settimana',
              'Visualizza i numeri delle settimane nel calendario',
              showWeekNumbers,
              setShowWeekNumbers,
              'number'
            )}
          </View>

          {/* Available Calendars */}
          {availableCalendars.length > 0 && (
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <Text style={[textStyles.subtitle, { marginBottom: 16 }]}>
                Calendari Disponibili ({availableCalendars.length})
              </Text>
              
              {availableCalendars.map(renderCalendarItem)}
            </View>
          )}

          {/* App Info */}
          <View style={[commonStyles.card, { marginBottom: 32 }]}>
            <Text style={[textStyles.subtitle, { marginBottom: 16 }]}>Informazioni App</Text>
            
            <View style={styles.infoItem}>
              <IconSymbol name="info.circle" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={textStyles.body}>Calendario Digitale</Text>
                <Text style={textStyles.caption}>
                  Un'app moderna per gestire i tuoi eventi e appuntamenti
                </Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <IconSymbol name="gear" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={textStyles.body}>Versione</Text>
                <Text style={textStyles.caption}>1.0.0</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <IconSymbol name="heart" size={20} color={colors.secondary} />
              <View style={styles.infoContent}>
                <Text style={textStyles.body}>Sviluppato con</Text>
                <Text style={textStyles.caption}>React Native & Expo</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  permissionItem: {
    ...commonStyles.spaceBetween,
    paddingVertical: 8,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  permissionSuccess: {
    ...commonStyles.row,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingItem: {
    ...commonStyles.row,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    ...commonStyles.center,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  calendarItem: {
    ...commonStyles.row,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calendarColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  calendarInfo: {
    flex: 1,
  },
  infoItem: {
    ...commonStyles.row,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
});
