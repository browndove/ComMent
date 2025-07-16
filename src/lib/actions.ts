
'use server';

import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import type { RequestAppointmentInput } from './schemas';
import type { User } from './types';
import { chat, type AssistantInput } from '@/ai/flows/assistant-flow';
import { revalidatePath } from 'next/cache';
import type { Message } from 'genkit';


// Helper to serialize Firestore data, converting Timestamps to ISO strings
const serializeFirestoreData = (doc: any) => {
  const data = doc.data();
  if (!data) return null;

  const serializedData: { [key: string]: any } = { id: doc.id };
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      // Check if the value is a Firestore Timestamp and convert it
      if (value && typeof value.toDate === 'function') {
        serializedData[key] = value.toDate().toISOString();
      } else {
        serializedData[key] = value;
      }
    }
  }
  return serializedData;
};


// Get sessions for a specific student
export async function getStudentSessions(studentId: string, forCounselor: boolean = false) {
  try {
    // Fetch sessions without ordering in the query to avoid composite index requirement
    const q = query(
        collection(db, 'appointments'),
        where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    let sessions = querySnapshot.docs.map(doc => serializeFirestoreData(doc));
    
    // Sort the sessions by date in descending order (newest first) in code
    sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // For counselor view, we might not need to enrich with counselor details again
    if (forCounselor) {
      return { data: sessions };
    }

    // Enrich with counselor details for student view
    const enrichedSessions = await Promise.all(
        sessions.map(async (session: any) => {
            if (session.counselorId) {
                const counselorDoc = await getDoc(doc(db, 'users', session.counselorId));
                if (counselorDoc.exists()) {
                    const counselorData = counselorDoc.data();
                    session.counselor = {
                        name: counselorData.fullName,
                        avatarUrl: counselorData.avatarUrl || null,
                        avatarFallback: counselorData.fullName?.split(" ").map((n:string)=>n[0]).join("") || 'C',
                        specialties: counselorData.specializations || [],
                    };
                }
            }
            // Normalize status for display
            session.status = session.status ? session.status.charAt(0).toUpperCase() + session.status.slice(1) : 'Pending';
            return session;
        })
    );

    return { data: enrichedSessions };
  } catch (error: any) {
    console.error("Error fetching student sessions:", error);
    return { error: error.message };
  }
}

// Get appointments for a specific counselor
export async function getCounselorAppointments(counselorId: string) {
    try {
        const q = query(collection(db, "appointments"), where("counselorId", "==", counselorId));
        const querySnapshot = await getDocs(q);
        let appointments = querySnapshot.docs.map(doc => serializeFirestoreData(doc));
        
        // Sort in-memory to avoid needing a composite index
        appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const enrichedAppointments = await Promise.all(
            appointments.map(async (apt: any) => {
                if (apt.studentId) {
                    const studentDoc = await getDoc(doc(db, 'users', apt.studentId));
                    if (studentDoc.exists()) {
                        apt.studentName = studentDoc.data().fullName;
                        apt.studentAvatarUrl = studentDoc.data().avatarUrl || null;
                    }
                }
                apt.status = apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending';
                return apt;
            })
        );
        return { data: enrichedAppointments };
    } catch (error: any) {
        console.error("Error fetching counselor appointments:", error);
        return { error: error.message };
    }
}

// Update appointment status
export async function updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled') {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { status: status, modifiedAt: serverTimestamp() });
    revalidatePath('/counselor/appointments');
    return { success: true };
  } catch (error: any) {
    console.error("Error updating appointment status:", error);
    return { success: false, error: error.message };
  }
}

// Get students assigned to a counselor
export async function getAssignedStudents(counselorId: string) {
  try {
    // This is a placeholder logic. In a real app, you'd have a specific field
    // linking students to counselors. We'll simulate by checking appointments.
    const appointmentsQuery = query(collection(db, 'appointments'), where('counselorId', '==', counselorId));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const studentIds = new Set(appointmentsSnapshot.docs.map(d => d.data().studentId));

    if (studentIds.size === 0) {
        // If no appointments, maybe there's a direct assignment field
        const usersQuery = query(collection(db, 'users'), where('assignedCounselor', '==', counselorId));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.forEach(d => studentIds.add(d.id));
    }
    
    if (studentIds.size === 0) return { data: [] };

    const studentDocs = await Promise.all(
        Array.from(studentIds).map(id => getDoc(doc(db, 'users', id)))
    );
    
    const studentsData: User[] = studentDocs
        .filter(d => d.exists())
        .map(d => serializeFirestoreData(d)) as User[];

    return { data: studentsData };
  } catch (error: any) {
    console.error("Error fetching assigned students:", error);
    return { error: error.message };
  }
}

// Create a new appointment request
export async function createAppointment(userId: string, data: RequestAppointmentInput) {
  try {
    await addDoc(collection(db, 'appointments'), {
      studentId: userId,
      counselorId: data.counselorId,
      reason: data.reason,
      date: data.preferredDate.toISOString().split('T')[0], // Store date as YYYY-MM-DD string
      time: data.preferredTime,
      contactMethod: data.contactMethod,
      appointmentType: data.appointmentType,
      priority: data.priority,
      referralSource: data.referralSource || null,
      timezone: data.timezone,
      status: 'Pending', // initial status
      createdBy: userId,
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return { error: error.message };
  }
}

// Get all counselors
export async function getCounselors() {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'counselor'));
    const querySnapshot = await getDocs(q);
    const counselors = querySnapshot.docs.map(d => serializeFirestoreData(d));
    return { data: counselors };
  } catch (error: any) {
    console.error("Error fetching counselors:", error);
    return { error: error.message };
  }
}

// Get user's past AI conversations
export async function getUserConversations(userId: string) {
    try {
        const q = query(
            collection(db, 'conversations'),
            where('userId', '==', userId),
        );
        const querySnapshot = await getDocs(q);
        
        const conversations = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Untitled Chat',
                createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date(0).toISOString()
            };
        });

        // Sort in code to avoid composite index
        conversations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { data: conversations.slice(0, 20) };
    } catch (error: any) {
        console.error('Error fetching user conversations:', error);
        return { error: 'Failed to fetch conversation history.' };
    }
}

// Get messages from a specific AI conversation
export async function getConversationMessages(conversationId: string) {
    try {
        const conversationRef = doc(db, 'conversations', conversationId);
        const conversationSnap = await getDoc(conversationRef);
        if (!conversationSnap.exists()) {
            return { error: 'Conversation not found.' };
        }
        
        // In a real app, you would add a security rule check here to ensure
        // the currently logged-in user owns this conversation.

        const q = query(
            collection(conversationRef, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text,
            sender: doc.data().sender,
        }));
        return { messages };
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return { error: 'Failed to load messages for this conversation.' };
    }
}

export async function sendMessageToAi(
  conversationId: string | null,
  userId: string,
  message: string
) {
  try {
    let convoId = conversationId;
    let newConversationId: string | undefined = undefined;
    const conversationCollection = collection(db, 'conversations');
    let conversationRef;

    // If no conversationId, create a new conversation
    if (!convoId) {
      const newConvo = await addDoc(conversationCollection, {
        title: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
        createdAt: serverTimestamp(),
        userId: userId,
      });
      convoId = newConvo.id;
      newConversationId = convoId;
      conversationRef = doc(conversationCollection, convoId);
    } else {
      conversationRef = doc(conversationCollection, convoId);
    }
    
    // Fetch previous messages for context
    const messagesQuery = query(
      collection(conversationRef, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(20) 
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const history: Message[] = messagesSnapshot.docs.reverse().map(doc => {
      const data = doc.data();
      return { role: data.sender === 'user' ? 'user' : 'model', content: data.text };
    });

    // Call Genkit flow
    const aiResponse = await chat({ message, history });

    // Save messages to Firestore in a batch
    const batch = writeBatch(db);
    const userMessageRef = doc(collection(conversationRef, 'messages'));
    const aiMessageRef = doc(collection(conversationRef, 'messages'));

    batch.set(userMessageRef, {
      text: message,
      sender: 'user',
      createdAt: serverTimestamp(),
    });

    batch.set(aiMessageRef, {
      text: aiResponse,
      sender: 'ai',
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    // Revalidate the path if a new conversation was created
    if(newConversationId) {
        revalidatePath('/student/ai-assistant');
    }

    return {
      success: true,
      aiResponse,
      newConversationId,
      userMessageId: userMessageRef.id,
      aiMessageId: aiMessageRef.id,
    };
  } catch (error: any) {
    console.error('Error sending message to AI:', error);
    return { error: 'Failed to get a response from the AI assistant.' };
  }
}
