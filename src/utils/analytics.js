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

    // 2. Persistence in LocalStorage (Internal tracking for admin dashboard)
    const log = JSON.parse(localStorage.getItem('ns_analytics_log') || '[]');
    log.push(eventData);
    // Keep only last 1000 events to prevent storage bloat
    if (log.length > 1000) log.shift();
    localStorage.setItem('ns_analytics_log', JSON.stringify(log));

    // 3. Integration Point
    // Example: window.gtag('event', eventName, properties);
};

export const trackPageView = (pageName) => {
    trackEvent('page_view', { page: pageName });
};

export const getAnalytics = () => {
    return JSON.parse(localStorage.getItem('ns_analytics_log') || '[]');
};

export const clearAnalytics = () => {
    localStorage.removeItem('ns_analytics_log');
};
