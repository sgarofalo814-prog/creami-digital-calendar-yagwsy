
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, textStyles, commonStyles } from '@/styles/commonStyles';
import * as Calendar from 'expo-calendar';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEventDeleted: () => void;
}

export default function EventDetailsModal({ 
  visible, 
  onClose, 
  event,
  onEventDeleted 
}: EventDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const handleDeleteEvent = () => {
    Alert.alert(
      'Elimina Evento',
      `Sei sicuro di voler eliminare "${event.title}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: confirmDeleteEvent 
        }
      ]
    );
  };

  const confirmDeleteEvent = async () => {
    setIsDeleting(true);
    
    try {
      await Calendar.deleteEventAsync(event.id);
      Alert.alert(
        'Successo',
        'Evento eliminato con successo',
        [{ text: 'OK', onPress: () => {
          onEventDeleted();
          onClose();
        }}]
      );
    } catch (error) {
      console.log('Error deleting event:', error);
      Alert.alert('Errore', 'Impossibile eliminare l\'evento');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = () => {
    if (event.allDay) {
      if (event.startDate.toDateString() === event.endDate.toDateString()) {
        return `${formatDate(event.startDate)} - Tutto il giorno`;
      } else {
        return `${formatDate(event.startDate)} - ${formatDate(event.endDate)} (Tutto il giorno)`;
      }
    } else {
      if (event.startDate.toDateString() === event.endDate.toDateString()) {
        return `${formatDate(event.startDate)}\n${formatTime(event.startDate)} - ${formatTime(event.endDate)}`;
      } else {
        return `${formatDate(event.startDate)} ${formatTime(event.startDate)}\n${formatDate(event.endDate)} ${formatTime(event.endDate)}`;
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={commonStyles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <IconSymbol name="xmark" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={textStyles.subtitle}>Dettagli Evento</Text>
          
          <TouchableOpacity 
            onPress={handleDeleteEvent} 
            style={styles.headerButton}
            disabled={isDeleting}
          >
            <IconSymbol 
              name="trash" 
              size={24} 
              color={isDeleting ? colors.textSecondary : colors.error} 
            />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            {/* Event Title */}
            <View style={styles.section}>
              <Text style={[textStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
                {event.title}
              </Text>
            </View>
            
            {/* Date and Time */}
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <IconSymbol name="calendar" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={textStyles.body}>Data e Ora</Text>
                  <Text style={[textStyles.caption, { marginTop: 4, lineHeight: 20 }]}>
                    {formatDateTime()}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Location */}
            {event.location && (
              <View style={[commonStyles.card, { marginBottom: 16 }]}>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <IconSymbol name="location" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={textStyles.body}>Luogo</Text>
                    <Text style={[textStyles.caption, { marginTop: 4 }]}>
                      {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* Description */}
            {event.description && (
              <View style={[commonStyles.card, { marginBottom: 16 }]}>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <IconSymbol name="text.alignleft" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={textStyles.body}>Descrizione</Text>
                    <Text style={[textStyles.caption, { marginTop: 4, lineHeight: 20 }]}>
                      {event.description}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* Event Type */}
            <View style={[commonStyles.card, { marginBottom: 16 }]}>
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <IconSymbol name="tag" size={24} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={textStyles.body}>Tipo</Text>
                  <Text style={[textStyles.caption, { marginTop: 4 }]}>
                    {event.allDay ? 'Evento giornata intera' : 'Evento con orario'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteEvent}
                disabled={isDeleting}
              >
                <IconSymbol name="trash" size={20} color={colors.card} />
                <Text style={[textStyles.body, { color: colors.card, marginLeft: 8 }]}>
                  {isDeleting ? 'Eliminazione...' : 'Elimina Evento'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.spaceBetween,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  detailRow: {
    ...commonStyles.row,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    ...commonStyles.center,
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  actionsContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  actionButton: {
    ...commonStyles.row,
    ...commonStyles.center,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
});
