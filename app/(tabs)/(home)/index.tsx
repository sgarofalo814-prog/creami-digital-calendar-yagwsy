
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, textStyles, commonStyles } from '@/styles/commonStyles';
import AddEventModal from '@/components/AddEventModal';
import * as Calendar from 'expo-calendar';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

const { width } = Dimensions.get('window');
const DAYS_IN_WEEK = 7;
const CELL_SIZE = (width - 32) / DAYS_IN_WEEK;

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState<string>('undetermined');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    requestCalendarPermissions();
  }, []);

  useEffect(() => {
    if (calendarPermission === 'granted') {
      loadEvents();
    }
  }, [calendarPermission, currentDate]);

  const requestCalendarPermissions = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      setCalendarPermission(status);
      console.log('Calendar permission status:', status);
    } catch (error) {
      console.log('Error requesting calendar permissions:', error);
    }
  };

  const loadEvents = async () => {
    try {
      if (calendarPermission === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        if (calendars.length > 0) {
          // Load events for the current month
          const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

          const calendarIds = calendars.map(cal => cal.id);
          const calendarEvents = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
          
          const formattedEvents: CalendarEvent[] = calendarEvents.map(event => ({
            id: event.id,
            title: event.title,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            description: event.notes || '',
            location: event.location || '',
            allDay: event.allDay || false,
          }));
          
          setEvents(formattedEvents);
          console.log('Loaded events:', formattedEvents.length);
        }
      }
    } catch (error) {
      console.log('Error loading events:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      
      // Check if the date falls within the event's date range
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      return (
        (eventStartDate <= dateEnd && eventEndDate >= dateStart) ||
        (eventStartDate.toDateString() === date.toDateString())
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    console.log('Selected date:', date.toDateString());
  };

  const handleAddEvent = () => {
    if (calendarPermission !== 'granted') {
      Alert.alert(
        'Permessi Calendario',
        'Per aggiungere eventi, è necessario concedere i permessi per accedere al calendario.',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Richiedi Permessi', onPress: requestCalendarPermissions }
        ]
      );
      return;
    }
    
    setShowAddEventModal(true);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const renderCalendarHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateMonth('prev')}
      >
        <IconSymbol name="chevron.left" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.monthButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[textStyles.subtitle, { color: colors.primary }]}>
          {formatMonthYear(currentDate)}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateMonth('next')}
      >
        <IconSymbol name="chevron.right" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderWeekDays = () => {
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    
    return (
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={[textStyles.caption, { fontWeight: '600' }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    
    return (
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={index} style={styles.emptyCell} />;
          }
          
          const isSelected = selectedDate.toDateString() === day.toDateString();
          const isToday = new Date().toDateString() === day.toDateString();
          const dayEvents = getEventsForDate(day);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDayCell,
                isToday && styles.todayCell,
              ]}
              onPress={() => handleDatePress(day)}
            >
              <Text style={[
                textStyles.body,
                { fontSize: 16 },
                isSelected && { color: colors.card },
                isToday && !isSelected && { color: colors.primary, fontWeight: '700' },
              ]}>
                {day.getDate()}
              </Text>
              {hasEvents && (
                <View style={styles.eventIndicatorContainer}>
                  {dayEvents.slice(0, 3).map((_, eventIndex) => (
                    <View 
                      key={eventIndex}
                      style={[
                        styles.eventIndicator,
                        isSelected && { backgroundColor: colors.card },
                        { marginLeft: eventIndex * 2 }
                      ]} 
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <Text style={[
                      styles.moreEventsText,
                      isSelected && { color: colors.card }
                    ]}>
                      +{dayEvents.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSelectedDateEvents = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <View style={styles.eventsSection}>
        <View style={commonStyles.spaceBetween}>
          <Text style={[textStyles.subtitle, { marginBottom: 12 }]}>
            Eventi per {selectedDate.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
          
          <TouchableOpacity 
            onPress={handleAddEvent}
            style={styles.addEventButton}
          >
            <IconSymbol name="plus" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {dayEvents.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <IconSymbol name="calendar" size={48} color={colors.textSecondary} />
            <Text style={[textStyles.caption, { marginTop: 8, textAlign: 'center' }]}>
              Nessun evento per questa data
            </Text>
            <TouchableOpacity 
              onPress={handleAddEvent}
              style={styles.addFirstEventButton}
            >
              <Text style={[textStyles.body, { color: colors.primary, fontWeight: '600' }]}>
                Aggiungi il primo evento
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          dayEvents.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={[textStyles.body, { fontWeight: '600', flex: 1 }]}>
                  {event.title}
                </Text>
                {!event.allDay && (
                  <Text style={textStyles.caption}>
                    {event.startDate.toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {' - '}
                    {event.endDate.toLocaleTimeString('it-IT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                )}
                {event.allDay && (
                  <Text style={[textStyles.caption, { color: colors.accent }]}>
                    Tutto il giorno
                  </Text>
                )}
              </View>
              {event.description && (
                <Text style={[textStyles.caption, { marginTop: 4 }]}>
                  {event.description}
                </Text>
              )}
              {event.location && (
                <View style={[commonStyles.row, { marginTop: 4 }]}>
                  <IconSymbol name="location" size={14} color={colors.textSecondary} />
                  <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                    {event.location}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Stack.Screen
        options={{
          title: 'Calendario Digitale',
          headerRight: () => (
            <TouchableOpacity onPress={handleAddEvent} style={styles.headerButton}>
              <IconSymbol name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleGoToToday} 
              style={styles.headerButton}
            >
              <IconSymbol name="calendar" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={commonStyles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={commonStyles.content}>
          {/* Calendar Header */}
          {renderCalendarHeader()}
          
          {/* Calendar */}
          <View style={[commonStyles.card, { marginVertical: 16 }]}>
            {renderWeekDays()}
            {renderCalendarGrid()}
          </View>
          
          {/* Selected Date Events */}
          {renderSelectedDateEvents()}
        </View>
      </ScrollView>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCurrentDate(selectedDate);
              setSelectedDate(selectedDate);
            }
          }}
        />
      )}
      
      {/* Add Event Modal */}
      <AddEventModal
        visible={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        selectedDate={selectedDate}
        onEventAdded={loadEvents}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.spaceBetween,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    ...commonStyles.shadow,
  },
  monthButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  weekDaysContainer: {
    ...commonStyles.row,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekDayCell: {
    width: CELL_SIZE,
    ...commonStyles.center,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    ...commonStyles.center,
    borderRadius: 8,
    margin: 2,
    position: 'relative',
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  todayCell: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  eventIndicatorContainer: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  moreEventsText: {
    fontSize: 8,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  eventsSection: {
    marginTop: 16,
  },
  addEventButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.card,
    ...commonStyles.shadow,
  },
  noEventsContainer: {
    ...commonStyles.center,
    paddingVertical: 32,
  },
  addFirstEventButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    ...commonStyles.shadow,
  },
  eventHeader: {
    ...commonStyles.spaceBetween,
    alignItems: 'flex-start',
  },
  headerButton: {
    padding: 8,
  },
});
