import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUIStore } from '../../store/uiStore';
import api from '../../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';

const EVENT_TYPES = ['Hackathon', 'Workshop', 'Competition', 'Seminar', 'Other'];

export default function PostEvent() {
  const router = useRouter();
  const { isDarkMode } = useUIStore();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Hackathon');
  
  // Date & Deadline States
  const [eventDate, setEventDate] = useState<Date>(new Date(Date.now() + 86400000 * 7)); // Default: 7 days from now
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date(Date.now() + 86400000 * 3)); // Default: 3 days from now
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(true);

  const [venue, setVenue] = useState('');
  const [prize, setPrize] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [minTeam, setMinTeam] = useState('2');
  const [maxTeam, setMaxTeam] = useState('4');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Customizable Form Configuration States
  const [formFields, setFormFields] = useState([
    { id: 'full_name', label: 'Full Name', enabled: true, required: true, locked: true },
    { id: 'email', label: 'Email Address', enabled: true, required: true, locked: true },
    { id: 'department', label: 'Department', enabled: true, required: false },
    { id: 'year', label: 'Year / Semester', enabled: true, required: false },
    { id: 'remarks', label: 'Remarks / Motivation', enabled: true, required: false },
    { id: 'portfolio_link', label: 'GitHub / Portfolio Link', enabled: false, required: false }
  ]);
  const [customQuestions, setCustomQuestions] = useState<{ id: string; label: string; required: boolean }[]>([]);

  // Customizable Form Actions
  const toggleFieldEnabled = (id: string) => {
    setFormFields(prev => prev.map(f => f.id === id && !f.locked ? { ...f, enabled: !f.enabled } : f));
  };

  const toggleFieldRequired = (id: string) => {
    setFormFields(prev => prev.map(f => f.id === id && !f.locked ? { ...f, required: !f.required } : f));
  };

  const addCustomQuestion = () => {
    const newId = `q_${Date.now()}`;
    setCustomQuestions(prev => [...prev, { id: newId, label: '', required: false }]);
  };

  const updateCustomQuestionLabel = (id: string, text: string) => {
    setCustomQuestions(prev => prev.map(q => q.id === id ? { ...q, label: text } : q));
  };

  const toggleCustomQuestionRequired = (id: string) => {
    setCustomQuestions(prev => prev.map(q => q.id === id ? { ...q, required: !q.required } : q));
  };

  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  const onEventDateChange = (event: any, selectedDate?: Date) => {
    setShowEventDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onDeadlineChange = (event: any, selectedDate?: Date) => {
    setShowDeadlinePicker(false);
    if (selectedDate) {
      setDeadlineDate(selectedDate);
      setHasDeadline(true);
    }
  };

  // New Double Registration Toggles
  const [registrationType, setRegistrationType] = useState<'internal' | 'external'>('internal');
  const [externalLink, setExternalLink] = useState('');

  const handlePublish = async () => {
    if (!title || !venue) {
      Alert.alert('Error', 'Please fill out Title and Venue!');
      return;
    }

    if (registrationType === 'external' && !externalLink.trim()) {
      Alert.alert('Error', 'Please provide the External Registration URL!');
      return;
    }

    // Build customizable registration form configuration payload
    const customFormConfig = {
      fields: formFields.map(f => ({
        id: f.id,
        label: f.label,
        enabled: f.enabled,
        required: f.required
      })),
      custom_questions: customQuestions.filter(q => q.label.trim() !== '')
    };

    setLoading(true);
    try {
      const response = await api.post('/college/events', {
        title,
        description,
        event_date: eventDate.toISOString(),
        location: venue,
        event_type: eventType,
        tags: [eventType.toLowerCase(), 'tech', 'student'],
        member_limit: maxTeam ? parseInt(maxTeam) : 4,
        reg_deadline: hasDeadline ? deadlineDate.toISOString() : null,
        is_online: isOnline,
        min_team: minTeam ? parseInt(minTeam) : 2,
        max_team: maxTeam ? parseInt(maxTeam) : 4,
        prize_pool: prize,
        registration_type: registrationType,
        external_link: registrationType === 'external' ? externalLink.trim() : null,
        custom_form_config: customFormConfig
      });

      if (response.data?.success) {
        Alert.alert('Success', 'Event posted successfully!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to post event.');
      }
    } catch (error: any) {
      console.error('Failed to post event:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to post event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView 
      className={`flex-1 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
      edges={['top']}
    >
      {/* Top Header */}
      <View className="px-6 py-4 flex-row items-center gap-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className={`w-10 h-10 rounded-2xl items-center justify-center border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? 'white' : '#1E293B'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Post New Event</Text>
      </View>

      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5 pb-10">
          {/* Event Title */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. HackTU 2026"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Event Type Pills */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Type</Text>
            <View className="flex-row gap-2 flex-wrap">
              {EVENT_TYPES.map((type) => {
                const isSelected = eventType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEventType(type)}
                    className={`px-4 py-2.5 rounded-2xl border-2 ${
                      isSelected 
                        ? 'bg-[#10B981] border-[#10B981]' 
                        : isDarkMode 
                          ? 'bg-slate-900 border-slate-800' 
                          : 'bg-white border-slate-100'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${
                      isSelected ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Registration Type Selectors */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registration Mode</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRegistrationType('internal')}
                className={`flex-1 py-3 rounded-2xl border-2 items-center justify-center ${
                  registrationType === 'internal' 
                    ? 'bg-[#10B981] border-[#10B981]' 
                    : isDarkMode 
                      ? 'bg-slate-900 border-slate-800' 
                      : 'bg-white border-slate-100'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  registrationType === 'internal' ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>In-App Direct Apply</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRegistrationType('external')}
                className={`flex-1 py-3 rounded-2xl border-2 items-center justify-center ${
                  registrationType === 'external' 
                    ? 'bg-[#10B981] border-[#10B981]' 
                    : isDarkMode 
                      ? 'bg-slate-900 border-slate-800' 
                      : 'bg-white border-slate-100'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  registrationType === 'external' ? 'text-white' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>External Link URL</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dynamic Registration Form Configurator */}
          {registrationType === 'internal' && (
            <View className={`p-5 rounded-3xl border gap-4 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-100'
            }`}>
              <View>
                <Text className={`text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Customize Student Registration Form
                </Text>
                <Text className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Toggle which profile inputs are required or allowed for this specific event.
                </Text>
              </View>

              {/* standard fields layout grid */}
              <View className="gap-2.5">
                {formFields.map(f => (
                  <View key={f.id} className={`flex-row items-center justify-between p-3 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100 shadow-xs'
                  }`}>
                    <View className="flex-1 mr-2">
                      <Text className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{f.label}</Text>
                      {f.locked && (
                        <Text className="text-[8px] font-bold text-emerald-500 uppercase mt-0.5">Required System Field</Text>
                      )}
                    </View>

                    <View className="flex-row items-center gap-3">
                      {/* Enable Switch */}
                      {!f.locked && (
                        <View className="flex-row items-center gap-1">
                          <Text className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active</Text>
                          <Switch
                            value={f.enabled}
                            onValueChange={() => toggleFieldEnabled(f.id)}
                            trackColor={{ false: '#94A3B8', true: '#10B981' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>
                      )}

                      {/* Required Switch */}
                      {!f.locked && f.enabled && (
                        <View className="flex-row items-center gap-1">
                          <Text className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mandatory</Text>
                          <Switch
                            value={f.required}
                            onValueChange={() => toggleFieldRequired(f.id)}
                            trackColor={{ false: '#94A3B8', true: '#EF4444' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* custom questions section */}
              <View className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <Text className={`text-[10px] font-extrabold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Custom Specific Questions
                </Text>

                {customQuestions.length === 0 ? (
                  <Text className={`text-[10px] italic font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    No custom questions added yet.
                  </Text>
                ) : (
                  <View className="gap-2 mb-3">
                    {customQuestions.map((q, idx) => (
                      <View key={q.id} className={`p-3.5 rounded-2xl border ${
                        isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-white border-slate-100'
                      }`}>
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className={`text-[9px] font-extrabold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Question #{idx + 1}
                          </Text>
                          
                          <TouchableOpacity onPress={() => removeCustomQuestion(q.id)}>
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          value={q.label}
                          onChangeText={(text) => updateCustomQuestionLabel(q.id, text)}
                          placeholder="e.g. Dietary Restrictions or T-shirt Size"
                          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                          className={`p-2.5 rounded-xl border text-[11px] font-semibold mb-2.5 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-150 text-slate-850'
                          }`}
                        />

                        <View className="flex-row items-center justify-end gap-1.5">
                          <Text className={`text-[9px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Make Mandatory</Text>
                          <Switch
                            value={q.required}
                            onValueChange={() => toggleCustomQuestionRequired(q.id)}
                            trackColor={{ false: '#94A3B8', true: '#EF4444' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={addCustomQuestion}
                  activeOpacity={0.8}
                  className={`py-2 px-4 rounded-xl border border-dashed flex-row items-center justify-center gap-1.5 mt-2 ${
                    isDarkMode ? 'border-slate-700 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <Ionicons name="add-circle" size={15} color="#10B981" />
                  <Text className={`text-[10px] font-extrabold ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
                    Add Custom Text Question
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Conditional External Link Input */}
          {registrationType === 'external' && (
            <View>
              <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>External Registration Link</Text>
              <TextInput
                value={externalLink}
                onChangeText={setExternalLink}
                placeholder="e.g. https://apply.college.edu/hackathon"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                autoCapitalize="none"
                keyboardType="url"
                className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                    : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
                }`}
              />
            </View>
          )}

          {/* Date */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Event Date</Text>
            <TouchableOpacity
              onPress={() => setShowEventDatePicker(true)}
              activeOpacity={0.8}
              className={`p-4.5 rounded-2xl border flex-row items-center justify-between ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}
            >
              <View className="flex-row items-center gap-2.5">
                <Ionicons name="calendar" size={18} color="#10B981" />
                <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {eventDate.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Ionicons name="chevron-down-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
            {showEventDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onEventDateChange}
              />
            )}
          </View>

          {/* Venue */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Venue</Text>
            <TextInput
              value={venue}
              onChangeText={setVenue}
              placeholder="e.g. Pulchowk Engineering Campus"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Prize Pool */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Prize Pool</Text>
            <TextInput
              value={prize}
              onChangeText={setPrize}
              placeholder="e.g. NPR 1,00,000"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              }`}
            />
          </View>

          {/* Registration Deadline */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Registration Deadline</Text>
              <Switch
                value={hasDeadline}
                onValueChange={setHasDeadline}
                trackColor={{ false: '#94A3B8', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
            {hasDeadline && (
              <TouchableOpacity
                onPress={() => setShowDeadlinePicker(true)}
                activeOpacity={0.8}
                className={`p-4.5 rounded-2xl border flex-row items-center justify-between ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                <View className="flex-row items-center gap-2.5">
                  <Ionicons name="time" size={18} color="#EF4444" />
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {deadlineDate.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Ionicons name="chevron-down-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            )}
            {hasDeadline && showDeadlinePicker && (
              <DateTimePicker
                value={deadlineDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onDeadlineChange}
              />
            )}
          </View>

          {/* Online Event Switch */}
          <View className={`flex-row items-center justify-between p-4.5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <View>
              <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Online Event</Text>
              <Text className={`text-[10px] font-semibold mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>This event will be hosted virtually</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#94A3B8', true: '#10B981' }}
              thumbColor={isOnline ? '#FFFFFF' : '#F1F5F9'}
            />
          </View>

          {/* Team Size Limits */}
          <View className="flex-row justify-between gap-3">
            <View className="flex-1">
              <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Min Team Size</Text>
              <TextInput
                value={minTeam}
                onChangeText={setMinTeam}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                    : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
                }`}
              />
            </View>
            <View className="flex-1">
              <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Max Team Size</Text>
              <TextInput
                value={maxTeam}
                onChangeText={setMaxTeam}
                keyboardType="numeric"
                placeholder="4"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                    : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
                }`}
              />
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className={`text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide a detailed description of your event..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className={`p-4.5 rounded-2xl border text-sm font-semibold ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-[#10B981]' 
                  : 'bg-white border-slate-100 text-slate-800 focus:border-[#10B981]'
              } h-32`}
            />
          </View>

          {/* Publish Event Button */}
          <TouchableOpacity 
            onPress={handlePublish}
            disabled={loading}
            className="bg-[#10B981] py-4.5 rounded-2xl items-center justify-center mt-3 shadow-md active:bg-emerald-600 flex-row gap-2"
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white text-base font-bold tracking-wide">Publish Event</Text>
                <Ionicons name="cloud-upload-outline" size={16} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
