import React, { useState, useEffect } from "react";
import signalRService from "../SignalR";

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initialize SignalR connection
    signalRService.initConnection().catch((err) => {
      console.error("Failed to connect to SignalR:", err);
    });

    // Add listener for new announcements
    const unsubscribe = signalRService.addListener(
      "notification",
      (notification) => {
        console.log("Received notification in banner:", notification);

        // Check for type: "announcement" OR type: "Order"
        if (
          notification.type === "announcement" ||
          notification.type === "Order"
        ) {
          console.log(
            "Processing notification for banner display:",
            notification
          );

          // Add new announcement to the list
          setAnnouncements((prev) => {
            // Check if this notification already exists
            const exists = prev.some((a) => a.id === notification.id);
            if (!exists) {
              // Add to the beginning of the list
              return [
                {
                  id: notification.id,
                  title: notification.title,
                  description: notification.description || notification.content,
                  timestamp: notification.timestamp,
                },
                ...prev,
              ];
            }
            return prev;
          });

          // Show the banner by resetting dismissed state
          setDismissed(false);

          // Set focus to the new announcement
          setActiveIndex(0);
        }
      }
    );

    // Check local storage for dismissed state
    const dismissedTime = localStorage.getItem("announcementDismissed");
    if (dismissedTime) {
      // If dismissed less than 1 hour ago, keep dismissed
      const now = new Date().getTime();
      if (now - parseInt(dismissedTime) < 60 * 60 * 1000) {
        setDismissed(true);
      } else {
        localStorage.removeItem("announcementDismissed");
      }
    }

    // Clean up on unmount
    return () => {
      unsubscribe(); // Remove the SignalR notification listener
    };
  }, []);

  // Set up auto-rotation for announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    // Auto-rotate announcements every 5 seconds if more than one
    const rotationInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => {
      clearInterval(rotationInterval);
    };
  }, [announcements.length]);

  // If no announcements, don't render
  if (announcements.length === 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(
      "announcementDismissed",
      new Date().getTime().toString()
    );
  };

  const activeAnnouncement = announcements[activeIndex];

  return (
    <div className=" text-white w-full">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex-1">
          <span className="font-bold">{activeAnnouncement.title}</span>
          {activeAnnouncement.description && (
            <>
              {" - "}
              <span>{activeAnnouncement.description}</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {announcements.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev === 0 ? announcements.length - 1 : prev - 1
                  )
                }
                className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
                aria-label="Previous announcement"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>

              <div className="flex space-x-1">
                {announcements.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                      idx === activeIndex
                        ? "bg-white"
                        : "bg-white bg-opacity-50"
                    }`}
                    aria-label={`Announcement ${idx + 1}`}
                    role="button"
                  ></div>
                ))}
              </div>

              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev + 1) % announcements.length)
                }
                className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
                aria-label="Next announcement"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 opacity-75 hover:opacity-100 transition-opacity focus:outline-none"
            aria-label="Dismiss announcement"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
