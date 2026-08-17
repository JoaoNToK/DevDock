'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface GoogleCalendarEventPayload {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export async function syncEventToGoogleCalendarAction(event: GoogleCalendarEventPayload) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; accessToken?: string } | undefined;

  if (!user || !user.accessToken) {
    return {
      success: false,
      reason: 'google_auth_required',
      message: 'Conecte sua conta do Google com permissão ao Google Calendar.',
    };
  }

  const startDateTime = event.startTime ? `${event.date}T${event.startTime}:00` : `${event.date}T09:00:00`;
  const endDateTime = event.endTime ? `${event.date}T${event.endTime}:00` : `${event.date}T10:00:00`;

  const body = {
    summary: event.title,
    description: event.description || 'Evento criado no DevDock',
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData };
    }

    const data = await res.json();
    return { success: true, googleEventId: data.id, htmlLink: data.htmlLink };
  } catch (error) {
    console.error('syncEventToGoogleCalendarAction error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function fetchGoogleCalendarEventsAction() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; accessToken?: string } | undefined;

  if (!user || !user.accessToken) {
    return { success: false, reason: 'google_auth_required', events: [] };
  }

  try {
    const nowISO = new Date().toISOString();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        nowISO
      )}&singleEvents=true&orderBy=startTime&maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const status = res.status;
      if (status === 401 || status === 403) {
        return { success: false, reason: 'google_auth_required', events: [] };
      }
      return { success: false, reason: 'api_error', events: [], status };
    }

    const data = await res.json();
    const items = (data.items || []).map((item: any) => ({
      id: `google-${item.id}`,
      title: item.summary || 'Evento do Google',
      description: item.description || '',
      date: item.start?.dateTime ? item.start.dateTime.split('T')[0] : item.start?.date || '',
      startTime: item.start?.dateTime ? item.start.dateTime.split('T')[1]?.substring(0, 5) : '',
      endTime: item.end?.dateTime ? item.end.dateTime.split('T')[1]?.substring(0, 5) : '',
      category: 'google',
      color: '#4285F4',
      completed: false,
    }));

    return { success: true, events: items };
  } catch (error) {
    console.error('fetchGoogleCalendarEventsAction error:', error);
    return { success: false, events: [], error: (error as Error).message };
  }
}
