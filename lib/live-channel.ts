"use client";

import { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { API_BASE_URL } from "@/lib/api-client";
import { getToken } from "@/lib/auth/token";

/** The backend's live channel (FR-INT-05): the signed-in student joins their squad, their school and their own group. */
const LIVE_PATH = "/hubs/live";

type Handlers = Record<string, (payload: never) => void>;

/**
 * Listens on /hubs/live for the given events ("TaskUpdated", "SquadUpdated", "ChatMessage", ...). Returns whether the
 * channel is connected, so a page can fall back to polling when it is not (no backend, a proxy without WebSockets).
 * The handlers may change on every render; the connection stays the same.
 */
export function useLiveChannel(handlers: Handlers, enabled = true): boolean {
  const latest = useRef(handlers);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    latest.current = handlers;
  });

  const events = Object.keys(handlers).sort().join(",");

  useEffect(() => {
    if (!enabled || !API_BASE_URL || !getToken()) return;
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${LIVE_PATH}`, { accessTokenFactory: () => getToken() ?? "" })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    for (const name of events.split(",").filter(Boolean))
      connection.on(name, (payload: never) => latest.current[name]?.(payload));
    connection.onreconnecting(() => setConnected(false));
    connection.onreconnected(() => setConnected(true));
    connection.onclose(() => setConnected(false));

    let stopped = false;
    connection.start().then(
      () => !stopped && setConnected(true),
      () => !stopped && setConnected(false),
    );
    return () => {
      stopped = true;
      if (connection.state !== HubConnectionState.Disconnected) void connection.stop();
    };
  }, [enabled, events]);

  return connected;
}
