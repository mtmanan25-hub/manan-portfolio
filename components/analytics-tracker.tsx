"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const VISITOR_KEY = "manan_visitor_id";

export default function AnalyticsTracker() {
    useEffect(() => {
        async function trackVisitor() {
            try {
                // Check if this browser already has a visitor ID
                let visitorId = localStorage.getItem(VISITOR_KEY);

                // If this is a new visitor, create an ID
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem(VISITOR_KEY, visitorId);
                } else {
                    // Already counted this visitor
                    return;
                }

                // Don't count admin pages as public visits
                if (window.location.pathname.startsWith("/admin")) {
                    return;
                }

                const supabase = createClient();

                const { error } = await supabase
                    .from("site_visits")
                    .insert({
                        visitor_id: visitorId,
                        path: window.location.pathname,
                        referrer: document.referrer || null,
                        user_agent: navigator.userAgent,
                        device_type: getDeviceType(),
                    });

                if (error) {
                    console.error("Analytics error:", error);
                }
            } catch (error) {
                console.error("Analytics error:", error);
            }
        }

        trackVisitor();
    }, []);

    return null;
}

function getDeviceType() {
    const width = window.innerWidth;

    if (width < 768) {
        return "mobile";
    }

    if (width < 1024) {
        return "tablet";
    }

    return "desktop";
}