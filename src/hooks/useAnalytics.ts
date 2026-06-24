import { useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

interface TrackEventData {
  page_path?: string;
  element_id?: string;
  element_text?: string;
  element_type?: string;
  metadata?: Record<string, Json>;
  referrer?: string;
}

export const useAnalytics = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const lastTrackedPath = useRef<string | null>(null);

  const trackEvent = useCallback(async (
    eventType: string,
    data: TrackEventData = {}
  ) => {
    try {
      const eventData = {
        event_type: eventType,
        page_path: data.page_path || location.pathname,
        element_id: data.element_id || null,
        element_text: data.element_text || null,
        element_type: data.element_type || null,
        metadata: (data.metadata || {}) as Json,
        session_id: sessionId.current,
        user_agent: navigator.userAgent,
        referrer: data.referrer || document.referrer || null,
      };

      await supabase.from('analytics_events').insert(eventData);
    } catch (error) {
      console.error('[Analytics] Tracking error:', error);
    }
  }, [location.pathname]);

  const trackClick = useCallback((
    elementType: string,
    elementText: string,
    metadata?: Record<string, Json>
  ) => {
    trackEvent('click', {
      element_type: elementType,
      element_text: elementText,
      metadata,
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((
    buttonText: string,
    metadata?: Record<string, Json>
  ) => {
    trackEvent('button_click', {
      element_type: 'button',
      element_text: buttonText,
      metadata,
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((
    formName: string,
    metadata?: Record<string, Json>
  ) => {
    trackEvent('form_submit', {
      element_type: 'form',
      element_text: formName,
      metadata,
    });
  }, [trackEvent]);

  const trackCrewClick = useCallback((
    crewName: string,
    metadata?: Record<string, Json>
  ) => {
    trackEvent('crew_profile_click', {
      element_type: 'crew_profile',
      element_text: crewName,
      metadata,
    });
  }, [trackEvent]);

  useEffect(() => {
    if (lastTrackedPath.current !== location.pathname) {
      lastTrackedPath.current = location.pathname;
      trackEvent('page_view', {
        page_path: location.pathname,
        referrer: document.referrer,
      });
    }
  }, [location.pathname, trackEvent]);

  return { 
    trackEvent, 
    trackClick, 
    trackButtonClick, 
    trackFormSubmit,
    trackCrewClick 
  };
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useAnalytics();
  return children;
};
