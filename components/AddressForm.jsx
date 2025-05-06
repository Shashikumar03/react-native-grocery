import React from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

export default function AddressForm({ formData, onChange, onSave, onCancel, errors, saving, isEdit }) {
  return (
    <View style={styles.modalContainer}>
      <Text style={styles.heading}>{isEdit ? 'Edit Address' : 'Add New Address'}</Text>
      {['address', 'landmark', 'mobile', 'city', 'state', 'pin'].map((field) => (
        <View key={field}>
          <TextInput
            placeholder={field}
            style={[styles.input, errors[field] && { borderColor: 'red', borderWidth: 2 }]}
            value={formData[field]}
            onChangeText={(text) => onChange({ ...formData, [field]: text })}
            keyboardType={['mobile', 'pin'].includes(field) ? 'numeric' : 'default'}
          />
          {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
      ))}
      <Button title={saving ? "Saving..." : "Save"} disabled={saving} onPress={onSave} />
      <Button title="Cancel" color="red" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, padding: 20, marginTop: 30, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#999', padding: 10, marginVertical: 8, borderRadius: 5 },
  errorText: { color: 'red', fontSize: 12 },
});
