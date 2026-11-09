
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Platform
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as MailComposer from 'expo-mail-composer';

export default function App() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [job, setJob] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [history, setHistory] = useState([]);

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setResume(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Unable to select resume.');
    }
  };

  const generateEmail = () => {
    if (!name.trim() || !company.trim() ||
        !job.trim() || !email.trim()) {
      Alert.alert('Missing Details', 'Please fill all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Enter a valid recruiter email.');
      return;
    }

    const body = `Dear Hiring Manager,

I hope you are doing well.

I am writing to express my interest in the ${job} position at ${company}.

I believe my skills and experience make me a suitable candidate for this opportunity.

Please find my resume attached for your consideration.

I would appreciate the opportunity to discuss my application.

Thank you for your time.

Best regards,
${name}`;

    setMessage(body);
    setPreview(true);
  };

  const sendApplication = async () => {
    if (!resume) {
      Alert.alert('Resume Required', 'Please select your resume PDF.');
      return;
    }

    if (!message) return;

    if (Platform.OS === 'web') {
      Alert.alert(
        'Android Required',
        'Please use an Android build to open the email composer with your PDF attachment.'
      );
      return;
    }

    try {
      const available = await MailComposer.isAvailableAsync();

      if (!available) {
        Alert.alert('Unavailable', 'No email composer is available.');
        return;
      }

      const result = await MailComposer.composeAsync({
        recipients: [email.trim()],
        subject: `Application for ${job} - ${company}`,
        body: message + (linkedin ? `\n\nJob Link:\n${linkedin}` : ''),
        attachments: [resume.uri]
      });

      if (result.status === 'sent') {
        setHistory(old => [
          {
            job,
            company,
            date: new Date().toLocaleDateString()
          },
          ...old
        ]);

        Alert.alert('Success', 'Email composer reported the message as sent.');
      } else if (result.status === 'saved') {
        Alert.alert('Saved', 'Email saved as a draft.');
      } else {
        Alert.alert('Cancelled', 'Email was not confirmed as sent.');
      }

    } catch (error) {
      Alert.alert('Error', 'Unable to open email composer.');
    }
  };

  const resetForm = () => {
    setCompany('');
    setJob('');
    setEmail('');
    setLinkedin('');
    setMessage('');
    setPreview(false);
  };

  const Field = ({ label, placeholder, value, onChangeText, keyboardType }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >

      <View style={styles.header}>
        <Text style={styles.logo}>✉️ JobMail</Text>
        <Text style={styles.headerSub}>
          Your Job Application Assistant
        </Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Apply Smarter.</Text>
        <Text style={styles.heroBlue}>Get Noticed.</Text>
        <Text style={styles.description}>
          Create professional job application emails in seconds.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Field
          label="Full Name *"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.sectionTitle}>Job Details</Text>

        <Field
          label="Company Name *"
          placeholder="e.g. Google"
          value={company}
          onChangeText={setCompany}
        />

        <Field
          label="Job Title *"
          placeholder="e.g. Software Developer"
          value={job}
          onChangeText={setJob}
        />

        <Field
          label="Recruiter Email *"
          placeholder="recruiter@company.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Field
          label="LinkedIn Job URL"
          placeholder="Paste LinkedIn job link"
          value={linkedin}
          onChangeText={setLinkedin}
        />

        <Text style={styles.sectionTitle}>Your Resume</Text>

        <TouchableOpacity
          style={styles.resumeBox}
          onPress={pickResume}
        >
          <Text style={styles.resumeIcon}>📄</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeTitle}>
              {resume ? resume.name : 'Upload Resume PDF'}
            </Text>
            <Text style={styles.resumeSub}>
              {resume ? 'PDF selected' : 'Choose your resume'}
            </Text>
          </View>
          <Text style={styles.upload}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={generateEmail}
        >
          <Text style={styles.primaryText}>
            ✉ Generate Application Email
          </Text>
        </TouchableOpacity>
      </View>

      {preview && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Email Preview</Text>

          <Text style={styles.previewLabel}>TO</Text>
          <Text style={styles.previewValue}>{email}</Text>

          <Text style={styles.previewLabel}>SUBJECT</Text>
          <Text style={styles.previewValue}>
            Application for {job} - {company}
          </Text>

          <Text style={styles.previewLabel}>MESSAGE (EDITABLE)</Text>

          <TextInput
            style={styles.messageBox}
            multiline
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <View style={styles.attachment}>
            <Text>📎 {resume ? resume.name : 'No resume selected'}</Text>
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendApplication}
          >
            <Text style={styles.primaryText}>
              Open Email Composer →
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Check the recipient, message and PDF attachment.
            Press Send inside your email application.
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetForm}
          >
            <Text style={styles.resetText}>+ New Application</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Application History</Text>

        {history.length === 0 ? (
          <Text style={styles.empty}>
            No application activity yet.
          </Text>
        ) : (
          history.map((item, index) => (
            <View style={styles.historyItem} key={index}>
              <Text style={styles.historyIcon}>💼</Text>
              <View>
                <Text style={styles.historyJob}>{item.job}</Text>
                <Text style={styles.historyCompany}>
                  {item.company} · {item.date}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.footer}>
        JobMail © 2026 | Your Next Opportunity Starts Here
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'web' ? 25 : 45
  },
  header: {
    marginBottom: 30
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB'
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5
  },
  hero: {
    marginBottom: 25
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827'
  },
  heroBlue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB'
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 17
  },
  field: {
    marginBottom: 15
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF'
  },
  resumeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    gap: 12
  },
  resumeIcon: {
    fontSize: 27
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF'
  },
  resumeSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5
  },
  upload: {
    fontSize: 25,
    color: '#2563EB'
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    padding: 17,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 22
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },
  previewLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15
  },
  previewValue: {
    color: '#111827',
    fontSize: 14,
    marginTop: 6
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 13,
    minHeight: 240,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151'
  },
  attachment: {
    backgroundColor: '#EFF6FF',
    padding: 13,
    borderRadius: 9,
    marginTop: 15
  },
  sendButton: {
    backgroundColor: '#16A34A',
    padding: 17,
    borderRadius: 11,
    alignItems: 'center',
    marginTop: 18
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 12
  },
  resetButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8
  },
  resetText: {
    color: '#2563EB',
    fontWeight: 'bold'
  },
  empty: {
    color: '#94A3B8',
    fontSize: 13,
    paddingVertical: 10
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  historyIcon: {
    fontSize: 23
  },
  historyJob: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 14
  },
  historyCompany: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 20
  }
});
