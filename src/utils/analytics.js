/**
 * NatureSip Simple Analytics & Event Tracker
 * 
 * In a real-world scenario, this would connect to Segment, Google Analytics, 
 * or a custom back-end. For this premium hostable app, it logs to the console 
 * and maintains a local session log.
 */

const ANALYTICS_ENABLED = true;

export const trackEvent = (eventName, properties = {}) => {
    if (!ANALYTICS_ENABLED) return;

    const timestamp = new Date().toISOString();
    const eventData = {
        event: eventName,
        properties: properties,
        timestamp: timestamp,
        url: window.location.href
    };

    // 1. Console Logging (for debugging)
    console.log(`[Analytics] ${eventName}:`, eventData);

    // 2. Persistence in SessionStorage (Internal tracking for current session)
    const sessionLog = JSON.parse(sessionStorage.getItem('ns_analytics_log') || '[]');
    sessionLog.push(eventData);
    sessionStorage.setItem('ns_analytics_log', JSON.stringify(sessionLog));

    // 3. Integration Point
    // Example: window.gtag('event', eventName, properties);
};

export const trackPageView = (pageName) => {
    trackEvent('page_view', { page: pageName });
};

export const getSessionAnalytics = () => {
    return JSON.parse(sessionStorage.getItem('ns_analytics_log') || '[]');
};
