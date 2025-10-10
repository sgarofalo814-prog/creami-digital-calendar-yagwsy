
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, textStyles, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Calendar from 'expo-calendar';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onEventAdded: () => void;
}

export default function AddEventModal({ 
  visible, 
  onClose, 
  selectedDate, 
  onEventAdded 
}: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(new Date(selectedDate.getTime() + 60 * 60 * 1000));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate(selectedDate);
    setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
    setIsAllDay(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Il titolo dell\'evento è obbligatorio');
      return false;
    }
    
    if (endDate <= startDate) {
      Alert.alert('Errore', 'La data di fine deve essere successiva alla data di inizio');
      return false;
    }
    
    return true;
  };

  const handleSaveEvent = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      
      if (!defaultCalendar) {
        Alert.alert('Errore', 'Nessun calendario disponibile per la creazione di eventi');
        return;
      }
      
      const eventData = {
        title: title.trim(),
        startDate: isAllDay ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : startDate,
        endDate: isAllDay ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59) : endDate,
        allDay: isAllDay,
        notes: description.trim(),
        location: location.trim(),
        timeZone: 'Europe/Rome',
      };
      
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventData);
      console.log('Created event with ID:', eventId);
      
      Alert.alert(
        'Successo', 
        'Evento creato con successo!',
        [{ text: 'OK', onPress: () => {
          onEventAdded();
          handleClose();
        }}]
      );
      
    } catch (error) {
      console.log('Error creating event:', error);
      Alert.alert('Errore', 'Impossibile creare l\'evento. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={commonStyles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={[textStyles.body, { color: colors.primary }]}>Annulla</Text>
          </TouchableOpacity>
          
          <Text style={textStyles.subtitle}>Nuovo Evento</Text>
          
          <TouchableOpacity 
            onPress={handleSaveEvent} 
            style={styles.headerButton}
            disabled={isLoading}
          >
            <Text style={[
              textStyles.body, 
              { 
                color: isLoading ? colors.textSecondary : colors.primary,
                fontWeight: '600'
              }
            ]}>
              {isLoading ? 'Salvataggio...' : 'Salva'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
          <View style={commonStyles.content}>
            {/* Title Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Titolo *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Inserisci il titolo dell'evento"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
              />
            </View>
            
            {/* All Day Toggle */}
            <View style={styles.inputSection}>
              <TouchableOpacity 
                style={styles.toggleRow}
                onPress={() => setIsAllDay(!isAllDay)}
              >
                <Text style={styles.label}>Tutto il giorno</Text>
                <View style={[
                  styles.toggle,
                  isAllDay && styles.toggleActive
                ]}>
                  {isAllDay && (
                    <View style={styles.toggleIndicator} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Start Date/Time */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Inizio</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.dateTimeText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                
                {!isAllDay && (
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <IconSymbol name="clock" size={20} color={colors.primary} />
                    <Text style={styles.dateTimeText}>{formatTime(startDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* End Date/Time */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Fine</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.dateTimeText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
                
                {!isAllDay && (
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <IconSymbol name="clock" size={20} color={colors.primary} />
                    <Text style={styles.dateTimeText}>{formatTime(endDate)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Location Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Luogo</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Inserisci il luogo dell'evento"
                placeholderTextColor={colors.textSecondary}
                maxLength={200}
              />
            </View>
            
            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Descrizione</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Inserisci una descrizione dell'evento"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
        
        {/* Date/Time Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
                // Adjust end date if it's before start date
                if (endDate <= selectedDate) {
                  setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
                }
              }
            }}
          />
        )}
        
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={startDate}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
        
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
              if (selectedTime) {
                setStartDate(selectedTime);
                // Adjust end time to be 1 hour later if on same day
                if (startDate.toDateString() === endDate.toDateString()) {
                  setEndDate(new Date(selectedTime.getTime() + 60 * 60 * 1000));
                }
              }
            }}
          />
        )}
        
        {showEndTimePicker && (
          <DateTimePicker
            value={endDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowEndTimePicker(false);
              if (selectedTime) {
                setEndDate(selectedTime);
              }
            }}
          />
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    ...textStyles.body,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleRow: {
    ...commonStyles.spaceBetween,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    alignSelf: 'flex-end',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  dateTimeText: {
    ...textStyles.body,
    marginLeft: 8,
    color: colors.text,
  },
});
